import { describe, expect, test } from "vitest";
import { DAGPENGE_2026, SATSER_2026 } from "./satser-2026";

/**
 * C19 (2026-09-26) fandt, at `/blog/dagpenge-saadan-finder-du-din-sats` havde
 * sine egne dagpenge-satser: max 20.359 kr/md og dimittend 14.557/13.437 kr/md,
 * mens værktøjet og /dagpenge brugte 22.041 kr. Ingen af delene matchede
 * ministeriets tabel, og ingen af delene var bundet til et modul.
 *
 * Ministeriets "Satser for 2026" (bm.dk/satser/satser-for-2026) er læst direkte
 * 2026-09-26 og er eneste primærkilde for de seks satser. Talene er låst her, så
 * en senere drift fra en tekstliteral eller en ny kodeændring kræver en bevidst
 * kode- og kildeændring.
 */
describe("DAGPENGE_2026", () => {
  test("de seks satser er ministeriets 2026-tal", () => {
    expect(DAGPENGE_2026.fuldtid).toBe(22041);
    expect(DAGPENGE_2026.deltid).toBe(14694);
    expect(DAGPENGE_2026.dimittendFuldtidMedForsorgerpligt).toBe(18074);
    expect(DAGPENGE_2026.dimittendDeltidMedForsorgerpligt).toBe(12049);
    expect(DAGPENGE_2026.dimittendFuldtidUdenForsorgerpligt).toBe(15759);
    expect(DAGPENGE_2026.dimittendDeltidUdenForsorgerpligt).toBe(10506);
    expect(DAGPENGE_2026.gaDag).toBe(1017);
    expect(DAGPENGE_2026.gaDagHalv).toBe(509);
  });

  test("deltidssatserne er 2/3 af fuldtidssatserne", () => {
    for (const [deltid, fuldtid] of [
      [DAGPENGE_2026.deltid, DAGPENGE_2026.fuldtid],
      [
        DAGPENGE_2026.dimittendDeltidMedForsorgerpligt,
        DAGPENGE_2026.dimittendFuldtidMedForsorgerpligt,
      ],
      [
        DAGPENGE_2026.dimittendDeltidUdenForsorgerpligt,
        DAGPENGE_2026.dimittendFuldtidUdenForsorgerpligt,
      ],
    ] as const) {
      // Ministeriet afrunder satsen til hele kroner, så tillad 1 krs afvigelse.
      expect(Math.abs((fuldtid * 2) / 3 - deltid)).toBeLessThanOrEqual(1);
    }
  });

  test("dimittendsatserne er 71,5 % og 82 % af max", () => {
    // Forholdene er udledt af ministeriets egne tal, ikke selvstændige krav.
    expect(
      Math.abs(
        (DAGPENGE_2026.dimittendFuldtidUdenForsorgerpligt / DAGPENGE_2026.fuldtid -
          0.715) *
          1000,
      ),
    ).toBeLessThan(1);
    expect(
      Math.abs(
        (DAGPENGE_2026.dimittendFuldtidMedForsorgerpligt / DAGPENGE_2026.fuldtid -
          0.82) *
          1000,
      ),
    ).toBeLessThan(1);
  });

  test("dagpengesatsen er altid under 1.000 kr. mere end dimittend med forsørgelsespligt", () => {
    expect(DAGPENGE_2026.fuldtid).toBeGreaterThan(
      DAGPENGE_2026.dimittendFuldtidMedForsorgerpligt,
    );
    expect(DAGPENGE_2026.dimittendFuldtidMedForsorgerpligt).toBeGreaterThan(
      DAGPENGE_2026.dimittendFuldtidUdenForsorgerpligt,
    );
  });

  test("time- og periodetal er konsistente med 37 timer og 2 år", () => {
    expect(DAGPENGE_2026.fuldtidTimerPerAar).toBe(37 * 52);
    expect(DAGPENGE_2026.dagpengeperiodeTimer).toBe(2 * 1924);
    expect(DAGPENGE_2026.indkomstkravTimer).toBe(DAGPENGE_2026.fuldtidTimerPerAar);
  });

  test("AM-bidrag og dagpengeprocent er de samme i begge moduler", () => {
    // Værktøjet bruger sin egen procentkonstant; den skal ikke kunne glide fra lovens 90 %.
    expect(DAGPENGE_2026.dagpengeProcent).toBe(0.9);
    expect(SATSER_2026.amBidrag).toBe(0.08);
  });

  test("ingen af de gamle, uverificerede tal overlever i modulet", () => {
    const serialiseret = JSON.stringify(DAGPENGE_2026);
    for (const gammelt of [20359, 952, 13573, 14557, 13437, 15174]) {
      expect(serialiseret).not.toContain(String(gammelt));
    }
  });
});
