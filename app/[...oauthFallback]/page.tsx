import { notFound } from "next/navigation";
import { OAuthFallbackBridge } from "./OAuthFallbackBridge";

export default async function OAuthFallbackPage({
  params,
}: {
  params: Promise<{ oauthFallback: string[] }>;
}) {
  const { oauthFallback } = await params;

  if (oauthFallback.length !== 1 || oauthFallback[0] !== "**") {
    notFound();
  }

  return <OAuthFallbackBridge />;
}
