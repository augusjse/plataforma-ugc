type Props = { placeholder: string; label: string };
export default function FilterBar({ placeholder, label }: Props) {
  return (
    <div className="filter-row">
      <input placeholder={placeholder} />
      <span className="button button-light">{label}</span>
    </div>
  );
}
