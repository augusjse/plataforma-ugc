import PeriodSelectorClient from "./PeriodSelectorClient";

type Props = { periodDays?: number; from?: string; to?: string; compact?: boolean };

export default function PeriodSelector({ periodDays = 15, from, to, compact }: Props) {
  return <PeriodSelectorClient periodDays={periodDays} from={from} to={to} compact={compact} />;
}
