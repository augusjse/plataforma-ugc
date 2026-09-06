import Icon from "./Icon";
import type { ReactNode } from "react";

type Props = { title: string; description: string; action: string; children?: ReactNode };

export default function NoticeBar({ title, description, action, children }: Props) {
  return (
    <div className="notice-bar">
      <div className="notice-icon">
        <Icon name="bell" size={18} />
      </div>
      <div className="notice-copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
      <div className="notice-actions">
        <button className="button button-light">{action} →</button>
        {children}
      </div>
    </div>
  );
}
