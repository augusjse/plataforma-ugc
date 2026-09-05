"use client";

import { useState } from "react";
import Icon from "./Icon";
import { dailyBilling } from "@/lib/mock/chart";

type Props = { subtitle?: string };
type Key = "sales" | "commission" | "payable";
type Axis = "left" | "right";
type Series = { key: Key; label: string; className: string; labelOffset: number };

const series: Series[] = [
  { key: "sales", label: "Vendas", className: "series-one", labelOffset: -12 },
  { key: "commission", label: "Comissões", className: "series-two", labelOffset: -10 },
  { key: "payable", label: "A pagar", className: "series-three", labelOffset: 18 },
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
  // Keep only the space needed for axis labels so the plotted area uses the card.
  const pad = { left: 52, right: 12, top: 12, bottom: 24 };
  const leftAxisMax = 80000;
  const rightAxisMax = 4000;
  const x = (index: number) =>
    pad.left + (index / 29) * (width - pad.left - pad.right);
  const y = (value: number, axis: Axis = "left") => {
    const max = axis === "right" ? rightAxisMax : leftAxisMax;
    return pad.top + (1 - value / max) * (height - pad.top - pad.bottom);
  };
  const axisFor = (key: Key): Axis => (key === "payable" ? "right" : "left");
  const points = (key: Key) =>
    dailyBilling.map((point, index) => ({
      x: x(index),
      y: y(point[key], axisFor(key)),
      value: point[key],
    }));
  // Convert the data points into a smooth Catmull-Rom spline without adding a dependency.
  const smoothPath = (key: Key) => {
    const data = points(key);
    if (data.length < 2) return "";
    return data.reduce((result, point, index, list) => {
      if (index === 0) return `M ${point.x},${point.y}`;
      const previous = list[index - 1];
      const before = list[index - 2] ?? previous;
      const after = list[index + 1] ?? point;
      const controlOneX = previous.x + (point.x - before.x) / 6;
      const controlOneY = previous.y + (point.y - before.y) / 6;
      const controlTwoX = point.x - (after.x - previous.x) / 6;
      const controlTwoY = point.y - (after.y - previous.y) / 6;
      return `${result} C ${controlOneX},${controlOneY} ${controlTwoX},${controlTwoY} ${point.x},${point.y}`;
    }, "");
  };
  const path = (key: Key) =>
    smoothPath(key);
  const area = (key: Key) =>
    `${path(key)} L${x(29)},${height - pad.bottom} L${x(0)},${height - pad.bottom} Z`;

  const compactValue = (value: number) =>
    `${(value / 1000).toFixed(1).replace(".", ",")}k`;

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
          preserveAspectRatio="none"
          role="img"
          aria-label="Faturamento diário"
          onMouseMove={move}
        >
          <defs>
            {series.map((item) => (
              <linearGradient key={item.key} id={`chart-fill-${item.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop className={`chart-gradient-start ${item.className}`} offset="0%" />
                <stop className={`chart-gradient-end ${item.className}`} offset="100%" />
              </linearGradient>
            ))}
          </defs>
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
              <text
                className="chart-axis-label"
                x={width - 2}
                y={y((value / leftAxisMax) * rightAxisMax, "right") + 4}
                textAnchor="end"
              >
                R$ {(value / leftAxisMax) * rightAxisMax / 1000} mil
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
                    fill={`url(#chart-fill-${item.key})`}
                  />
                  <path
                    className={`chart-series-line ${item.className}`}
                    d={path(item.key)}
                  />
                  {points(item.key).map((point, index) => (
                    <g className={`chart-point-group ${hover === index ? "is-hovered" : ""}`} key={`${item.key}-${index}`}>
                      <circle className={`chart-point-halo ${item.className}`} cx={point.x} cy={point.y} r="7" />
                      <circle className={`chart-point ${item.className}`} cx={point.x} cy={point.y} r="3.5" />
                      {(index % 5 === 0 || index === points(item.key).length - 1 || hover === index) && (
                        <text className={`chart-point-value ${item.className}`} x={point.x} y={point.y + item.labelOffset} textAnchor="middle">
                          {compactValue(point.value)}
                        </text>
                      )}
                    </g>
                  ))}
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
