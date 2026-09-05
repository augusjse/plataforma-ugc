"use client";

import { useState } from "react";
import Icon from "./Icon";
import { dailyBilling } from "@/lib/mock/chart";

type Props = { subtitle?: string };
type Key = "sales" | "commission" | "payable";
type Series = { key: Key; label: string; className: string };

const series: Series[] = [
  { key: "sales", label: "Vendas", className: "series-one" },
  { key: "commission", label: "Comissões", className: "series-two" },
  { key: "payable", label: "A pagar", className: "series-three" },
];

export default function PerformanceChart({
  subtitle = "Últimos 15 dias",
}: Props) {
  const [visible, setVisible] = useState<Record<Key, boolean>>({
    sales: true,
    commission: true,
    payable: true,
  });
  const [hover, setHover] = useState<number | null>(null);
  const width = 760;
  const height = 280;
  const pad = { left: 58, right: 18, top: 18, bottom: 34 };
  const x = (index: number) =>
    pad.left + (index / 29) * (width - pad.left - pad.right);
  const y = (value: number) =>
    pad.top + (1 - value / 80000) * (height - pad.top - pad.bottom);
  const path = (key: Key) =>
    dailyBilling
      .map((point, index) => `${index ? "L" : "M"}${x(index)},${y(point[key])}`)
      .join(" ");
  const area = (key: Key) =>
    `${path(key)} L${x(29)},${height - pad.bottom} L${x(0)},${height - pad.bottom} Z`;

  function move(event: React.MouseEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const position = ((event.clientX - box.left) / box.width) * width;
    setHover(
      Math.max(
        0,
        Math.min(
          29,
          Math.round(
            (position - pad.left) / ((width - pad.left - pad.right) / 29),
          ),
        ),
      ),
    );
  }

  return (
    <div className="chart-card">
      <div className="chart-head">
        <div>
          <h3>
            <span className="chart-title-icon">
              <Icon name="chart" size={16} />
            </span>
            Faturamento Diário
          </h3>
          <span>{subtitle}</span>
        </div>
        <span className="badge badge-success">+24,8%</span>
      </div>
      <div
        className="chart-area chart-area-large"
        onMouseLeave={() => setHover(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Faturamento diário"
          onMouseMove={move}
        >
          {[0, 20000, 40000, 60000, 80000].map((value) => (
            <g key={value}>
              <line
                className="chart-grid-line"
                x1={pad.left}
                x2={width - pad.right}
                y1={y(value)}
                y2={y(value)}
              />
              <text className="chart-axis-label" x="0" y={y(value) + 4}>
                R$ {value / 1000} mil
              </text>
            </g>
          ))}
          {series.map(
            (item) =>
              visible[item.key] && (
                <g key={item.key}>
                  <path
                    className={`chart-series-fill ${item.className}`}
                    d={area(item.key)}
                  />
                  <path
                    className={`chart-series-line ${item.className}`}
                    d={path(item.key)}
                  />
                </g>
              ),
          )}
          {hover !== null && (
            <line
              className="chart-crosshair"
              x1={x(hover)}
              x2={x(hover)}
              y1={pad.top}
              y2={height - pad.bottom}
            />
          )}
        </svg>
        {hover !== null && (
          <div
            className="chart-tooltip"
            style={{ left: `${(x(hover) / width) * 100}%` }}
          >
            <strong>{dailyBilling[hover].label}</strong>
            {series
              .filter((item) => visible[item.key])
              .map((item) => (
                <span key={item.key}>
                  <i className={item.className} />
                  {item.label}
                  <b>
                    R${" "}
                    {(dailyBilling[hover][item.key] / 1000)
                      .toFixed(1)
                      .replace(".", ",")}{" "}
                    mil
                  </b>
                </span>
              ))}
          </div>
        )}
      </div>
      <div className="chart-legend">
        {series.map((item) => (
          <button
            className={`legend-chip ${item.className} ${visible[item.key] ? "active" : "off"}`}
            key={item.key}
            onClick={() =>
              setVisible((state) => ({
                ...state,
                [item.key]: !state[item.key],
              }))
            }
          >
            <i />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
