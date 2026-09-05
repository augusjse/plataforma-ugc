type Props = {
  label: string;
  value: string;
  change?: string;
  icon: string;
  tone?: string;
};
import Icon from "./Icon";
import { MoneyValue } from "./ValuesVisibilityContext";
export default function StatCard({
  label,
  value,
  change,
  icon,
  tone = "orange",
}: Props) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon name={icon} />
      </div>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value.startsWith("R$") ? <MoneyValue value={value} /> : value}</strong>
      {change && <span className="stat-change">↗ {change}</span>}
    </div>
  );
}
