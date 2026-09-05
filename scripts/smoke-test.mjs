#!/usr/bin/env node

// Rode este teste após qualquer deploy para garantir que nada quebrou.
// Uso: npm run smoke-test

import { readFileSync } from "node:fs";

const BASE_URL = (process.env.SMOKE_TEST_BASE_URL || "https://plataforma-ugc.vercel.app").replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = 15_000;
const pages = [
  "/criadora", "/criadora/catalogo", "/criadora/enviar", "/criadora/meus-videos",
  "/criadora/ganhos", "/criadora/academy", "/admin", "/admin/aprovacoes",
  "/admin/trending", "/admin/config", "/admin/links", "/admin/usuarios", "/admin/criadoras",
];
const apiPaths = [
  "/api/shopee/trending", "/api/shopee/trending-list", "/api/shopee/trending-approved", "/api/videos",
];
const results = [];

function loadLocalEnv() {
  try {
    const env = readFileSync(".env.local", "utf8");
    for (const line of env.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match || process.env[match[1]] !== undefined) continue;
      process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
    }
  } catch {
    // Credentials are only required for the endpoint-to-Supabase part of the test.
  }
}

function record(name, passed, detail = "", critical = false) {
  results.push({ name, passed, detail, critical });
  console.log(`${passed ? "✅" : "❌"} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${BASE_URL}${path}`, { ...options, redirect: "follow", signal: controller.signal });
    const text = await response.text();
    let body;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }
    return { response, body };
  } finally {
    clearTimeout(timer);
  }
}

async function testPages() {
  await Promise.all(pages.map(async (path) => {
    try {
      const { response } = await request(path);
      record(`Página ${path}`, response.status === 200, `HTTP ${response.status}`, true);
    } catch (error) {
      record(`Página ${path}`, false, error instanceof Error ? error.message : String(error), true);
    }
  }));
}

async function testApis() {
  await Promise.all(apiPaths.map(async (path) => {
    try {
      const { response } = await request(path);
      record(`API ${path}`, response.status !== 500, `HTTP ${response.status}`);
    } catch (error) {
      record(`API ${path}`, false, error instanceof Error ? error.message : String(error));
    }
  }));
}

async function supabaseRequest(path, options = {}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error("NEXT_PUBLIC_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/${path}`, {
      ...options,
      signal: controller.signal,
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", ...(options.headers || {}) },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function testVideoFlow() {
  const marker = `smoke-test-${Date.now()}`;
  const videoUrl = `https://${marker}.invalid/video.mp4`;
  let videoId;
  let flowError;
  try {
    const created = await request("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creator_id: `${marker}-creator`, product_id: `${marker}-product`, product_link_base: "https://shopee.com.br/smoke-test-product", video_url: videoUrl }),
    });
    if (created.response.status !== 201 || !created.body?.video_id) throw new Error(`POST /api/videos retornou HTTP ${created.response.status}`);
    videoId = String(created.body.video_id);

    const rowResponse = await supabaseRequest(`videos_ugc?id=eq.${encodeURIComponent(videoId)}&select=video_url,affiliate_link_bruto,moderation_status`);
    const rows = await rowResponse.json();
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!rowResponse.ok || !row) throw new Error(`consulta Supabase falhou (HTTP ${rowResponse.status})`);
    if (row.video_url !== videoUrl) throw new Error(`video_url divergente: ${String(row.video_url)}`);
    if (!String(row.affiliate_link_bruto || "").includes(videoId)) throw new Error("affiliate_link_bruto não contém o video_id");
    if (row.moderation_status !== "pendente") throw new Error(`moderation_status inicial: ${String(row.moderation_status)}`);

    const approved = await request(`/api/videos/${encodeURIComponent(videoId)}/aprovar`, { method: "POST" });
    if (approved.response.status !== 200 || approved.body?.video?.moderation_status !== "aprovado") throw new Error(`aprovação retornou HTTP ${approved.response.status}`);
    record("Fluxo de vídeo ponta a ponta", true, `criado, validado, aprovado e será removido (${videoId})`, true);
  } catch (error) {
    flowError = error instanceof Error ? error.message : String(error);
    record("Fluxo de vídeo ponta a ponta", false, flowError, true);
  } finally {
    if (videoId) {
      try {
        const deleted = await supabaseRequest(`videos_ugc?id=eq.${encodeURIComponent(videoId)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
        if (!deleted.ok) console.error(`⚠️ Limpeza do vídeo ${videoId} falhou (HTTP ${deleted.status})`);
      } catch (error) {
        console.error(`⚠️ Limpeza do vídeo ${videoId} falhou: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  return !flowError;
}

async function testConfig() {
  try {
    const { response, body } = await request("/api/admin/config");
    const value = body?.config?.repasse_organico_percent;
    record("Config financeira", response.status === 200 && value !== undefined, `HTTP ${response.status}${value !== undefined ? `, repasse_organico_percent=${value}` : ""}`);
  } catch (error) {
    record("Config financeira", false, error instanceof Error ? error.message : String(error));
  }
}

async function testTrendingFlow() {
  let product;
  try {
    const { response, body } = await request("/api/shopee/trending-list");
    if (!response.ok) throw new Error(`trending-list retornou HTTP ${response.status}`);
    product = (Array.isArray(body?.products) ? body.products : []).find((item) => item?.status === "pending");
    if (!product) {
      record("Trending approval flow", true, "nenhum produto pending disponível; nada alterado");
      return;
    }
    const approved = await request(`/api/shopee/trending/${encodeURIComponent(product.id)}/approve`, { method: "POST" });
    if (!approved.response.ok || approved.body?.product?.status !== "approved") throw new Error(`approve retornou HTTP ${approved.response.status}`);
    const reset = await request(`/api/shopee/trending/${encodeURIComponent(product.id)}/reset`, { method: "POST" });
    if (!reset.response.ok || reset.body?.product?.status !== "pending") throw new Error(`reset retornou HTTP ${reset.response.status}`);
    record("Trending approval flow", true, `produto ${product.id} voltou a pending`);
  } catch (error) {
    record("Trending approval flow", false, error instanceof Error ? error.message : String(error));
    if (product?.id) {
      try { await request(`/api/shopee/trending/${encodeURIComponent(product.id)}/reset`, { method: "POST" }); } catch { /* best effort rollback */ }
    }
  }
}

async function main() {
  loadLocalEnv();
  console.log(`\nSmoke test: ${BASE_URL}\n`);
  await testPages();
  await testApis();
  await testVideoFlow();
  await testConfig();
  await testTrendingFlow();
  const passed = results.filter((result) => result.passed).length;
  const failed = results.length - passed;
  const criticalFailed = results.some((result) => result.critical && !result.passed);
  console.log(`\nResultado: ${passed} passaram, ${failed} falharam (${results.length} testes).`);
  if (failed) console.log(`Falhas críticas: ${results.filter((result) => result.critical && !result.passed).length}`);
  process.exitCode = criticalFailed ? 1 : 0;
}

main().catch((error) => {
  console.error(`❌ Smoke test abortado: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
