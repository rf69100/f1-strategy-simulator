import { TyreCompound, Driver, RaceStrategy, PitStop, WeatherCondition, TeamName } from '../types/f1';
import { TYRE_PERFORMANCE, CIRCUIT_DATA, TEAM_DATA, DRIVER_DATA } from './f1Data';

// === STRATÉGIES DE BASE AVEC DONNÉES F1 ===
export const TYRE_STRATEGIES = {
  HYPER_AGGRESSIVE: {
    name: 'Hyper Agressif',
    description: '2-3 arrêts, pneus tendres uniquement',
    targetStops: 3,
    preferredCompound: 'SOFT' as TyreCompound,
    risk: 'VERY_HIGH',
    fuelLoad: 'LOW',
    pace: 'QUALIFYING'
  },
  AGGRESSIVE: {
    name: 'Agressif',
    description: '2-3 arrêts, mélange pneus tendres/medium',
    targetStops: 2,
    preferredCompound: 'SOFT' as TyreCompound,
    risk: 'HIGH',
    fuelLoad: 'MEDIUM',
    pace: 'PUSH'
  },
  BALANCED: {
    name: 'Équilibré',
    description: 'Stratégie standard 2 arrêts',
    targetStops: 2,
    preferredCompound: 'MEDIUM' as TyreCompound,
    risk: 'MEDIUM',
    fuelLoad: 'MEDIUM',
    pace: 'RACE'
  },
  CONSERVATIVE: {
    name: 'Conservateur',
    description: '1-2 arrêts, pneus durs pour fiabilité',
    targetStops: 1,
    preferredCompound: 'HARD' as TyreCompound,
    risk: 'LOW',
    fuelLoad: 'HIGH',
    pace: 'MANAGEMENT'
  },
  WET_AGGRESSIVE: {
    name: 'Pluie Agressive',
    description: 'Arrêts fréquents pour adapter aux conditions',
    targetStops: 3,
    preferredCompound: 'INTERMEDIATE' as TyreCompound,
    risk: 'HIGH',
    fuelLoad: 'MEDIUM',
    pace: 'WET_PUSH'
  },
  WET_CONSERVATIVE: {
    name: 'Pluie Conservateur',
    description: 'Peu d\'arrêts, attendre la ligne sèche',
    targetStops: 1,
    preferredCompound: 'WET' as TyreCompound,
    risk: 'LOW',
    fuelLoad: 'HIGH',
    pace: 'WET_MANAGEMENT'
  }
};

// === CALCUL STRATÉGIE OPTIMALE AVEC DONNÉES F1 ===
export const calculateOptimalStrategy = (
  driver: Driver,
  totalLaps: number,
  weather: WeatherCondition,
  remainingTyres: Record<TyreCompound, number>,
  circuitId: string = 'monaco'
): RaceStrategy => {
  const currentLap = driver.currentLap || 1;
  const lapsRemaining = totalLaps - currentLap;
  const circuit = CIRCUIT_DATA[circuitId as keyof typeof CIRCUIT_DATA] || CIRCUIT_DATA.monaco;
  const driverData = DRIVER_DATA[driver.name as keyof typeof DRIVER_DATA];
  const teamData = TEAM_DATA[driver.team];
  
  // Adaptation selon la météo
  if (weather === 'WET' || weather === 'DRIZZLE') {
    return createWetWeatherStrategy(driver, lapsRemaining, weather, circuit, driverData);
  }
  
  // Stratégie selon l'usure actuelle et caractéristiques circuit
  const currentTyreWear = driver.tyres?.wear || 0;
  const tyreAge = driver.tyres?.age || 0;
  const circuitTyreWear = circuit.tyreWear;
  const driverAggression = driverData?.aggression || 0.8;
  
  let strategy;
  
  // Logique de sélection de stratégie basée sur multiples facteurs
  if (lapsRemaining <= 15) {
    // Fin de course - stratégie courte
    strategy = currentTyreWear > 60 ? TYRE_STRATEGIES.AGGRESSIVE : TYRE_STRATEGIES.BALANCED;
  } else if (lapsRemaining >= 40) {
    // Début de course - stratégie longue
    strategy = circuitTyreWear > 1.2 ? TYRE_STRATEGIES.CONSERVATIVE : TYRE_STRATEGIES.BALANCED;
  } else {
    // Milieu de course - stratégie adaptative
    if (currentTyreWear > 80 || tyreAge > 20) {
      strategy = TYRE_STRATEGIES.HYPER_AGGRESSIVE;
    } else if (currentTyreWear < 40 && driverAggression > 0.7) {
      strategy = TYRE_STRATEGIES.AGGRESSIVE;
    } else {
      strategy = TYRE_STRATEGIES.BALANCED;
    }
  }
  
  // Ajustement basé sur performance équipe
  if (teamData?.performance > 0.9) {
    // Équipes performantes peuvent prendre plus de risques
    if (strategy.risk === 'MEDIUM') strategy = TYRE_STRATEGIES.AGGRESSIVE;
  }
  
  return createStrategyFromTemplate(driver, strategy, lapsRemaining, remainingTyres, circuit, teamData);
};

