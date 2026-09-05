import Link from "next/link";
import Icon from "./Icon";

type Props = {
  title: string;
  description: string;
  action: string;
  href?: string;
  icon?: string;
};

export default function GuideCard({ title, description, action, href, icon = "play" }: Props) {
  const content = (
    <>
      <span className="guide-copy">
        <small>STUDIO UGC ACADEMY</small>
        <strong>{title}</strong>
      </span>
      <span className="guide-icon">
        <Icon name={icon} size={20} />
      </span>
      <span className="sr-only">{action}</span>
    </>
  );

  if (href) {
    return (
      <Link className="guide-card" href={href} title={description}>
        {content}
      </Link>
    );
  }

  return (
    <button className="guide-card" title={description}>
      {content}
    </button>
  );
}
