"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Icon from "./Icon";

const PERIODS = [15, 30, 60, 90] as const;

export default function PeriodSelectorClient({ periodDays }: { periodDays: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = PERIODS.includes(periodDays as (typeof PERIODS)[number]) ? periodDays : 15;

  function changePeriod(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="period-selector">
      <Icon name="calendar" size={16} />
      <span className="sr-only">Período dos dados</span>
      <select value={selected} onChange={(event) => changePeriod(event.target.value)} aria-label="Período dos dados">
        {PERIODS.map((days) => <option value={days} key={days}>Últimos {days} dias</option>)}
      </select>
      <Icon name="chevron" size={15} />
    </label>
  );
}
