type FlagLocale = "da" | "no" | "se";

interface CountryFlagProps {
  locale: FlagLocale;
  className?: string;
}

function DanishFlag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 37 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Dansk flag">
      <rect width="37" height="28" rx="2" fill="#C8102E" />
      <rect x="11" y="0" width="4" height="28" fill="#FFFFFF" />
      <rect x="0" y="12" width="37" height="4" fill="#FFFFFF" />
    </svg>
  );
}

function NorwegianFlag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 33 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Norsk flagg">
      <rect width="33" height="24" rx="2" fill="#BA0C2F" />
      <rect x="10" y="0" width="5" height="24" fill="#FFFFFF" />
      <rect x="0" y="9.5" width="33" height="5" fill="#FFFFFF" />
      <rect x="11" y="0" width="3" height="24" fill="#00205B" />
      <rect x="0" y="10.5" width="33" height="3" fill="#00205B" />
    </svg>
  );
}

function SwedishFlag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Svensk flagga">
      <rect width="32" height="20" rx="2" fill="#006AA7" />
      <rect x="10" y="0" width="4" height="20" fill="#FECC02" />
      <rect x="0" y="8" width="32" height="4" fill="#FECC02" />
    </svg>
  );
}

const flags: Record<FlagLocale, React.FC<{ className?: string }>> = {
  da: DanishFlag,
  no: NorwegianFlag,
  se: SwedishFlag,
};

export default function CountryFlag({ locale, className = "w-6 h-4 inline-block" }: CountryFlagProps) {
  const Flag = flags[locale];
  return <Flag className={className} />;
}
