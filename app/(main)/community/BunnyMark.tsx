/*
  작은 토끼 선 그림 (메인 Community 화면의 토끼와 같은 톤)
  보상 · 이용 안내 · 빈 화면처럼 필요한 곳에만 작게 사용
*/
export default function BunnyMark({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const stroke = "#50789a";

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <ellipse
        cx="17"
        cy="13"
        rx="5"
        ry="11"
        transform="rotate(-8 17 13)"
        fill="#ffffff"
        stroke={stroke}
        strokeWidth="1.8"
      />
      <ellipse
        cx="31"
        cy="13"
        rx="5"
        ry="11"
        transform="rotate(8 31 13)"
        fill="#ffffff"
        stroke={stroke}
        strokeWidth="1.8"
      />
      <ellipse
        cx="17"
        cy="14"
        rx="1.9"
        ry="6.5"
        transform="rotate(-8 17 14)"
        fill="#ffd8dc"
      />
      <ellipse
        cx="31"
        cy="14"
        rx="1.9"
        ry="6.5"
        transform="rotate(8 31 14)"
        fill="#ffd8dc"
      />
      <ellipse
        cx="24"
        cy="32"
        rx="14"
        ry="12.5"
        fill="#ffffff"
        stroke={stroke}
        strokeWidth="1.8"
      />
      <circle cx="19" cy="31" r="1.6" fill="#263f5a" />
      <circle cx="29" cy="31" r="1.6" fill="#263f5a" />
      <ellipse cx="24" cy="35" rx="1.4" ry="1" fill="#ef8290" />
      <path
        d="M21.5 37.4 Q24 39.4 26.5 37.4"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
