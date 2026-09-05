import { NextResponse } from "next/server";
import { syncShopeeConversions } from "@/lib/shopee-api";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminConfig } from "@/lib/dashboard-data";

export async function POST(request: Request) {
  try {
    const conversions = await syncShopeeConversions();
    const config = await getAdminConfig();

    let synced = 0;
    let errors = 0;

    for (const conversion of conversions) {
      try {
        if (!conversion.sub_id) {
          console.warn("Conversion missing sub_id:", conversion);
          continue;
        }

        const { data: video } = await supabaseAdmin
          .from("videos_ugc")
          .select("id, creator_id")
          .eq("id", conversion.sub_id)
          .maybeSingle();

        if (!video) {
          console.warn("Video not found for sub_id:", conversion.sub_id);
          continue;
        }

        const { error: insertError } = await supabaseAdmin
          .from("sales_ugc")
          .insert({
            video_id: video.id,
            sale_value: conversion.sale_value,
            commission_percent: conversion.commission_percent,
            commission_creator:
              conversion.sale_value *
              conversion.commission_percent *
              config.repasse_organico_percent / 100,
            commission_platform:
              conversion.sale_value * conversion.commission_percent * (1 - config.repasse_organico_percent / 100),
            sale_date: new Date(conversion.timestamp * 1000).toISOString(),
            external_sale_id: conversion.order_id,
          })
          .select()
          .maybeSingle();

        if (insertError) {
          console.error("Error inserting sale:", insertError);
          errors++;
        } else {
          synced++;
        }
      } catch (err) {
        console.error("Error processing conversion:", err);
        errors++;
      }
    }

    return NextResponse.json(
      {
        success: true,
        synced,
        errors,
        total: conversions.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to sync conversions",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return NextResponse.json(
    {
      message: "Use POST to sync Shopee conversions",
      endpoint: "/api/shopee/sync",
    },
    { status: 200 }
  );
}
