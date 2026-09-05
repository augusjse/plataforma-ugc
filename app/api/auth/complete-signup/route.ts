import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import { normalizePhone, validatePhone } from "@/lib/phone-validation";

const endpoint = "/api/auth/complete-signup";
type SignupBody = { name?: string; phone?: string; countryCode?: string };

async function saveLog({ status, requestBody, response, errorMessage }: {
  status: "error" | "success";
  requestBody: unknown;
  response: unknown;
  errorMessage?: string | null;
}) {
  try {
    const { error } = await supabaseAdmin.from("api_logs").insert({
      endpoint, method: "POST", status, error_message: errorMessage ?? null,
      request_body: requestBody ?? null, response: response ?? null,
    });
    if (error) console.error("api_logs insert failed", error);
  } catch (error) {
    console.error("api_logs insert failed", error);
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function POST(request: Request) {
  let body: SignupBody | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      const response = { error: "Não autenticado" };
      await saveLog({ status: "error", requestBody: body, response, errorMessage: response.error });
      return NextResponse.json(response, { status: 401 });
    }

    body = await request.json() as SignupBody;
    console.log("Request body:", body);
    const name = body.name?.trim();
    const countryCode = body.countryCode?.trim();
    const phoneError = validatePhone(countryCode ?? "", body.phone ?? "");
    const errors = { name: !name ? "Dados incompletos" : null, phone: phoneError };
    console.log("Validation errors:", errors);
    if (errors.name || errors.phone) {
      const response = { error: errors.name ?? errors.phone };
      await saveLog({ status: "error", requestBody: body, response, errorMessage: response.error });
      return NextResponse.json(response, { status: 400 });
    }

    const result = await supabaseAdmin.from("users")
      .update({ name, phone: normalizePhone(countryCode!, body.phone!) })
      .or(`id.eq.${user.id},email.eq.${user.email}`).select("id").maybeSingle();
    console.log("DB save result:", result);
    if (result.error) {
      console.error("complete-signup update failed", result.error);
      const response = { error: "Não foi possível salvar" };
      await saveLog({ status: "error", requestBody: body, response, errorMessage: result.error.message });
      return NextResponse.json(response, { status: 500 });
    }
    if (!result.data) {
      const response = { error: "Usuário não encontrado" };
      await saveLog({ status: "error", requestBody: body, response, errorMessage: response.error });
      return NextResponse.json(response, { status: 404 });
    }

    const response = { redirect: "/criadora" };
    await saveLog({ status: "success", requestBody: body, response });
    return NextResponse.json(response);
  } catch (error) {
    const message = getErrorMessage(error);
    const response = { error: "Erro interno" };
    await saveLog({ status: "error", requestBody: body, response, errorMessage: message });
    console.error("complete-signup failed", error);
    return NextResponse.json(response, { status: 500 });
  }
}
