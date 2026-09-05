type Props = { initials: string; large?: boolean };
export default function Avatar({ initials, large = false }: Props) {
  return (
    <span className={`person-avatar${large ? " large" : ""}`}>{initials}</span>
  );
}
