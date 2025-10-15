import { TyreCompound, WeatherCondition } from '../types/f1';
import { TYRE_PERFORMANCE, CIRCUIT_DATA } from './f1Data';

// === CONSTANTES PHYSIQUES RÉALISTES ===
export const BASE_FUEL_CONSUMPTION = 1.8; // kg/tour (réaliste F1)
export const FUEL_EFFECT_PER_KG = 0.025; // Secondes par kg de carburant
export const TYRE_WEAR_EFFECT = 0.04; // Secondes par % d'usure
export const SAFETY_CAR_MULTIPLIER = 1.25;
export const VSC_MULTIPLIER = 1.1;
export const DRS_EFFECT = 0.3; // Secondes gagnées avec DRS
export const SLIPSTREAM_EFFECT = 0.15; // Secondes gagnées en aspiration

// Interface pour les facteurs de temps au tour
export interface LapTimeFactors {
  tyreWear: number;
  fuelLoad: number;
  trackEvolution: number;
  driverPerformance: number;
  weatherImpact: number;
  traffic: number;
  carPerformance: number;
  tyreCompound: TyreCompound;
  drsEffect: number;
}

// === CALCULS DE PERFORMANCE RÉALISTES ===
export const calculateLapTime = (
  baseTime: number,
  factors: LapTimeFactors,
  circuitId: string = 'monaco'
): number => {
  const {
    tyreWear,
    fuelLoad,
    trackEvolution,
    driverPerformance,
    weatherImpact,
    traffic,
    carPerformance,
    tyreCompound,
    drsEffect
  } = factors;

  const circuit = CIRCUIT_DATA[circuitId as keyof typeof CIRCUIT_DATA] || CIRCUIT_DATA.monaco;
  
  let lapTime = baseTime;
  
  // Effet usure pneus (non-linéaire - plus important en fin de vie)
  const tyreEffect = tyreWear < 50 
    ? tyreWear * TYRE_WEAR_EFFECT 
    : 50 * TYRE_WEAR_EFFECT + (tyreWear - 50) * TYRE_WEAR_EFFECT * 1.5;
  lapTime += tyreEffect;
  
  // Effet carburant (non-linéaire - plus sensible en fin de course)
  const fuelEffect = (100 - fuelLoad) * FUEL_EFFECT_PER_KG * circuit.fuelEffect;
  lapTime += fuelEffect;
  
  // Performance du pilote (influence sur la consistance)
  lapTime += driverPerformance * (1 - carPerformance) * 0.5;
  
  // Performance de la voiture
  lapTime -= carPerformance * 2.0; // Meilleure voiture = meilleur temps
  
  // Effet compound pneus
  const tyrePerf = TYRE_PERFORMANCE[tyreCompound];
  lapTime -= tyrePerf.grip * 1.5; // Meilleure adhérence = meilleur temps
  
  // Évolution de la piste
  lapTime -= trackEvolution * 0.15;
  
  // Impact météo
  lapTime *= weatherImpact;
  
  // Traffic (ralentissement exponentiel dans le traffic serré)
  const trafficEffect = traffic < 0.3 ? 0 : Math.pow(traffic, 2) * 0.5;
  lapTime += trafficEffect;
  
  // Effet DRS
  lapTime -= drsEffect * DRS_EFFECT;
  
  // Effet circuit spécifique (utilisation du nombre de virages comme indicateur de difficulté)
  lapTime *= (1 + ((circuit.corners / 20) * 0.1));
  
  // Variation aléatoire réaliste (plus faible pour les bons pilotes)
  const consistency = 1 - Math.abs(driverPerformance) / 2;
  const randomVariation = (Math.random() - 0.5) * 0.3 * consistency;
  lapTime += randomVariation;
  
  return Math.max(lapTime, baseTime * 0.85); // Temps minimum réaliste
};

