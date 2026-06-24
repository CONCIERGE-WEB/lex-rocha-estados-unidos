/** Consumer Shield mark — U.S. semiotics (protection + document + verified path) */
export function LogoMark({
  variant = "light",
  className = "h-10 w-10 shrink-0",
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  const shieldFill = variant === "dark" ? "#1E3A8A" : "#FFFFFF";
  const shieldStroke = variant === "dark" ? "#93C5FD" : "#1D4ED8";
  const lineColor = variant === "dark" ? "#BFDBFE" : "#64748B";
  const checkColor = "#059669";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M20 3 34 8.5V19c0 7.2-5.8 13.8-14 16.5C11.8 32.8 6 26.2 6 19V8.5L20 3Z"
        fill={shieldFill}
        stroke={shieldStroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 14h16M12 18.5h16M12 23h10"
        stroke={lineColor}
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M24.5 24.5 26.8 27 31 22.5"
        stroke={checkColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
