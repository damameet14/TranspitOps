export default function WebGLFallback() {
  return (
    <svg
      className="webgl-fallback-svg"
      viewBox="0 0 1000 300"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M 50 150 Q 250 50 500 150 T 950 150" stroke="var(--border)" strokeWidth="0.75" strokeDasharray="3 3" />
      <path d="M 50 220 Q 250 120 500 220 T 950 220" stroke="var(--border)" strokeWidth="0.75" strokeDasharray="3 3" />

      <path d="M 100 120 C 300 280, 600 60, 900 180" stroke="var(--accent)" strokeWidth="1.5" opacity="0.6" />

      <rect x="98" y="118" width="5" height="5" fill="var(--accent)" />
      <rect x="298" y="198" width="5" height="5" fill="var(--accent)" />
      <rect x="598" y="108" width="5" height="5" fill="var(--accent)" />
      <rect x="898" y="178" width="5" height="5" fill="var(--accent)" />
    </svg>
  );
}
