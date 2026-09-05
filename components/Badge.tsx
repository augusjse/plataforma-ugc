type Props = {
  children: React.ReactNode;
  tone?: "success" | "warning" | "danger" | "neutral" | "brand";
};
export default function Badge({ children, tone = "neutral" }: Props) {
  return (
    <span className={`badge badge-${tone}`}>
      <i />
      {children}
    </span>
  );
}
