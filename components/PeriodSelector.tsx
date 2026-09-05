import Icon from "./Icon";

type Props = { label?: string };

export default function PeriodSelector({ label = "Últimos 15 dias" }: Props) {
  return (
    <button className="period-selector">
      <Icon name="calendar" size={16} />
      {label}
      <Icon name="chevron" size={15} />
    </button>
  );
}
