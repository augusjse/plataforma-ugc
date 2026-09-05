import Badge from "./Badge";
type Props = {
  status: string;
  tone?: "success" | "warning" | "danger" | "neutral" | "brand";
};
export default function StatusBadge({ status, tone = "neutral" }: Props) {
  return <Badge tone={tone}>{status}</Badge>;
}
