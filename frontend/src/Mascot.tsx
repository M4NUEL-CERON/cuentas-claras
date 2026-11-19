// Chocolo, the capybara (chigüiro) mascot, holding a cup of thick hot chocolate.
// One stroke weight and palette throughout so it reads as a single drawn character.
const INK = '#3b2417'

export function Mascot({ className, mood = 'happy' }: { className?: string; mood?: 'happy' | 'calm' }) {
  return (
    <svg className={className} viewBox="0 0 260 230" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <ellipse cx="130" cy="214" rx="92" ry="9" fill={INK} stroke="none" opacity="0.08" />
      {/* body */}
      <path d="M38 196c-8-44 18-86 92-86s100 42 92 86c-2 12-14 18-92 18s-90-6-92-18z" fill="#b8804f" />
      <path d="M78 205c4-22 22-34 52-34s48 12 52 34" fill="#cf9b68" stroke="none" />
      {/* ears */}
      <ellipse cx="84" cy="34" rx="10" ry="8" fill="#8e5a35" />
      <ellipse cx="176" cy="34" rx="10" ry="8" fill="#8e5a35" />
      {/* head: the capybara block, wide and flat-topped */}
      <path d="M64 62c0-22 20-34 66-34s66 12 66 34v64c0 28-24 44-66 44s-66-16-66-44z" fill="#b8804f" />
      {/* snout */}
      <rect x="80" y="88" width="100" height="74" rx="32" fill="#cf9b68" />
      <rect x="111" y="100" width="7" height="12" rx="3.5" fill={INK} stroke="none" />
      <rect x="142" y="100" width="7" height="12" rx="3.5" fill={INK} stroke="none" />
      <path d="M130 118v8" strokeWidth="3" />
      {mood === 'happy'
        ? <path d="M116 132c6 8 22 8 28 0" />
        : <path d="M118 134h24" />}
      {/* eyes */}
      {mood === 'happy' ? (
        <>
          <path d="M92 64c4-6 12-6 16 0" />
          <path d="M152 64c4-6 12-6 16 0" />
        </>
      ) : (
        <>
          <circle cx="100" cy="64" r="5" fill={INK} stroke="none" />
          <circle cx="160" cy="64" r="5" fill={INK} stroke="none" />
          <circle cx="102" cy="62" r="1.6" fill="#fff" stroke="none" />
          <circle cx="162" cy="62" r="1.6" fill="#fff" stroke="none" />
        </>
      )}
      <ellipse cx="76" cy="86" rx="8" ry="6" fill="#f2a08c" stroke="none" opacity="0.7" />
      <ellipse cx="184" cy="86" rx="8" ry="6" fill="#f2a08c" stroke="none" opacity="0.7" />
      {/* cup of chocolate, held in front */}
      <path d="M100 174h60l-6 32c-1 6-6 10-12 10h-24c-6 0-11-4-12-10z" fill="#fffaf2" />
      <path d="M160 182c14-2 20 6 18 13s-10 11-20 9" />
      <ellipse cx="130" cy="175" rx="30" ry="6" fill="#5a2f1b" />
      <path d="M112 194h36" stroke="#e86f4c" strokeWidth="5" />
      {/* paws on the cup */}
      <ellipse cx="102" cy="192" rx="11" ry="9" fill="#8e5a35" />
      <ellipse cx="158" cy="192" rx="11" ry="9" fill="#8e5a35" />
      {/* steam */}
      <path className="steam" d="M214 128c-8-10 8-16 0-26s8-16 0-26" stroke="#c9b6a4" strokeWidth="3.5" />
      <path className="steam s2" d="M232 140c-6-8 6-12 0-20s6-12 0-20" stroke="#c9b6a4" strokeWidth="3" />
    </svg>
  )
}
