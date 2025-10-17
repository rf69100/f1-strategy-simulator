// === TYPES DE BASE ===
export type TyreCompound = 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET';
export type SafetyCarStatus = 'NONE' | 'SC' | 'VSC';
export type WeatherCondition = 'DRY' | 'DRIZZLE' | 'WET';
export type TrackCondition = 'DRY' | 'WET' | 'DRYING';
export type TeamName = 'Red Bull' | 'Mercedes' | 'Ferrari' | 'McLaren' | 'Alpine' | 'Aston Martin' | 'Sauber' | 'Haas' | 'RB' | 'Williams';

export interface TeamData {
  color: string;
  performance: number;
  reliability: number;
  pitstop: number;
}
export type DriverStatus = 'RUNNING' | 'DNF' | 'PIT' | 'OUT';

// === INTERFACES PRINCIPALES ===
export interface Tyre {
  compound: TyreCompound;
  wear: number; // 0-100%
  age: number; // tours effectués
  degradationRate: number; // taux de dégradation spécifique
}

export interface Driver {
  id: string;
  name: string;
  team: TeamName;
  position: number;
  tyres: Tyre;
  fuel: number; // 0-100kg (ou % selon utilisation)
  lapTimes: number[];
  currentLap: number;
  pitStops: number;
  totalTime: number; // temps total cumulé en secondes
  status: DriverStatus;
  gapToLeader?: number; // écart au leader en secondes
  intervalToNext?: number; // intervalle au suivant en secondes
  strategy?: Array<{ compound: TyreCompound; laps: number; fuel: number }>;
  isUserControlled?: boolean;
}

export interface RaceSettings {
  totalLaps: number;
  trackName: string;
  circuitId: string;
  tyreAllocation: Record<TyreCompound, number>; // Plus flexible
  fuelCapacity: number; // kg
  team?: string; // Ajout : équipe utilisateur
  initialFuelPct?: number; // Pourcentage de carburant au départ (0-100)
  initialTyreCompound?: TyreCompound; // Compound initial choisi
}

export interface SimulationState {
  // État course
  isRaceRunning: boolean;
  currentLap: number;
  totalLaps: number;
  safetyCar: SafetyCarStatus;
  weather: WeatherCondition;
  trackCondition: TrackCondition;
  trackTemp: number;
  airTemp: number;
  
  // Données
  drivers: Driver[];
  raceSettings: RaceSettings;
  
  // Timing
  sessionTime: number; // temps écoulé depuis le début en ms
  lastLapTimestamp: number;
  incidents: number; // nombre d'incidents dans la course
}

// === TYPES POUR LES STRATÉGIES ===
export interface PitStop {
  lap: number;
  tyreCompound: TyreCompound;
  fuelAdded: number;
  duration: number; // durée du pit stop en secondes
  predictedLapTime?: number; // temps prévu après l'arrêt
}

export interface RaceStrategy {
  driverId: string;
  plannedStops: number;
  pitStops: PitStop[];
  targetCompound: TyreCompound;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'; // niveau de risque stratégique
  expectedRaceTime?: number; // temps total prévu
}

// === TYPES POUR LES CALCULS ===
export interface LapTimeFactors {
  tyreWear: number;
  fuelLoad: number;
  trackEvolution: number;
  driverPerformance: number;
  weatherImpact: number;
  traffic: number;
  carPerformance: number;
  tyreCompound: number;
  drsEffect: number;
}

export interface TelemetryData {
  timestamp: number;
  speed: number; // km/h
  rpm: number;
  throttle: number; // %
  brake: number; // %
  gear: number;
  drs: boolean;
  engineTemp: number; // °C
  brakeTemp: number; // °C
  lapTime: number;
  sector: 1 | 2 | 3;
  ersDeployment: number; // %
  fuelRemaining: number; // kg
}

// === TYPES POUR LES DONNÉES F1 RÉELLES ===
export interface TeamPerformance {
  color: string;
  performance: number; // 0-1
  reliability: number; // 0-1
  pitStopPerformance: number; // 0-1 (qualité des arrêts)
}

