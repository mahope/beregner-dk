/**
 * Convert a temperature between Celsius, Fahrenheit and Kelvin.
 *
 *   °F = °C · 9/5 + 32
 *   K  = °C + 273.15
 */

export type TempEnhed = "celsius" | "fahrenheit" | "kelvin";

export interface TemperaturResultat {
  celsius: number;
  fahrenheit: number;
  kelvin: number;
}

const NUL_KELVIN = 273.15;

export function konverterTemperatur(vaerdi: number, fra: TempEnhed): TemperaturResultat | null {
  if (typeof vaerdi !== "number" || Number.isNaN(vaerdi)) return null;

  let celsius: number;
  switch (fra) {
    case "celsius":
      celsius = vaerdi;
      break;
    case "fahrenheit":
      celsius = (vaerdi - 32) * (5 / 9);
      break;
    case "kelvin":
      celsius = vaerdi - NUL_KELVIN;
      break;
  }

  return {
    celsius,
    fahrenheit: celsius * (9 / 5) + 32,
    kelvin: celsius + NUL_KELVIN,
  };
}
