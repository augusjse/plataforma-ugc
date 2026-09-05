type Props = { value: number; title: string; detail: string };

export default function GoalCard({ value, title, detail }: Props) {
  return (
    <div className="goal-card">
      <span className="eyebrow">Meta do mês</span>
      <div
        className="radial"
        style={{
          background: `conic-gradient(var(--brand) ${value * 3.6}deg, var(--chart-grid) 0)`,
        }}
      >
        <b>{value}%</b>
      </div>
      <strong>{title}</strong>
      <p>{detail}</p>
      <div className="progress">
        <i style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