export interface DriverPerformance {
  team: TeamName;
  aggression: number; // 0-1
  consistency: number; // 0-1
  experience: number; // 0-1
  qualifyingSkill: number; // 0-1
  raceCraft: number; // 0-1
}

export interface CircuitData {
  name: string;
  lapDistance: number; // km
  laps: number;
  corners: number;
  topSpeed: number; // km/h
  averageSpeed: number; // km/h
  tyreWear: number; // multiplicateur usure pneus
  fuelEffect: number; // multiplicateur consommation
  drsZones: number;
  overtakingDifficulty: number; // 0-1
  downforceImportance: number; // 0-1
}

export interface TyrePerformance {
  grip: number; // 0-1
  durability: number; // 0-1
  warmup: number; // 0-1
  peakLaps: number; // nombre de tours au pic de performance
  workingRange: [number, number]; // plage de température optimale
}

// === TYPES POUR L'ANALYSE EN TEMPS RÉEL ===
export interface RaceAnalysis {
  fastestLap: {
    driverId: string;
    time: number;
    lap: number;
  };
  bestSectorTimes: [number, number, number]; // S1, S2, S3
  tyreStrategies: Record<TyreCompound, number>; // nombre de pilotes par compound
  pitStopWindow: {
    startLap: number;
    endLap: number;
    optimalLap: number;
  };
  safetyCarProbability: number; // 0-1
}

export interface DriverAnalysis {
  driverId: string;
  lapTimeConsistency: number; // 0-100%
  tyreManagement: number; // 0-100%
  fuelEfficiency: number; // 0-100%
  overtakes: number;
  positionsGained: number;
  performanceTrend: 'IMPROVING' | 'STABLE' | 'DEGRADING';
}

// === CONSTANTES ===
export const TYRE_COLORS: Record<TyreCompound, string> = {
  'SOFT': '#FF0000',
  'MEDIUM': '#FFD700', 
  'HARD': '#FFFFFF',
  'INTERMEDIATE': '#00FF00',
  'WET': '#0000FF'
};

export const TEAM_COLORS: Record<TeamName, string> = {
  'Red Bull': '#0600EF',
  'Mercedes': '#00D2BE',
  'Ferrari': '#DC0000',
  'McLaren': '#FF8700',
  'Alpine': '#0090FF',
  'Aston Martin': '#006F62',
  'Sauber': '#900000',
  'Haas': '#FFFFFF',
  'RB': '#2B4562',
  'Williams': '#005AFF'
};

export const WEATHER_ICONS: Record<WeatherCondition, string> = {
  'DRY': '☀️',
  'DRIZZLE': '🌧️',
  'WET': '⛈️'
};

export const SAFETY_CAR_LABELS: Record<SafetyCarStatus, string> = {
  'NONE': 'Course normale',
  'SC': 'Safety Car',
  'VSC': 'Virtual Safety Car'
};

// === TYPES UTILITAIRES ===
export type LapNumber = number;
export type TimeInSeconds = number;
export type SpeedInKPH = number;
export type TemperatureInCelsius = number;

// === TYPES POUR LES ÉVÉNEMENTS ===
export interface RaceEvent {
  type: 'PIT_STOP' | 'OVERTAKE' | 'INCIDENT' | 'SAFETY_CAR' | 'FASTEST_LAP' | 'DNF';
  lap: number;
  driverId?: string;
  description: string;
  timestamp: number;
}

// === TYPES POUR LE TIMING ===
export interface LapTime {
  driverId: string;
  lapNumber: number;
  time: number;
  sectors: [number, number, number];
  compound: TyreCompound;
  fuel: number;
}

export interface GapInfo {
  driverId: string;
  gapToLeader: number;
  intervalToNext: number;
  isLapped: boolean;
}

// === TYPES POUR LA SIMULATION ===
export interface SimulationConfig {
  timeAcceleration: number; // accélération du temps (1 = temps réel)
  realism: 'ARCADE' | 'SIMULATION' | 'REALISTIC';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  rules: {
    tyreChangeRequired: boolean;
    fuelLimit: boolean;
    drsEnabled: boolean;
    ersEnabled: boolean;
  };
}