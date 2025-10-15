import { TeamName, TyreCompound } from '../types/f1';

// === DONNÉES F1 RÉELLES 2026 ===

import { TeamData } from '../types/f1';

export const TEAM_DATA: Record<TeamName, TeamData> = {
  'Red Bull': { color: '#0600EF', performance: 0.95, reliability: 0.92, pitstop: 1.0 },
  'Mercedes': { color: '#00D2BE', performance: 0.90, reliability: 0.95, pitstop: 0.98 },
  'Ferrari': { color: '#DC0000', performance: 0.92, reliability: 0.88, pitstop: 1.03 },
  'McLaren': { color: '#FF8700', performance: 0.88, reliability: 0.90, pitstop: 1.05 },
  'Alpine': { color: '#0090FF', performance: 0.85, reliability: 0.87, pitstop: 1.08 },
  'Aston Martin': { color: '#006F62', performance: 0.87, reliability: 0.85, pitstop: 1.07 },
  'Sauber': { color: '#900000', performance: 0.82, reliability: 0.89, pitstop: 1.10 },
  'Haas': { color: '#FFFFFF', performance: 0.80, reliability: 0.83, pitstop: 1.12 },
  'RB': { color: '#2B4562', performance: 0.83, reliability: 0.86, pitstop: 1.09 },
  'Williams': { color: '#005AFF', performance: 0.81, reliability: 0.84, pitstop: 1.15 }
};

export const DRIVER_DATA: Record<string, { team: TeamName; aggression: number; consistency: number }> = {
  // Red Bull
  'Max Verstappen': { team: 'Red Bull', aggression: 0.9, consistency: 0.95 },
  'Liam Lawson': { team: 'Red Bull', aggression: 0.84, consistency: 0.87 }, // Nouveau
  
  // Mercedes
  'Lewis Hamilton': { team: 'Mercedes', aggression: 0.85, consistency: 0.98 },
  'Andrea Kimi Antonelli': { team: 'Mercedes', aggression: 0.86, consistency: 0.90 }, // Nouveau
  
  // Ferrari
  'Charles Leclerc': { team: 'Ferrari', aggression: 0.88, consistency: 0.90 },
  'Carlos Sainz': { team: 'Ferrari', aggression: 0.84, consistency: 0.93 },
  
  // McLaren
  'Lando Norris': { team: 'McLaren', aggression: 0.89, consistency: 0.91 },
  'Oscar Piastri': { team: 'McLaren', aggression: 0.83, consistency: 0.89 },
  
  // Aston Martin
  'Fernando Alonso': { team: 'Aston Martin', aggression: 0.83, consistency: 0.96 },
  'Lance Stroll': { team: 'Aston Martin', aggression: 0.82, consistency: 0.85 },
  
  // Alpine
  'Pierre Gasly': { team: 'Alpine', aggression: 0.85, consistency: 0.89 },
  'Jack Doohan': { team: 'Alpine', aggression: 0.83, consistency: 0.86 }, // Nouveau
  
  // Williams
  'Alexander Albon': { team: 'Williams', aggression: 0.84, consistency: 0.88 },
  'Franco Colapinto': { team: 'Williams', aggression: 0.82, consistency: 0.84 }, // Nouveau
  
  // RB
  'Yuki Tsunoda': { team: 'RB', aggression: 0.88, consistency: 0.86 },
  'Isack Hadjar': { team: 'RB', aggression: 0.85, consistency: 0.85 }, // Nouveau
  
  // Sauber
  'Nico Hulkenberg': { team: 'Sauber', aggression: 0.84, consistency: 0.86 },
  'Gabriel Bortoleto': { team: 'Sauber', aggression: 0.83, consistency: 0.87 }, // Nouveau
  
  // Haas
  'Oliver Bearman': { team: 'Haas', aggression: 0.85, consistency: 0.88 }, // Nouveau
  'Esteban Ocon': { team: 'Haas', aggression: 0.82, consistency: 0.87 }
};

