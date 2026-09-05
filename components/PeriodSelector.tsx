import PeriodSelectorClient from "./PeriodSelectorClient";

type Props = { periodDays?: number };

export default function PeriodSelector({ periodDays = 15 }: Props) {
  return <PeriodSelectorClient periodDays={periodDays} />;
}