// === CRÉATION STRATÉGIE PLUIE AVEC DONNÉES F1 ===
const createWetWeatherStrategy = (
  driver: Driver,
  lapsRemaining: number,
  weather: WeatherCondition,
  circuit: any,
  driverData: any
): RaceStrategy => {
  const pitStops: PitStop[] = [];
  const driverAggression = driverData?.aggression || 0.8;
  
  let strategy;
  
  if (weather === 'WET') {
    strategy = driverAggression > 0.7 ? TYRE_STRATEGIES.WET_AGGRESSIVE : TYRE_STRATEGIES.WET_CONSERVATIVE;
  } else {
    // DRIZZLE - stratégie intermédiaire
    strategy = TYRE_STRATEGIES.WET_AGGRESSIVE;
  }
  
  if (lapsRemaining > 20) {
    // Arrêts prévus pour adaptation aux conditions
    const stopLap1 = (driver.currentLap || 1) + Math.floor(lapsRemaining * 0.3);
    const stopLap2 = (driver.currentLap || 1) + Math.floor(lapsRemaining * 0.7);
    
    pitStops.push({
      lap: stopLap1,
      tyreCompound: 'INTERMEDIATE',
      fuelAdded: calculateFuelForStint(lapsRemaining * 0.4, circuit),
      duration: 3.2,
      predictedLapTime: calculateWetLapTime(circuit, 'INTERMEDIATE')
    });
    
    if (strategy.targetStops > 1) {
      pitStops.push({
        lap: stopLap2,
        tyreCompound: 'INTERMEDIATE',
        fuelAdded: calculateFuelForStint(lapsRemaining * 0.3, circuit),
        duration: 3.0,
        predictedLapTime: calculateWetLapTime(circuit, 'INTERMEDIATE')
      });
    }
  }
  
  return {
    driverId: driver.id,
    plannedStops: pitStops.length,
    pitStops,
    targetCompound: strategy.preferredCompound,
    riskLevel: strategy.risk as 'LOW' | 'MEDIUM' | 'HIGH',
    expectedRaceTime: calculateExpectedRaceTime(driver, pitStops, lapsRemaining, circuit, weather)
  };
};