// === CALCUL USURE PNEUS RÉALISTE ===
export const calculateTyreWear = (
  compound: TyreCompound,
  currentWear: number,
  trackTemp: number,
  driverAggression: number = 0.8,
  circuitId: string = 'monaco'
): number => {
  const circuit = CIRCUIT_DATA[circuitId as keyof typeof CIRCUIT_DATA] || CIRCUIT_DATA.monaco;
  const tyrePerf = TYRE_PERFORMANCE[compound];
  
  // Dégradation de base selon le compound
  const baseDegradation = {
    'SOFT': 2.8,
    'MEDIUM': 1.9,
    'HARD': 1.3,
    'INTERMEDIATE': 1.6,
    'WET': 0.9
  }[compound];

  // Effet température piste (optimum autour de 35-40°C)
  let tempEffect = 1.0;
  if (trackTemp < 30) tempEffect = 0.7; // Trop froid
  else if (trackTemp > 45) tempEffect = 1.4; // Trop chaud
  else if (trackTemp > 35 && trackTemp <= 40) tempEffect = 0.9; // Optimal

  // Effet du circuit sur l'usure
  const circuitEffect = circuit.tyreWear;
  
  // Effet agression du pilote
  const aggressionEffect = 0.8 + (driverAggression * 0.4);
  
  // Usure accélérée en fin de vie des pneus
  let wearMultiplier = 1.0;
  if (currentWear > 80) wearMultiplier = 1.8;
  else if (currentWear > 60) wearMultiplier = 1.3;
  else if (currentWear > 40) wearMultiplier = 1.1;
  
  // Durabilité du compound
  const durabilityEffect = 1.5 - tyrePerf.durability;
  
  // Usure calculée
  const wearIncrease = baseDegradation * tempEffect * circuitEffect * aggressionEffect * wearMultiplier * durabilityEffect * (0.8 + Math.random() * 0.4);
  
  return Math.min(100, currentWear + wearIncrease);
};

// === CALCUL CONSOMMATION CARBURANT RÉALISTE ===
export const calculateFuelConsumption = (
  baseConsumption: number = BASE_FUEL_CONSUMPTION,
  weather: WeatherCondition,
  safetyCar: boolean = false,
  vsc: boolean = false,
  circuitId: string = 'monaco'
): number => {
  const circuit = CIRCUIT_DATA[circuitId as keyof typeof CIRCUIT_DATA] || CIRCUIT_DATA.monaco;
  
  let consumption = baseConsumption;
  
  // Effet circuit
  consumption *= circuit.fuelEffect;
  
  // Réduction sous Safety Car/VSC
  if (safetyCar) {
    consumption *= 0.4;
  } else if (vsc) {
    consumption *= 0.7;
  }
  
  // Impact météo
  if (weather === 'WET') {
    consumption *= 0.75; // Moins de consommation sous la pluie (moins de pleine puissance)
  } else if (weather === 'DRIZZLE') {
    consumption *= 0.85;
  }
  
  // Variation aléatoire réaliste
  consumption *= (0.85 + Math.random() * 0.3);
  
  return Math.max(0.5, consumption); // Consommation minimum réaliste
};

// === CALCUL EFFET MÉTÉO RÉALISTE ===
export const getWeatherMultiplier = (weather: WeatherCondition): number => {
  const baseMultipliers = {
    'DRY': 1.0,
    'DRIZZLE': 1.12,
    'WET': 1.25
  };
  
  return baseMultipliers[weather];
};

// === CALCUL DÉGRADATION PISTE RÉALISTE ===
export const calculateTrackEvolution = (lapNumber: number, totalLaps: number, weather: WeatherCondition): number => {
  let evolution = 0;
  
  if (weather === 'DRY') {
    // En conditions sèches, la piste s'améliore puis se stabilise
    const peakEvolutionLap = Math.min(15, totalLaps * 0.2);
    if (lapNumber <= peakEvolutionLap) {
      evolution = lapNumber / peakEvolutionLap; // Amélioration linéaire
    } else {
      evolution = 1.0 - ((lapNumber - peakEvolutionLap) / (totalLaps - peakEvolutionLap)) * 0.3; // Légère dégradation
    }
  } else {
    // En conditions humides, évolution différente
    evolution = Math.min(1.0, lapNumber * 0.05);
  }
  
  return Math.max(0.3, evolution);
};

