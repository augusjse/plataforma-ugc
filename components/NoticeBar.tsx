import Link from "next/link";
import Icon from "./Icon";
import CoinIcon from "./CoinIcon";
import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  action: string;
  href?: string;
  icon?: "bell" | "coin";
  children?: ReactNode;
};

export default function NoticeBar({ title, description, action, href, icon = "bell", children }: Props) {
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
        {href ? (
          <Link href={href} className="button button-light">{action} →</Link>
        ) : (
          <button className="button button-light">{action} →</button>
        )}
        {children}
      </div>
    </div>
  );
}