export const CIRCUIT_DATA: Record<string, {
  name: string;
  lapDistance: number;
  laps: number;
  corners: number;
  topSpeed: number;
  averageSpeed: number;
  tyreWear: number;
  fuelEffect: number;
  drsZones: number;
}> = {
  // Europe
  'monaco': {
    name: 'Circuit de Monaco',
    lapDistance: 3.337,
    laps: 78,
    corners: 19,
    topSpeed: 280,
    averageSpeed: 160,
    tyreWear: 1.3,
    fuelEffect: 1.1,
    drsZones: 1
  },
  'silverstone': {
    name: 'Silverstone Circuit',
    lapDistance: 5.891,
    laps: 52,
    corners: 18,
    topSpeed: 320,
    averageSpeed: 230,
    tyreWear: 1.1,
    fuelEffect: 1.0,
    drsZones: 2
  },
  'spa': {
    name: 'Circuit de Spa-Francorchamps',
    lapDistance: 7.004,
    laps: 44,
    corners: 19,
    topSpeed: 340,
    averageSpeed: 240,
    tyreWear: 1.0,
    fuelEffect: 1.2,
    drsZones: 2
  },
  'monza': {
    name: 'Autodromo Nazionale Monza',
    lapDistance: 5.793,
    laps: 53,
    corners: 11,
    topSpeed: 360,
    averageSpeed: 250,
    tyreWear: 0.8,
    fuelEffect: 1.3,
    drsZones: 2
  },
  'barcelona': {
    name: 'Circuit de Barcelona-Catalunya',
    lapDistance: 4.675,
    laps: 66,
    corners: 16,
    topSpeed: 320,
    averageSpeed: 200,
    tyreWear: 1.2,
    fuelEffect: 1.1,
    drsZones: 2
  },
  'hungaroring': {
    name: 'Hungaroring',
    lapDistance: 4.381,
    laps: 70,
    corners: 14,
    topSpeed: 320,
    averageSpeed: 190,
    tyreWear: 1.4,
    fuelEffect: 1.0,
    drsZones: 1
  },

  // Amériques
  'miami': {
    name: 'Miami International Autodrome',
    lapDistance: 5.412,
    laps: 57,
    corners: 19,
    topSpeed: 320,
    averageSpeed: 220,
    tyreWear: 1.1,
    fuelEffect: 1.0,
    drsZones: 3
  },
  'cota': {
    name: 'Circuit of the Americas',
    lapDistance: 5.513,
    laps: 56,
    corners: 20,
    topSpeed: 320,
    averageSpeed: 210,
    tyreWear: 1.2,
    fuelEffect: 1.1,
    drsZones: 2
  },
  'interlagos': {
    name: 'Autódromo José Carlos Pace',
    lapDistance: 4.309,
    laps: 71,
    corners: 15,
    topSpeed: 340,
    averageSpeed: 220,
    tyreWear: 1.1,
    fuelEffect: 1.0,
    drsZones: 2
  },
  'montreal': {
    name: 'Circuit Gilles Villeneuve',
    lapDistance: 4.361,
    laps: 70,
    corners: 14,
    topSpeed: 330,
    averageSpeed: 210,
    tyreWear: 1.3,
    fuelEffect: 1.1,
    drsZones: 2
  },
  'las-vegas': {
    name: 'Las Vegas Street Circuit',
    lapDistance: 6.201,
    laps: 50,
    corners: 17,
    topSpeed: 340,
    averageSpeed: 230,
    tyreWear: 1.0,
    fuelEffect: 1.2,
    drsZones: 3
  },

  // Moyen-Orient & Asie
  'bahrain': {
    name: 'Bahrain International Circuit',
    lapDistance: 5.412,
    laps: 57,
    corners: 15,
    topSpeed: 330,
    averageSpeed: 210,
    tyreWear: 1.2,
    fuelEffect: 1.1,
    drsZones: 3
  },
  'jeddah': {
    name: 'Jeddah Corniche Circuit',
    lapDistance: 6.174,
    laps: 50,
    corners: 27,
    topSpeed: 330,
    averageSpeed: 250,
    tyreWear: 1.0,
    fuelEffect: 1.3,
    drsZones: 3
  },
  'suzuka': {
    name: 'Suzuka International Racing Course',
    lapDistance: 5.807,
    laps: 53,
    corners: 18,
    topSpeed: 330,
    averageSpeed: 220,
    tyreWear: 1.3,
    fuelEffect: 1.1,
    drsZones: 2
  },
  'singapore': {
    name: 'Marina Bay Street Circuit',
    lapDistance: 4.940,
    laps: 61,
    corners: 19,
    topSpeed: 300,
    averageSpeed: 170,
    tyreWear: 1.5,
    fuelEffect: 1.0,
    drsZones: 2
  },
  'abu-dhabi': {
    name: 'Yas Marina Circuit',
    lapDistance: 5.281,
    laps: 58,
    corners: 16,
    topSpeed: 320,
    averageSpeed: 210,
    tyreWear: 1.0,
    fuelEffect: 1.0,
    drsZones: 3
  },
  'shanghai': {
    name: 'Shanghai International Circuit',
    lapDistance: 5.451,
    laps: 56,
    corners: 16,
    topSpeed: 330,
    averageSpeed: 220,
    tyreWear: 1.1,
    fuelEffect: 1.1,
    drsZones: 2
  },

  // Nouveaux circuits 2026
  'madrid': {
    name: 'Madrid Street Circuit',
    lapDistance: 5.000,
    laps: 60,
    corners: 20,
    topSpeed: 320,
    averageSpeed: 200,
    tyreWear: 1.2,
    fuelEffect: 1.0,
    drsZones: 3
  },
  'kyalami': {
    name: 'Kyalami Grand Prix Circuit',
    lapDistance: 4.522,
    laps: 65,
    corners: 16,
    topSpeed: 320,
    averageSpeed: 210,
    tyreWear: 1.1,
    fuelEffect: 1.0,
    drsZones: 2
  }
};

