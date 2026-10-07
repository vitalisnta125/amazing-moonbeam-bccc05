import { useId } from "react";

// The EXECURE mark: an open hexagon with three stacked "E" slabs. Colours come
// from the --logo-green / --logo-slab tokens so Elite Mode can re-tint it.
export function LogoMark({ size = 32 }: { size?: number }) {
  const clipId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="flex-shrink-0"
    >
      <clipPath id={clipId}>
        <path d="M0 0H64V19.372H49V44.628H64V64H0Z" />
      </clipPath>
      <path
        d="M54.334 32.000L54.334 19.813A4.682 4.682 0 0 0 52.072 15.805L34.419 5.151A4.682 4.682 0 0 0 29.581 5.151L11.928 15.805A4.682 4.682 0 0 0 9.666 19.813L9.666 44.187A4.682 4.682 0 0 0 11.928 48.195L29.581 58.849A4.682 4.682 0 0 0 34.419 58.849L52.072 48.195A4.682 4.682 0 0 0 54.334 44.187L54.334 32.000"
        clipPath={`url(#${clipId})`}
        stroke="var(--logo-green)"
        strokeWidth="5.028"
        strokeLinejoin="round"
      />
      <path
        d="M29.226 19.913L45.609 19.913Q46.159 19.913 45.98 20.433L44.695 24.156Q44.402 25.003 43.506 25.003L21.847 25.003Q21.338 25.003 21.528 24.53C23.266 20.182 25.969 19.913 29.226 19.913Z"
        fill="var(--logo-green)"
      />
      <path
        d="M18.234 41.084L38.662 41.084Q39.272 41.084 39.046 41.652L37.917 44.471Q37.237 46.173 35.405 46.173L21.288 46.173C15.588 46.173 15.995 41.084 18.234 41.084Z"
        fill="var(--logo-green)"
      />
      <path
        d="M20.455 30.499L42.47 30.499Q42.979 30.499 42.745 30.951L40.86 34.594Q40.345 35.588 39.225 35.588L19.054 35.588Q18.546 35.588 18.68 35.097L19.812 30.989Q19.946 30.499 20.455 30.499Z"
        fill="var(--logo-slab)"
      />
    </svg>
  );
}

// "EXECURE" wordmark with the brand-green X.
export function Wordmark() {
  return (
    <span>
      E<span className="wordmark-x">X</span>ECURE
    </span>
  );
}
