'use client';

interface LogoIconProps {
  /** Width and height in pixels (square). Defaults to 40. */
  size?: number;
  className?: string;
}

/**
 * The Resume Analyzer brand logo mark — minimalist RA monogram
 * with a dark background and emerald green strokes.
 */
export function LogoIcon({ size = 40, className }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Resume Analyzer logo"
      role="img"
    >
      {/* Rounded dark background */}
      <rect width="64" height="64" rx="16" fill="#111827" />
      {/* Abstract A stroke */}
      <path
        d="M32 16L18 48h6l4-10h10"
        stroke="#10B981"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Abstract R stroke */}
      <path
        d="M22 16h14c5.5 0 10 4.5 10 10s-4.5 10-10 10H22v12 M36 36l10 12"
        stroke="#34D399"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
