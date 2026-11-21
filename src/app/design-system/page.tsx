import type { Metadata } from "next";
import { DesignSystemShowcase } from "./DesignSystemShowcase";

export const metadata: Metadata = {
  title: "Design System",
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 dark:text-white">Design System</h1>
      <p className="text-[var(--color-text-secondary)] mb-8">
        Intern reference for MinBeregner.dk UI-komponenter, farver og styling.
      </p>

      {/* Colors */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Farvepalette</h2>
        <p className="text-[var(--color-text-secondary)] mb-6">
          Alle farver er defineret som CSS custom properties i <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">globals.css</code> og
          skifter automatisk i dark mode.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <ColorSwatch name="Primary" var="--color-primary" />
          <ColorSwatch name="Primary Hover" var="--color-primary-hover" />
          <ColorSwatch name="Primary Light" var="--color-primary-light" />
          <ColorSwatch name="Primary Text" var="--color-primary-text" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <ColorSwatch name="Surface" var="--color-surface" border />
          <ColorSwatch name="Surface Elevated" var="--color-surface-elevated" border />
          <ColorSwatch name="Background" var="--color-background" border />
          <ColorSwatch name="Border" var="--color-border" border />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <ColorSwatch name="Text" var="--color-text" />
          <ColorSwatch name="Text Secondary" var="--color-text-secondary" />
          <ColorSwatch name="Text Muted" var="--color-text-muted" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <ColorSwatch name="Success" var="--color-success" />
          <ColorSwatch name="Warning" var="--color-warning" />
          <ColorSwatch name="Error" var="--color-error" />
          <ColorSwatch name="Info" var="--color-info" />
        </div>
      </section>

      {/* Interactive components (client) */}
      <DesignSystemShowcase />

      {/* Input Fields */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Input-felter</h2>
        <p className="text-[var(--color-text-secondary)] mb-6">
          Brug <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">InputField</code> komponenten
          fra <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">src/components/InputField.tsx</code>.
          Den håndterer validering, fejlbeskeder, enheder og dark mode.
        </p>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
          <h3 className="font-semibold mb-4 dark:text-white">Standard styling</h3>
          <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
            <p><strong>Højde:</strong> <code>py-3</code> (48px med text-lg)</p>
            <p><strong>Font:</strong> <code>text-lg</code> (18px)</p>
            <p><strong>Border:</strong> <code>border rounded-lg</code> — grå, grøn ved valid, rød ved fejl</p>
            <p><strong>Fokus:</strong> <code>focus:ring-2</code> med blå ring</p>
            <p><strong>Enhed:</strong> Valgfrit <code>unit</code> prop viser enheds-label i højre side</p>
          </div>
        </div>
      </section>

      {/* Spacing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Spacing & Border Radius</h2>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 dark:text-white">Border Radius</h3>
              <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                <p><code>--radius-sm</code>: 6px — badges, tags</p>
                <p><code>--radius-md</code>: 8px — inputs, small buttons</p>
                <p><code>--radius-lg</code>: 12px — cards, buttons</p>
                <p><code>--radius-xl</code>: 16px — large cards</p>
                <p><code>--radius-2xl</code>: 24px — hero sections</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3 dark:text-white">Konventioner</h3>
              <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                <p><strong>Sektioner:</strong> <code>space-y-8</code> mellem sektioner</p>
                <p><strong>Kort-padding:</strong> <code>p-4</code> compact, <code>p-6</code> standard, <code>p-8</code> large</p>
                <p><strong>Grid gap:</strong> <code>gap-4</code> tight, <code>gap-6</code> standard</p>
                <p><strong>Label margin:</strong> <code>mb-2</code> under labels</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Usage */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Brug</h2>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
          <pre className="text-sm overflow-x-auto text-[var(--color-text-secondary)]">
{`import { Button } from "@/components/ui";
import { Card, CardHeader, CardTitle } from "@/components/ui";

// Knapper
<Button variant="primary">Beregn</Button>
<Button variant="secondary" size="sm">Nulstil</Button>
<Button variant="ghost">Annuller</Button>
<Button variant="danger" size="sm">Slet</Button>

// Kort
<Card>Standard kort med p-6</Card>
<Card variant="elevated" padding="lg">Elevated kort med p-8</Card>
<Card variant="success" padding="sm">Succes kort med p-4</Card>

// CSS custom properties
style={{ color: "var(--color-primary)" }}
className="bg-[var(--color-surface)]"
className="border-[var(--color-border)]"
className="text-[var(--color-text-secondary)]"`}
          </pre>
        </div>
      </section>
    </div>
  );
}

function ColorSwatch({ name, var: cssVar, border }: { name: string; var: string; border?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={`h-16 rounded-lg ${border ? "border border-[var(--color-border)]" : ""}`}
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <div>
        <p className="text-sm font-medium dark:text-white">{name}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{cssVar}</p>
      </div>
    </div>
  );
}
