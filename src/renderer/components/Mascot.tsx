type Props = { size?: number; mood?: 'idle' | 'happy' }

export function Mascot({ size = 96, mood = 'idle' }: Props) {
  return (
    <svg
      role="img"
      aria-label="Shimacord pomsky mascot"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
    >
      <path d="M78 70c14-2 18-18 8-26-6-4-12 2-8 8 3 4 7 2 6-2" stroke="#2b2a28" strokeWidth="5" strokeLinecap="round" fill="#f6f1e4" />
      <path d="M22 34 18 10l20 12M78 34 82 10 62 22" fill="#2b2a28" stroke="#2b2a28" strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="50" cy="56" rx="34" ry="30" fill="#f6f1e4" stroke="#2b2a28" strokeWidth="3" />
      <path d="M50 26c-14 0-26 8-30 22 8-4 16-3 22 4l8-6 8 6c6-7 14-8 22-4-4-14-16-22-30-22z" fill="#2b2a28" />
      <circle cx="44" cy="31" r="1.8" fill="#f6f1e4" />
      <circle cx="56" cy="31" r="1.8" fill="#f6f1e4" />
      <ellipse cx="38" cy="54" rx="9" ry="8" fill="#f6f1e4" />
      <ellipse cx="62" cy="54" rx="9" ry="8" fill="#f6f1e4" />
      {mood === 'happy' ? (
        <>
          <path d="M33 54q5-6 10 0M57 54q5-6 10 0" stroke="#2b2a28" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="38" cy="54" r="4" fill="#a9c8e8" stroke="#2b2a28" strokeWidth="1.5" />
          <circle cx="62" cy="54" r="4" fill="#a9c8e8" stroke="#2b2a28" strokeWidth="1.5" />
          <circle cx="38" cy="54" r="1.6" fill="#2b2a28" />
          <circle cx="62" cy="54" r="1.6" fill="#2b2a28" />
        </>
      )}
      <ellipse cx="50" cy="66" rx="4" ry="3" fill="#2b2a28" />
      <path d="M50 69v4q-4 4-8 1M50 73q4 4 8 1" stroke="#2b2a28" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="30" cy="66" rx="4" ry="2.5" fill="#b8652c" opacity=".35" />
      <ellipse cx="70" cy="66" rx="4" ry="2.5" fill="#b8652c" opacity=".35" />
    </svg>
  )
}
