type Props = { number: string; children: React.ReactNode };
export default function TipCard({ number, children }: Props) {
  return (
    <div className="tip">
      <b>{number} · </b>
      {children}
    </div>
  );
}
