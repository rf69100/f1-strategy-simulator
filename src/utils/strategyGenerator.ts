import { TyreCompound, WeatherCondition } from '../types/f1';

export interface StintPlan {
  compound: TyreCompound;
  laps: number;
  fuel: number;
}

export function generateDefaultStrategy(
  totalLaps: number,
  weather: WeatherCondition,
  circuitId: string
): StintPlan[] {
  // Example: Monaco 1–2 stops, other tracks 2–3 stops
  let stints: StintPlan[] = [];
  let stintLengths: number[];
  let compounds: TyreCompound[];
  if (weather === 'WET') {
    compounds = ['INTERMEDIATE', 'WET'];
    stintLengths = [Math.floor(totalLaps / 2), totalLaps - Math.floor(totalLaps / 2)];
  } else if (weather === 'DRIZZLE') {
    compounds = ['INTERMEDIATE', 'MEDIUM'];
    stintLengths = [Math.floor(totalLaps / 2), totalLaps - Math.floor(totalLaps / 2)];
  } else if (circuitId === 'monaco') {
    compounds = ['SOFT', 'MEDIUM'];
    stintLengths = [Math.floor(totalLaps * 0.6), totalLaps - Math.floor(totalLaps * 0.6)];
  } else {
    compounds = ['MEDIUM', 'HARD', 'SOFT'];
    stintLengths = [Math.floor(totalLaps * 0.4), Math.floor(totalLaps * 0.4), totalLaps - Math.floor(totalLaps * 0.8)];
  }
  let lap = 0;
  for (let i = 0; i < stintLengths.length; i++) {
    const laps = stintLengths[i];
    stints.push({
      compound: compounds[i % compounds.length],
      laps,
      fuel: Math.ceil(laps * 1.2) // 1.2kg/lap typical F1
    });
    lap += laps;
    if (lap >= totalLaps) break;
  }
  return stints;
}
