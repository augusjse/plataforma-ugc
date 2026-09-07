import CopyButton from "./CopyButton";

type Props = { title: string; url: string; action?: string };
export default function LinkRow({ title, url, action = "Copiar link" }: Props) {
  return (
    <div className="video-row">
      <div className="video-info">
        <strong>{title}</strong>
        <span>{url}</span>
      </div>
      <CopyButton text={url}>{action}</CopyButton>
    </div>
  );
}
