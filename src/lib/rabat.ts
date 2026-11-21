export interface RabatResultat {
  besparelse: number;
  prisEfterRabat: number;
  besparelseProcent: number;
}

export function prisEfterRabat(originalPris: number, rabatProcent: number): RabatResultat | null {
  if (originalPris < 0 || rabatProcent < 0 || rabatProcent > 100) return null;

  const besparelse = originalPris * (rabatProcent / 100);
  const prisEfterRabat = originalPris - besparelse;

  return {
    besparelse,
    prisEfterRabat,
    besparelseProcent: rabatProcent,
  };
}

export function findRabatProcent(originalPris: number, prisEfter: number): RabatResultat | null {
  if (originalPris <= 0 || prisEfter < 0 || prisEfter > originalPris) return null;

  const rabatProcent = ((originalPris - prisEfter) / originalPris) * 100;

  return {
    besparelse: originalPris - prisEfter,
    prisEfterRabat: prisEfter,
    besparelseProcent: rabatProcent,
  };
}