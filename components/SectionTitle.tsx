import Icon from "./Icon";
type Props = {
  icon: string;
  children: React.ReactNode;
  action?: React.ReactNode;
};
export default function SectionTitle({ icon, children, action }: Props) {
  return (
    <div className="section-title">
      <div className="section-icon">
        <Icon name={icon} size={18} />
      </div>
      <h2>{children}</h2>
      <div className="section-action">{action}</div>
    </div>
  );
}
