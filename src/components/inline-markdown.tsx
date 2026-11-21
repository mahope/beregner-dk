import type { ReactNode } from "react";

/**
 * `facts` og FAQ-svarene i `dage-til.ts` er skrevet med `**fed**` om de ord,
 * siden vil fremhæve. `DageTilPage` og `FAQ` rendrede dem som ren tekst, så
 * læseren så stjernerne («mensen **slutdatoen** er kommunal»), og FAQPage-
 * JSON-LD'en bar samme markup.
 *
 * `renderInlineMarkdown` laver `**fed**` om til `<strong>fed</strong>` til
 * visning, og `stripInlineMarkdown` fjerner markøren til de forbrugere, der
 * skal have ren tekst (JSON-LD, som Google citerer).
 */

/** Renders `**fed**` som <strong> og lader alt andet stå som ren tekst. */
export function renderInlineMarkdown(text: string): ReactNode {
  return text
    .split(/\*\*([^*]+)\*\*/g)
    .map((part, index) =>
      index % 2 === 1 ? <strong key={index}>{part}</strong> : part
    );
}

/** Fjerner `**`-markørerne og efterlader ordene, til ren-tekst-forbrugere. */
export function stripInlineMarkdown(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1");
}
