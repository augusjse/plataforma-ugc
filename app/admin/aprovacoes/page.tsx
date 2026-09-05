import Shell from "@/components/Shell";
import SectionTitle from "@/components/SectionTitle";
import Badge from "@/components/Badge";
import { getPendingModerationVideos } from "@/lib/dashboard-data";
import ApprovalQueue from "./ApprovalQueue";

export default async function Aprovacoes() {
  const pending = await getPendingModerationVideos();
  return <Shell admin><div className="page-head"><div><p className="eyebrow">Moderação</p><h1>Fila de aprovação <Badge tone="warning">{pending.length} pendente{pending.length === 1 ? "" : "s"}</Badge></h1><p>Assista aos vídeos e decida quais entram no catálogo.</p></div></div><SectionTitle icon="play">Vídeos para analisar</SectionTitle><ApprovalQueue initialVideos={pending} /></Shell>;
}
