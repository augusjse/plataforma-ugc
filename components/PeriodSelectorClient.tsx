"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Icon from "./Icon";

const PERIODS = [15, 30, 60, 90] as const;
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const pad = (value: number) => String(value).padStart(2, "0");
const iso = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const fromIso = (value?: string | null) => { if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null; const [year, month, day] = value.split("-").map(Number); const date = new Date(year, month - 1, day); return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null; };
const format = (date: Date | null) => date ? `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}` : "--/--/----";
type Day = { date: Date; current: boolean };
function monthDays(month: Date): Day[] { const first = new Date(month.getFullYear(), month.getMonth(), 1); const start = new Date(month.getFullYear(), month.getMonth(), 1 - first.getDay()); return Array.from({ length: 42 }, (_, index) => { const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index); return { date, current: date.getMonth() === month.getMonth() }; }); }
function Calendar({ month, start, end, onPick, onNavigate }: { month: Date; start: Date | null; end: Date | null; onPick: (date: Date) => void; onNavigate?: (amount: number) => void }) {
  return <div className="period-calendar"><div className="period-calendar-head">{onNavigate ? <button type="button" className="period-nav" onClick={() => onNavigate(-1)} aria-label="Mês anterior">‹</button> : <span className="period-nav-placeholder" />}<strong>{MONTHS[month.getMonth()]} de {month.getFullYear()}</strong>{onNavigate ? <button type="button" className="period-nav" onClick={() => onNavigate(1)} aria-label="Próximo mês">›</button> : <span className="period-nav-placeholder" />}</div><div className="period-weekdays">{WEEKDAYS.map((day) => <span key={day}>{day}</span>)}</div><div className="period-days">{monthDays(month).map(({ date, current }) => { const value = iso(date); const selected = value === (start && iso(start)) || value === (end && iso(end)); const inRange = start && end && date >= start && date <= end; return <button key={value} type="button" disabled={!current} className={`${selected ? "is-range-edge" : ""} ${inRange ? "is-in-range" : ""}`} onClick={() => onPick(date)}>{date.getDate()}</button>; })}</div></div>;
}

export default function PeriodSelectorClient({ periodDays, from, to }: { periodDays: number; from?: string; to?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = PERIODS.includes(periodDays as (typeof PERIODS)[number]) ? periodDays : 15;
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const initialRange = useMemo(() => ({ start: fromIso(from), end: fromIso(to) }), [from, to]);
  useEffect(() => { if (!open) return; setStart(initialRange.start); setEnd(initialRange.end); const base = initialRange.start ?? new Date(); setMonth(new Date(base.getFullYear(), base.getMonth(), 1)); }, [open, initialRange]);
  useEffect(() => { if (!open) return; const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false); document.addEventListener("keydown", close); document.body.style.overflow = "hidden"; return () => { document.removeEventListener("keydown", close); document.body.style.overflow = ""; }; }, [open]);

  function pick(date: Date) { if (!start || (start && end)) { setStart(date); setEnd(null); } else if (date < start) { setStart(date); setEnd(start); } else setEnd(date); }
  function suggested(kind: string) { const today = new Date(); today.setHours(0, 0, 0, 0); const finish = new Date(today); let begin = new Date(today); if (kind === "ontem") { begin.setDate(begin.getDate() - 1); finish.setDate(finish.getDate() - 1); } else if (kind === "mes") begin = new Date(today.getFullYear(), today.getMonth(), 1); else begin.setDate(begin.getDate() - Number(kind) + 1); setStart(begin); setEnd(finish); setMonth(new Date(begin.getFullYear(), begin.getMonth(), 1)); }
  function apply() { if (!start || !end) return; const params = new URLSearchParams(searchParams.toString()); params.delete("period"); params.set("from", iso(start)); params.set("to", iso(end)); setOpen(false); router.push(`${pathname}?${params.toString()}`); }
  function clear() { setStart(null); setEnd(null); }

  return (
    <><button type="button" className="period-selector" onClick={() => setOpen(true)} aria-label="Selecionar período"><Icon name="calendar" size={17} /><span><small>PERÍODO</small><strong>{from && to ? `${format(fromIso(from))} – ${format(fromIso(to))}` : `Últimos ${selected} dias`}</strong></span><Icon name="chevron" size={15} /></button>{open && <div className="period-modal-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}><section className="period-modal" role="dialog" aria-modal="true" aria-labelledby="period-title"><header className="period-modal-header"><div className="period-modal-title"><span><Icon name="calendar" size={20} /></span><div><h2 id="period-title">Período Personalizado</h2><p>Escolha o intervalo para visualizar seus dados</p></div></div><button type="button" className="period-close" onClick={() => setOpen(false)} aria-label="Fechar"><Icon name="close" size={20} /></button></header><div className="period-modal-body"><div className="period-calendars"><Calendar month={month} start={start} end={end} onPick={pick} onNavigate={(amount) => setMonth(new Date(month.getFullYear(), month.getMonth() + amount, 1))} /><Calendar month={new Date(month.getFullYear(), month.getMonth() + 1, 1)} start={start} end={end} onPick={pick} /></div><div className="period-suggested"><small>SUGERIDOS</small><div>{[["ontem", "Ontem"], ["7", "Últimos 7 dias"], ["15", "Últimos 15 dias"], ["30", "Últimos 30 dias"], ["mes", "Este Mês"]].map(([value, label]) => <button type="button" key={value} onClick={() => suggested(value)}>{label}</button>)}</div></div><div className="period-inputs"><label>INÍCIO<input value={format(start)} readOnly /></label><label>FIM<input value={format(end)} readOnly /></label></div></div><footer className="period-modal-footer"><button type="button" className="period-clear" onClick={clear}>Limpar</button><button type="button" className="button button-primary" disabled={!start || !end} onClick={apply}>Aplicar Filtro</button></footer></section></div>}</>
  );
}
