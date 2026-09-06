type Props = { name: string; size?: number };
const paths: Record<string, string> = {
  home: "M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z",
  play: "m8 5 11 7-11 7V5Z",
  wallet: "M4 6h16v12H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 0V4h13",
  users:
    "M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10 " +
    "a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-3a3 3 0 1 1 0 6 " +
    "m4 7v-2a4 4 0 0 0-3-3.87",
  cart: "M3 3h2l2.4 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 7H6m3 13h.01M17 20h.01",
  chart: "M4 19V5m0 14h17M8 16v-5m4 5V7m4 9v-8m4 8v-4",
  card: "M3 6h18v13H3V6Zm0 4h18M7 15h4",
  plus: "M12 5v14m-7-7h14",
  arrow: "M5 12h14m-5-5 5 5-5 5",
  copy: "M8 8h11v11H8zM5 16H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v1",
  check: "m5 12 4 4L19 6",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
  upload: "M12 16V4m0 0L8 8m4-4 4 4M4 16v3h16v-3",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "M6 6l12 12M18 6 6 18",
  eye: "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  "eye-off": "m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A12 12 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-3.1 3.9M6.6 6.6C3.6 8.5 2 12 2 12s3.5 7 10 7a11 11 0 0 0 3.4-.5",
  calendar: "M5 4v3m14-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13H4V6a1 1 0 0 1 1-1Z",
  chevron: "m7 10 5 5 5-5",
  sun:
    "M12 3v2m0 14v2M3 12h2m14 0h2m-3.4-6.6-1.4 1.4" +
    "M6.8 17.2l-1.4 1.4m0-13.2 1.4 1.4m10.8 10.4" +
    " 1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  settings:
    "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0-12v2m0 13v2" +
    "M4.2 7l1.7 1m12.2 8 1.7 1M3 12h2m14 0h2" +
    "M4.2 17l1.7-1m12.2-8 1.7-1",
  warning: "M12 3 2 21h20L12 3Zm0 6v5m0 3h.01",
  lock: "M6 10V7a6 6 0 0 1 12 0v3M5 10h14v11H5V10Z",
  moon: "M20 15.5A8 8 0 0 1 8.5 4 8 8 0 1 0 20 15.5Z",
};
export default function Icon({ name, size = 20 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.plus} />
    </svg>
  );
}
