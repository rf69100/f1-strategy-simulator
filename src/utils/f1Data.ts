import { TeamName, TyreCompound } from '../types/f1';

// === DONNÉES F1 RÉELLES 2026 ===

import { TeamData } from '../types/f1';

export const TEAM_DATA: Record<TeamName, TeamData> = {
  'Red Bull': { color: '#0600EF', performance: 0.97, reliability: 0.97, pitstop: 1.00 },
  'McLaren': { color: '#FF8700', performance: 0.96, reliability: 0.96, pitstop: 1.01 },
  'Mercedes': { color: '#00D2BE', performance: 0.95, reliability: 0.95, pitstop: 1.02 },
  'Ferrari': { color: '#DC0000', performance: 0.94, reliability: 0.94, pitstop: 1.03 },
  'Aston Martin': { color: '#006F62', performance: 0.90, reliability: 0.91, pitstop: 1.05 },
  'Alpine': { color: '#0090FF', performance: 0.87, reliability: 0.89, pitstop: 1.07 },
  'RB': { color: '#2B4562', performance: 0.86, reliability: 0.88, pitstop: 1.09 },
  'Sauber': { color: '#900000', performance: 0.84, reliability: 0.87, pitstop: 1.10 },
  'Williams': { color: '#005AFF', performance: 0.83, reliability: 0.86, pitstop: 1.12 },
  'Haas': { color: '#FFFFFF', performance: 0.81, reliability: 0.84, pitstop: 1.13 }
};

export const DRIVER_DATA: Record<string, { team: TeamName; aggression: number; consistency: number; nationality: string; photo: string; reliability?: number }> = {
  // Red Bull
  'Max Verstappen': { team: 'Red Bull', aggression: 0.99, consistency: 0.99, nationality: 'Néerlandais', photo: '/assets/icons/drivers/verstappen.png', reliability: 0.99 },
  'Liam Lawson': { team: 'Red Bull', aggression: 0.85, consistency: 0.87, nationality: 'Néo-Zélandais', photo: '/assets/icons/drivers/lawson.png', reliability: 0.92 },
  
  // Mercedes
  'Lewis Hamilton': { team: 'Mercedes', aggression: 0.97, consistency: 0.98, nationality: 'Britannique', photo: '/assets/icons/drivers/hamilton.png', reliability: 0.98 },
  'Andrea Kimi Antonelli': { team: 'Mercedes', aggression: 0.87, consistency: 0.89, nationality: 'Italien', photo: '/assets/icons/drivers/antonelli.png', reliability: 0.92 },
  
  // Ferrari
  'Charles Leclerc': { team: 'Ferrari', aggression: 0.96, consistency: 0.97, nationality: 'Monégasque', photo: '/assets/icons/drivers/leclerc.png', reliability: 0.97 },
  'Carlos Sainz': { team: 'Ferrari', aggression: 0.93, consistency: 0.95, nationality: 'Espagnol', photo: '/assets/icons/drivers/sainz.png', reliability: 0.95 },
  
  // McLaren
  'Lando Norris': { team: 'McLaren', aggression: 0.98, consistency: 0.98, nationality: 'Britannique', photo: '/assets/icons/drivers/norris.png', reliability: 0.98 },
  'Oscar Piastri': { team: 'McLaren', aggression: 0.94, consistency: 0.96, nationality: 'Australien', photo: '/assets/icons/drivers/piastri.png', reliability: 0.96 },
  
  // Aston Martin
  'Fernando Alonso': { team: 'Aston Martin', aggression: 0.95, consistency: 0.96, nationality: 'Espagnol', photo: '/assets/icons/drivers/alonso.png', reliability: 0.96 },
  'Lance Stroll': { team: 'Aston Martin', aggression: 0.82, consistency: 0.85, nationality: 'Canadien', photo: '/assets/icons/drivers/stroll.png', reliability: 0.89 },
  
  // Alpine
  'Pierre Gasly': { team: 'Alpine', aggression: 0.88, consistency: 0.90, nationality: 'Français', photo: '/assets/icons/drivers/gasly.png', reliability: 0.91 },
  'Jack Doohan': { team: 'Alpine', aggression: 0.85, consistency: 0.87, nationality: 'Australien', photo: '/assets/icons/drivers/doohan.png', reliability: 0.89 },
  
  // Williams
  'Alexander Albon': { team: 'Williams', aggression: 0.86, consistency: 0.89, nationality: 'Thaïlandais', photo: '/assets/icons/drivers/albon.png', reliability: 0.90 },
  'Franco Colapinto': { team: 'Williams', aggression: 0.81, consistency: 0.84, nationality: 'Argentin', photo: '/assets/icons/drivers/colapinto.png', reliability: 0.87 },
  
  // RB
  'Yuki Tsunoda': { team: 'RB', aggression: 0.87, consistency: 0.89, nationality: 'Japonais', photo: '/assets/icons/drivers/tsunoda.png', reliability: 0.89 },
  'Isack Hadjar': { team: 'RB', aggression: 0.83, consistency: 0.86, nationality: 'Français', photo: '/assets/icons/drivers/hadjar.png', reliability: 0.87 },
  
  // Sauber
  'Nico Hulkenberg': { team: 'Sauber', aggression: 0.83, consistency: 0.86, nationality: 'Allemand', photo: '/assets/icons/drivers/hulkenberg.png', reliability: 0.88 },
  'Gabriel Bortoleto': { team: 'Sauber', aggression: 0.81, consistency: 0.84, nationality: 'Brésilien', photo: '/assets/icons/drivers/bortoleto.png', reliability: 0.86 },
  
  // Haas
  'Oliver Bearman': { team: 'Haas', aggression: 0.82, consistency: 0.85, nationality: 'Britannique', photo: '/assets/icons/drivers/bearman.png', reliability: 0.87 },
  'Esteban Ocon': { team: 'Haas', aggression: 0.80, consistency: 0.83, nationality: 'Français', photo: '/assets/icons/drivers/ocon.png', reliability: 0.85 }
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
  poleTime: number; // seconds
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
    drsZones: 1,
    poleTime: 70.2, // 1:10.2
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
    drsZones: 2,
    poleTime: 86.7, // 1:26.7
  },
  'spa': {
    poleTime: 104.5, // 1:44.5
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
    poleTime: 80.7, // 1:20.7
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
    poleTime: 72.7, // 1:12.7
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
    poleTime: 77.6, // 1:17.6
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
  poleTime: 86.2, // 1:26.2
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
  poleTime: 92.3, // 1:32.3
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
  poleTime: 68.7, // 1:08.7
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
  poleTime: 70.2, // 1:10.2
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
  poleTime: 92.1, // 1:32.1
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
  drsZones: 3,
  poleTime: 89.7, // 1:29.7
  },
  'jeddah': {
  poleTime: 87.9, // 1:27.9
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
  poleTime: 78.3, // 1:18.3
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
  poleTime: 104.4, // 1:44.4
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
  poleTime: 83.1, // 1:23.1
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
  poleTime: 94.7, // 1:34.7
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
  poleTime: 77.0, // 1:17.0 (fictional)
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
  poleTime: 73.5, // 1:13.5 (fictional)
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