// === CRÉATION STRATÉGIE À PARTIR D'UN TEMPLATE AVEC DONNÉES F1 ===
const createStrategyFromTemplate = (
  driver: Driver,
  strategy: any,
  lapsRemaining: number,
  remainingTyres: Record<TyreCompound, number>,
  circuit: any,
  teamData: any
): RaceStrategy => {
  const pitStops: PitStop[] = [];
  const stops = Math.min(strategy.targetStops, 3); // Max 3 arrêts
  
  // Répartition des tours entre les arrêts avec données circuit
  const stintLengths = calculateStintLengths(lapsRemaining, stops, strategy.preferredCompound, circuit);
  
  let currentLap = driver.currentLap || 1;
  let totalRaceTime = driver.totalTime || 0;
  
  for (let i = 0; i < stops; i++) {
    const stintLaps = stintLengths[i];
    currentLap += stintLaps;
    
    // Choix du compound selon disponibilité et performance
    const availableCompound = chooseOptimalCompound(
      strategy.preferredCompound, 
      remainingTyres, 
      stintLaps,
      circuit
    );
    
    const fuelToAdd = calculateFuelForStint(stintLaps, circuit);
    const pitStopTime = predictPitStopTime(availableCompound, fuelToAdd, teamData);
    const stintTime = calculateStintTime(stintLaps, availableCompound, circuit, driver);
    
    pitStops.push({
      lap: currentLap,
      tyreCompound: availableCompound,
      fuelAdded: fuelToAdd,
      duration: pitStopTime,
      predictedLapTime: stintTime / stintLaps
    });
    
    totalRaceTime += stintTime + pitStopTime;
  }
  
  // Dernière stint
  const finalStintLaps = lapsRemaining - stintLengths.reduce((sum, laps) => sum + laps, 0);
  const finalStintTime = calculateStintTime(finalStintLaps, strategy.preferredCompound, circuit, driver);
  totalRaceTime += finalStintTime;
  
  return {
    driverId: driver.id,
    plannedStops: stops,
    pitStops,
    targetCompound: strategy.preferredCompound,
    riskLevel: strategy.risk as 'LOW' | 'MEDIUM' | 'HIGH',
    expectedRaceTime: totalRaceTime
  };
};

// === CALCUL RÉPARTITION TOURS AVEC DONNÉES CIRCUIT ===
const calculateStintLengths = (
  totalLaps: number,
  stops: number,
  preferredCompound: TyreCompound,
  circuit: any
): number[] => {
  const stintLengths: number[] = [];
  const baseStintLength = totalLaps / (stops + 1);
  
  // Ajustement selon le compound et le circuit
  const tyrePerf = TYRE_PERFORMANCE[preferredCompound];
  const compoundMultiplier = 1.0 - (tyrePerf.durability * 0.3); // Moins durable = stints plus courtes
  const circuitMultiplier = circuit.tyreWear;
  
  const adjustedBaseLength = baseStintLength * compoundMultiplier * circuitMultiplier;
  
  for (let i = 0; i < stops; i++) {
    let stintLength = adjustedBaseLength;
    
    // Variation stratégique (première stint souvent plus longue)
    if (i === 0) stintLength *= 1.1;
    if (i === stops - 1) stintLength *= 0.9;
    
    // Variation aléatoire réaliste
    stintLength *= (0.85 + Math.random() * 0.3);
    
    stintLengths.push(Math.max(5, Math.floor(stintLength))); // Minimum 5 tours
  }
  
  // Ajustement pour le total
  const total = stintLengths.reduce((sum, laps) => sum + laps, 0);
  const adjustment = Math.min(totalLaps - 5, totalLaps - total); // Garder au moins 5 tours pour la dernière stint
  
  if (adjustment !== 0 && stintLengths.length > 0) {
    stintLengths[stintLengths.length - 1] += adjustment;
  }
  
  return stintLengths;
};

// === CHOIX COMPOUND OPTIMAL AVEC DONNÉES PERFORMANCE ===
const chooseOptimalCompound = (
  preferred: TyreCompound,
  remaining: Record<TyreCompound, number>,
  stintLength: number,
  circuit: any
): TyreCompound => {
  // Vérifier d'abord le compound préféré
  if (remaining[preferred] > 0) {
    const tyrePerf = TYRE_PERFORMANCE[preferred];
    const expectedLaps = tyrePerf.durability * 40; // 40 tours référence
    
    if (stintLength <= expectedLaps * 1.1) {
      return preferred;
    }
  }
  
  // Chercher le meilleur compound alternatif
  const alternatives: TyreCompound[] = ['MEDIUM', 'HARD', 'SOFT', 'INTERMEDIATE'];
  let bestCompound = preferred;
  let bestScore = -1;
  
  for (const compound of alternatives) {
    if (remaining[compound] > 0) {
      const tyrePerf = TYRE_PERFORMANCE[compound];
      const durabilityScore = stintLength <= (tyrePerf.durability * 40) ? 1 : 0;
      const gripScore = tyrePerf.grip;
      const circuitFit = 0.5; // Valeur par défaut puisque downforceImportance n'existe pas
      
      const score = (gripScore * 0.6) + (durabilityScore * 0.3) + (circuitFit * 0.1);
      
      if (score > bestScore) {
        bestScore = score;
        bestCompound = compound;
      }
    }
  }
  
  return bestCompound;
};

