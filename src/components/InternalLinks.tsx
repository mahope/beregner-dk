import Link from 'next/link';

type LinkItem = { href: string; label: string };
export default function InternalLinks({ items }: { items: LinkItem[] }) {
  if (!items?.length) return null;
  return (
    <nav aria-label="Relaterede værktøjer" className="mt-8 border-t pt-4 text-sm">
      <h2 className="font-semibold mb-2">Relaterede værktøjer</h2>
      <ul className="list-disc ml-5 space-y-1">
        {items.map((it) => (
          <li key={it.href}><Link href={it.href} className="text-blue-700 hover:underline">{it.label}</Link></li>
        ))}
      </ul>
    </nav>
  );
}