// === SIMULATION DÉPASSEMENT RÉALISTE ===
export const simulateOvertake = (
  attackerPerformance: number, // Performance relative de l'attaquant (0-1)
  defenderPerformance: number, // Performance relative du défenseur (0-1)
  tyreDifference: number, // Différence d'usure (attacker - defender, en %)
  drsAvailable: boolean = false,
  circuitOvertakingDifficulty: number = 0.5
): { success: boolean; timeLost: number } => {
  
  // Avantage performance
  const performanceAdvantage = attackerPerformance - defenderPerformance;
  
  // Avantage pneus (non-linéaire)
  let tyreAdvantage = 0;
  if (tyreDifference < -15) tyreAdvantage = 0.4; // Pneus beaucoup plus frais
  else if (tyreDifference < -8) tyreAdvantage = 0.2; // Pneus plus frais
  else if (tyreDifference > 15) tyreAdvantage = -0.3; // Pneus beaucoup plus usés
  
  // Effet DRS
  const drsAdvantage = drsAvailable ? 0.25 : 0;
  
  // Difficulté du circuit
  const circuitModifier = 1.0 - circuitOvertakingDifficulty;
  
  // Chance totale de dépassement
  let successChance = 0.3 + (performanceAdvantage * 0.4) + tyreAdvantage + drsAdvantage;
  successChance *= circuitModifier;
  
  // Variation aléatoire
  successChance += (Math.random() - 0.5) * 0.2;
  
  const success = successChance > 0.5;
  
  // Temps perdu en cas d'échec
  const timeLost = success ? 0 : 0.8 + Math.random() * 0.4;
  
  return { success, timeLost };
};

// === CALCUL TEMPS PIT STOP RÉALISTE ===
export const calculatePitStopTime = (
  _compound: TyreCompound,
  fuelToAdd: number,
  teamPerformance: number = 0.8
): number => {
  // Temps de base pour changement pneus
  const baseTyreTime = 2.2; // secondes
  
  // Temps pour ajout carburant (si nécessaire)
  const fuelTime = fuelToAdd > 0 ? 0.5 + (fuelToAdd * 0.02) : 0;
  
  // Temps total base
  let totalTime = baseTyreTime + fuelTime;
  
  // Effet performance équipe
  const teamEffect = 1.2 - (teamPerformance * 0.4);
  totalTime *= teamEffect;
  
  // Variation aléatoire réaliste
  totalTime *= (0.9 + Math.random() * 0.2);
  
  return Math.max(1.8, totalTime); // Minimum réaliste
};

// === CALCUL EFFET TEMPÉRATURE ===
export const calculateTemperatureEffects = (
  airTemp: number,
  trackTemp: number,
  weather: WeatherCondition
): { engineEfficiency: number; tyrePerformance: number; brakeEfficiency: number } => {
  
  // Efficacité moteur (optimum 20-30°C)
  let engineEfficiency = 1.0;
  if (airTemp < 15) engineEfficiency = 0.9;
  else if (airTemp > 35) engineEfficiency = 0.85;
  
  // Performance pneus (optimum 35-40°C piste)
  let tyrePerformance = 1.0;
  if (trackTemp < 25) tyrePerformance = 0.7;
  else if (trackTemp > 45) tyrePerformance = 0.8;
  else if (trackTemp >= 35 && trackTemp <= 40) tyrePerformance = 1.1;
  
  // Efficacité freins
  let brakeEfficiency = 1.0;
  if (trackTemp > 50) brakeEfficiency = 0.9;
  if (weather === 'WET') brakeEfficiency *= 1.1; // Meilleur refroidissement
  
  return { engineEfficiency, tyrePerformance, brakeEfficiency };
};