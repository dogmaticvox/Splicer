export default function Header() {
  return (
    <header className="app-header">
      <svg className="logo" viewBox="0 0 48 48" aria-hidden="true">
        <g fill="none" stroke="url(#logoGrad)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.2">
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="36" r="6" />
          <line x1="40" y1="8" x2="16.24" y2="31.76" />
          <line x1="28.94" y1="28.96" x2="40" y2="40" />
          <line x1="16.24" y1="16.24" x2="24" y2="24" />
        </g>
        <defs>
          <linearGradient id="logoGrad" gradientUnits="userSpaceOnUse" x1="4" y1="4" x2="44" y2="44">
            <stop offset="0" stopColor="#00f0ff" />
            <stop offset="1" stopColor="#ff2d95" />
          </linearGradient>
        </defs>
      </svg>
      <h1>SPLICER</h1>
      <p className="tagline">CUT · SHUFFLE · SPLICE</p>
    </header>
  );
}
