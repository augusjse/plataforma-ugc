import Icon from "./Icon";
type Props = { icon: string; title: string; description: string };
export default function EmptyState({ icon, title, description }: Props) {
  return (
    <div className="empty">
      <div className="section-icon">
        <Icon name={icon} />
      </div>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
