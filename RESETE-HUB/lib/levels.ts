// Umbrales de nivel inspirados en Skool (crecimiento exponencial).
// Nivel N requiere LEVELS[N-1] puntos acumulados.
const LEVELS = [0, 5, 20, 65, 155, 515, 2015, 8015, 33015];

export function levelFromPoints(points: number): {
  level: number;
  nextThreshold: number | null;
  currentThreshold: number;
} {
  let level = 1;
  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i]) level = i + 1;
  }
  const nextThreshold = LEVELS[level] ?? null;
  const currentThreshold = LEVELS[level - 1] ?? 0;
  return { level, nextThreshold, currentThreshold };
}