export const TYRE_PERFORMANCE: Record<TyreCompound, { grip: number; durability: number; warmup: number }> = {
  'SOFT': { grip: 1.0, durability: 0.6, warmup: 0.9 },
  'MEDIUM': { grip: 0.85, durability: 0.8, warmup: 0.7 },
  'HARD': { grip: 0.7, durability: 1.0, warmup: 0.5 },
  'INTERMEDIATE': { grip: 0.6, durability: 0.9, warmup: 0.8 },
  'WET': { grip: 0.5, durability: 1.0, warmup: 0.6 }
};

// === FONCTIONS D'ACCÈS AUX DONNÉES ===
export const getDriverPerformance = (driverName: string) => {
  return DRIVER_DATA[driverName as keyof typeof DRIVER_DATA] || { team: 'Haas' as TeamName, aggression: 0.8, consistency: 0.85 };
};

export const getTeamPerformance = (teamName: TeamName) => {
  return TEAM_DATA[teamName];
};

export const getCircuitData = (circuitId: string) => {
  return CIRCUIT_DATA[circuitId as keyof typeof CIRCUIT_DATA] || CIRCUIT_DATA.monaco;
};

export const getTyrePerformance = (compound: TyreCompound) => {
  return TYRE_PERFORMANCE[compound];
};

// === GÉNÉRATION DONNÉES ALÉATOIRES POUR SIMULATION ===
export const generateRandomIncident = (_lap: number, driverAggression: number): boolean => {
  const baseChance = 0.002; // 0.2% de chance par tour
  const aggressionMultiplier = 1 + (driverAggression - 0.8) * 2; // Plus agressif = plus de risques
  const chance = baseChance * aggressionMultiplier;
  
  return Math.random() < chance;
};

export const generateSafetyCarProbability = (lap: number, incidents: number): number => {
  const baseProbability = 0.01; // 1% de base
  const incidentMultiplier = incidents * 0.1;
  const lapMultiplier = lap > 50 ? 1.2 : 1.0; // Plus probable en fin de course
  
  return Math.min(0.3, baseProbability + incidentMultiplier) * lapMultiplier;
};