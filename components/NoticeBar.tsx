import Icon from "./Icon";
import CoinIcon from "./CoinIcon";
import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  action: string;
  icon?: "bell" | "coin";
  children?: ReactNode;
};

export default function NoticeBar({ title, description, action, icon = "bell", children }: Props) {
  return (
    <div className="notice-bar">
      <div className={`notice-icon${icon === "coin" ? " notice-icon--coin" : ""}`}>
        {icon === "coin" ? <CoinIcon size={25} /> : <Icon name="bell" size={18} />}
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
