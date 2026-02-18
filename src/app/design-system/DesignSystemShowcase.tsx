"use client";

import { Button } from "@/components/ui";
import { Card, CardHeader, CardTitle } from "@/components/ui";

export function DesignSystemShowcase() {
  return (
    <>
      {/* Buttons */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Knapper</h2>
        <p className="text-[var(--color-text-secondary)] mb-6">
          Brug <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">Button</code> fra{" "}
          <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">@/components/ui</code>.
          Fire varianter, tre størrelser.
        </p>

        <Card className="mb-6">
          <h3 className="font-semibold mb-4 dark:text-white">Varianter</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </Card>

        <Card className="mb-6">
          <h3 className="font-semibold mb-4 dark:text-white">Størrelser</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </Card>

        <Card className="mb-6">
          <h3 className="font-semibold mb-4 dark:text-white">Disabled</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" disabled>Primary</Button>
            <Button variant="secondary" disabled>Secondary</Button>
            <Button variant="ghost" disabled>Ghost</Button>
            <Button variant="danger" disabled>Danger</Button>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4 dark:text-white">Full Width</h3>
          <Button variant="primary" size="lg" fullWidth>
            Beregn
          </Button>
        </Card>
      </section>

      {/* Cards */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Kort</h2>
        <p className="text-[var(--color-text-secondary)] mb-6">
          Brug <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">Card</code> fra{" "}
          <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">@/components/ui</code>.
          Syv varianter, fire padding-niveauer.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Default</CardTitle>
            </CardHeader>
            <p className="text-sm text-[var(--color-text-secondary)]">Standard kort med shadow-sm og border.</p>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated</CardTitle>
            </CardHeader>
            <p className="text-sm text-[var(--color-text-secondary)]">Elevated kort med shadow-md.</p>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Bordered</CardTitle>
            </CardHeader>
            <p className="text-sm text-[var(--color-text-secondary)]">Tykkere border, ingen shadow.</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="success" padding="sm">
            <p className="text-sm font-medium text-[var(--color-success-text)]">Success</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">Grøn baggrund</p>
          </Card>
          <Card variant="warning" padding="sm">
            <p className="text-sm font-medium text-[var(--color-warning-text)]">Warning</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">Gul baggrund</p>
          </Card>
          <Card variant="error" padding="sm">
            <p className="text-sm font-medium text-[var(--color-error-text)]">Error</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">Rød baggrund</p>
          </Card>
          <Card variant="info" padding="sm">
            <p className="text-sm font-medium text-[var(--color-info-text)]">Info</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">Blå baggrund</p>
          </Card>
        </div>
      </section>
    </>
  );
}
