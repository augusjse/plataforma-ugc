type Props = { size?: number };

export default function CoinIcon({ size = 22 }: Props) {
  return (
    <svg
      className="coin-icon"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Moeda dourada"
    >
      <defs>
        <radialGradient id="coin-face-gradient" cx="30%" cy="24%" r="78%">
          <stop offset="0" stopColor="#FFF8B0" />
          <stop offset="0.35" stopColor="#FFD700" />
          <stop offset="1" stopColor="#FFA500" />
        </radialGradient>
        <linearGradient id="coin-rim-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF1A3" />
          <stop offset="0.45" stopColor="#FFC400" />
          <stop offset="1" stopColor="#D98200" />
        </linearGradient>
        <filter id="coin-shadow" x="-25%" y="-25%" width="150%" height="170%">
          <feDropShadow dx="0" dy="1.2" stdDeviation="1" floodColor="#8A4B00" floodOpacity="0.45" />
        </filter>
      </defs>
      <circle cx="16" cy="16.8" r="13.1" fill="url(#coin-rim-gradient)" filter="url(#coin-shadow)" />
      <circle cx="16" cy="15.5" r="10.9" fill="url(#coin-face-gradient)" stroke="#FFF0A0" strokeWidth="0.8" />
      <path d="M10.5 9.3a10.9 10.9 0 0 1 9.9-2.8" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.3" strokeLinecap="round" />
      <text x="16" y="20.4" textAnchor="middle" fill="#7A4300" fontSize="14" fontWeight="800" fontFamily="Arial, sans-serif">
        $
      </text>
    </svg>
  );
}
