type Props = { label: string; value: string; detail: string; trend: string };
export default function HeroMetric({ label, value, detail, trend }: Props) {
  return (
    <div className="hero">
      <p className="eyebrow">{label}</p>
      <h2>{value}</h2>
      <p>{detail}</p>
      <span className="hero-tag">{trend}</span>
    </div>
  );
}
