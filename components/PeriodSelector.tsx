import PeriodSelectorClient from "./PeriodSelectorClient";

type Props = { periodDays?: number; from?: string; to?: string };

export default function PeriodSelector({ periodDays = 15, from, to }: Props) {
  return <PeriodSelectorClient periodDays={periodDays} from={from} to={to} />;
}