// === PRÉDICTION TEMPS ARRÊT AVEC DONNÉES ÉQUIPE ===
export const predictPitStopTime = (
  compound: TyreCompound,
  fuelAdded: number,
  teamData: any
): number => {
  let baseTime = 2.2; // Temps base en secondes
  
  // Performance équipe (meilleure équipe = pit stops plus rapides)
  const teamPerformance = teamData?.performance || 0.8;
  const teamMultiplier = 1.2 - (teamPerformance * 0.4);
  
  // Impact changement pneus selon compound
  const tyreTime = {
    'SOFT': 0,
    'MEDIUM': 0,
    'HARD': 0,
    'INTERMEDIATE': 0.15,
    'WET': 0.25
  }[compound];
  
  // Impact ajout carburant
  const fuelTime = fuelAdded * 0.015;
  
  // Variation aléatoire réaliste
  const randomVariation = (Math.random() - 0.5) * 0.4;
  
  const totalTime = (baseTime + tyreTime + fuelTime) * teamMultiplier + randomVariation;
  
  return Math.max(1.8, Math.min(4.0, totalTime)); // Bornes réalistes
};

// === CALCULS AUXILIAIRES ===
const calculateFuelForStint = (stintLaps: number, circuit: any): number => {
  const baseConsumption = 1.8; // kg/tour
  return Math.min(100, stintLaps * baseConsumption * circuit.fuelEffect);
};

const calculateStintTime = (laps: number, compound: TyreCompound, circuit: any, driver: Driver): number => {
  const baseLapTime = 90; // Temps de base en secondes
  const tyrePerf = TYRE_PERFORMANCE[compound];
  const adjustedLapTime = baseLapTime * (1.1 - (tyrePerf.grip * 0.2));
  
  return laps * adjustedLapTime;
};

const calculateWetLapTime = (circuit: any, compound: TyreCompound): number => {
  const baseLapTime = 90; // Temps de base en secondes
  const wetMultiplier = compound === 'WET' ? 1.35 : 1.15;
  return baseLapTime * wetMultiplier;
};

const calculateExpectedRaceTime = (
  driver: Driver, 
  pitStops: PitStop[], 
  lapsRemaining: number, 
  circuit: any, 
  weather: WeatherCondition
): number => {
  let totalTime = driver.totalTime || 0;
  const weatherMultiplier = weather === 'WET' ? 1.25 : weather === 'DRIZZLE' ? 1.1 : 1.0;
  
  // Temps pour les tours restants
  totalTime += lapsRemaining * 90 * weatherMultiplier; // 90 secondes par tour de base
  
  // Ajouter temps pit stops
  totalTime += pitStops.reduce((sum, stop) => sum + stop.duration, 0);
  
  return totalTime;
};

// Fonction exportée manquante
export const getOptimalPitStopLap = (
  driver: Driver,
  circuitId: string,
  weather: WeatherCondition
): number => {
  const circuit = CIRCUIT_DATA[circuitId as keyof typeof CIRCUIT_DATA] || CIRCUIT_DATA.monaco;
  const totalLaps = circuit.laps;
  const currentLap = driver.currentLap || 1;
  
  // Logique simplifiée pour le premier arrêt optimal
  if (weather === 'WET') {
    return Math.min(totalLaps - 5, currentLap + 10);
  }
  
  return Math.min(totalLaps - 10, currentLap + Math.floor(totalLaps * 0.3));
};