import Icon from "./Icon";

type Props = { title: string; description: string; action: string };

export default function NoticeBar({ title, description, action }: Props) {
  return (
    <div className="notice-bar">
      <div className="notice-icon">
        <Icon name="bell" size={18} />
      </div>
      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
      <button className="button button-light">{action} →</button>
    </div>
  );
}
