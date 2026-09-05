import Icon from "./Icon";

type Props = { title: string; description: string; action: string };

export default function GuideCard({ title, description, action }: Props) {
  return (
    <button className="guide-card" title={description}>
      <span className="guide-copy">
        <small>STUDIO UGC ACADEMY</small>
        <strong>{title}</strong>
      </span>
      <span className="guide-icon">
        <Icon name="play" size={20} />
      </span>
      <span className="sr-only">{action}</span>
    </button>
  );
}
