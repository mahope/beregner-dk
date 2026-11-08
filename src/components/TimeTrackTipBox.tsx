import { TIMETRACK_TIPS, timetrackUrl } from "@/lib/timetrack-links";

/** Contextual pointer to timetrack.dk. Danish site only; one per page. */
export default function TimeTrackTipBox({
  tip,
  locale,
}: {
  tip: keyof typeof TIMETRACK_TIPS;
  locale: string;
}) {
  if (locale !== "da") return null;
  const t = TIMETRACK_TIPS[tip];
  return (
    <aside className="mb-8 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
      <p>
        {t.before}{" "}
        <a href={timetrackUrl(t.path, t.id)} className="font-medium underline">
          {t.anchor}
        </a>{" "}
        {t.after}
      </p>
    </aside>
  );
}
