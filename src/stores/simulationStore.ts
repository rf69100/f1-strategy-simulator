import { create } from 'zustand';
import { 
  SimulationState, 
  Driver, 
  TyreCompound, 
  SafetyCarStatus, 
  WeatherCondition,
  TeamName,
  RaceSettings 
} from '../types/f1';
import { 
  DRIVER_DATA, 
  TEAM_DATA, 
  CIRCUIT_DATA, 
  TYRE_PERFORMANCE,
  generateRandomIncident,
  generateSafetyCarProbability 
} from '../utils/f1Data';
import {
  calculateLapTime,
  calculateTyreWear,
  calculateFuelConsumption,
  getWeatherMultiplier,
  calculateTrackEvolution,
  simulateOvertake,
  calculateTemperatureEffects,
  BASE_FUEL_CONSUMPTION,
  LapTimeFactors
} from '../utils/physics';
import {
  calculateOptimalStrategy,
  predictPitStopTime
} from '../utils/strategy';

interface SimulationActions {
  startRace: () => void;
  stopRace: () => void;
  advanceLap: () => void;
  changeTyre: (driverId: string, compound: TyreCompound) => void;
  addFuel: (driverId: string, amount: number) => void;
  toggleSafetyCar: () => void;
  setWeather: (weather: WeatherCondition) => void;
  resetRace: () => void;
  setPitStop: (driverId: string, compound: TyreCompound, fuel: number) => void;
  setCircuit: (circuitId: string) => void;
  calculateDriverStrategy: (driverId: string) => any;
}

// Configuration de course basée sur circuit
const getRaceSettings = (circuitId: string = 'monaco'): RaceSettings => {
  const circuit = CIRCUIT_DATA[circuitId as keyof typeof CIRCUIT_DATA] || CIRCUIT_DATA.monaco;
  
  return {
    totalLaps: circuit.laps,
    trackName: circuit.name,
    circuitId: circuitId,
    tyreAllocation: {
      'SOFT': 8,
      'MEDIUM': 3,
      'HARD': 2,
      'INTERMEDIATE': 4,
      'WET': 2
    },
    fuelCapacity: 110 // kg
  };
};

// Création des pilotes basée sur les données F1 réelles
const createInitialDrivers = (circuitId: string = 'monaco'): Driver[] => {
  const drivers: Driver[] = [];
  const circuit = CIRCUIT_DATA[circuitId as keyof typeof CIRCUIT_DATA] || CIRCUIT_DATA.monaco;
  
  // Prendre les 10 premiers pilotes de DRIVER_DATA
  Object.entries(DRIVER_DATA).forEach(([driverName, driverData]) => {
    const teamData = TEAM_DATA[driverData.team];
    const baseLapTime = 90 * (1.1 - (teamData.performance * 0.15)); // 90 secondes de base
    
    drivers.push({
      id: driverName.toLowerCase().replace(' ', '-'),
      name: driverName,
      team: driverData.team,
      position: 0, // Sera calculé après
      tyres: { 
        compound: 'MEDIUM' as TyreCompound, 
        wear: 8 + Math.random() * 15,
        age: 1,
        degradationRate: getTyreDegradationRate('MEDIUM', teamData.performance, circuitId)
      },
      fuel: 95 + Math.random() * 8,
      lapTimes: [baseLapTime * (0.98 + Math.random() * 0.04)],
      currentLap: 1,
      pitStops: 0,
      totalTime: baseLapTime,
      status: 'RUNNING',
      gapToLeader: 0,
      intervalToNext: 0
    });
  });

  // Tri initial par performance
  return drivers.sort((a, b) => a.totalTime - b.totalTime)
    .map((driver, index) => ({ 
      ...driver, 
      position: index + 1,
      gapToLeader: index === 0 ? 0 : driver.totalTime - drivers[0].totalTime
    }));
};

// Helper function pour les taux de dégradation réalistes
const getTyreDegradationRate = (compound: TyreCompound, teamPerformance: number, circuitId: string): number => {
  const circuit = CIRCUIT_DATA[circuitId as keyof typeof CIRCUIT_DATA] || CIRCUIT_DATA.monaco;
  const baseRates: Record<TyreCompound, number> = {
    'SOFT': 2.8,
    'MEDIUM': 1.9,
    'HARD': 1.3,
    'INTERMEDIATE': 1.6,
    'WET': 0.9
  };
  
  const performanceFactor = 1.0 + (1 - teamPerformance) * 0.4;
  const circuitFactor = circuit.tyreWear;
  
  return baseRates[compound] * performanceFactor * circuitFactor;
};

// Simulation des dépassements entre pilotes
const simulateOvertakes = (drivers: Driver[], circuitId: string): Driver[] => {
  const circuit = CIRCUIT_DATA[circuitId as keyof typeof CIRCUIT_DATA] || CIRCUIT_DATA.monaco;
  let updatedDrivers = [...drivers];
  
  for (let i = 1; i < updatedDrivers.length; i++) {
    const attacker = updatedDrivers[i];
    const defender = updatedDrivers[i - 1];
    
    if (attacker.status !== 'RUNNING' || defender.status !== 'RUNNING') continue;
    
    const attackerData = DRIVER_DATA[attacker.name as keyof typeof DRIVER_DATA];
    const defenderData = DRIVER_DATA[defender.name as keyof typeof DRIVER_DATA];
    const attackerTeam = TEAM_DATA[attacker.team];
    const defenderTeam = TEAM_DATA[defender.team];
    
    if (!attackerData || !defenderData) continue;
    
    const tyreDifference = attacker.tyres.wear - defender.tyres.wear;
    const performanceDiff = attackerTeam.performance - defenderTeam.performance;
    const aggressionDiff = attackerData.aggression - defenderData.aggression;
    
    const { success, timeLost } = simulateOvertake(
      attackerTeam.performance + aggressionDiff,
      defenderTeam.performance,
      tyreDifference,
      Math.random() > 0.7, // DRS disponible aléatoirement
      circuit.corners > 15 ? 0.7 : 0.3 // Approximation difficulté dépassement
    );
    
    if (success) {
      // Échange des positions
      [updatedDrivers[i], updatedDrivers[i - 1]] = [updatedDrivers[i - 1], updatedDrivers[i]];
      updatedDrivers[i].position = i;
      updatedDrivers[i - 1].position = i + 1;
      
      console.log(`🎯 ${attacker.name} dépasse ${defender.name}!`);
    } else if (timeLost > 0) {
      // Temps perdu en tentative échouée
      updatedDrivers[i].totalTime += timeLost;
    }
  }
  
  return updatedDrivers;
};

const INITIAL_CIRCUIT = 'monaco';
const INITIAL_RACE_SETTINGS = getRaceSettings(INITIAL_CIRCUIT);
const INITIAL_DRIVERS = createInitialDrivers(INITIAL_CIRCUIT);

export const useSimulationStore = create<SimulationState & SimulationActions>((set, get) => ({
  // === ÉTAT INITIAL ===
  isRaceRunning: false,
  currentLap: 1,
  totalLaps: INITIAL_RACE_SETTINGS.totalLaps,
  safetyCar: 'NONE',
  weather: 'DRY',
  trackCondition: 'DRY',
  trackTemp: 42,
  airTemp: 28,
  drivers: INITIAL_DRIVERS,
  raceSettings: INITIAL_RACE_SETTINGS,
  sessionTime: 0,
  lastLapTimestamp: 0,
  incidents: 0,

  // === ACTIONS ===
  startRace: () => set({ 
    isRaceRunning: true,
    lastLapTimestamp: Date.now(),
    incidents: 0
  }),

  stopRace: () => set({ isRaceRunning: false }),

  advanceLap: () => {
    const { drivers, currentLap, isRaceRunning, weather, safetyCar, raceSettings, incidents, trackTemp, airTemp } = get();
    if (!isRaceRunning || currentLap >= raceSettings.totalLaps) return;

    const now = Date.now();
    const circuitData = CIRCUIT_DATA[raceSettings.circuitId as keyof typeof CIRCUIT_DATA] || CIRCUIT_DATA.monaco;

    let newIncidents = incidents;
    let newSafetyCar = safetyCar;

    // Effets température
    const tempEffects = calculateTemperatureEffects(airTemp, trackTemp, weather);

    // Évolution de la piste
    const trackEvolution = calculateTrackEvolution(currentLap, raceSettings.totalLaps, weather);

    const updatedDrivers = drivers.map(driver => {
      const driverData = DRIVER_DATA[driver.name as keyof typeof DRIVER_DATA];
      const teamData = TEAM_DATA[driver.team];
      
      if (!driverData || !teamData || driver.status === 'DNF') return driver;

      // Vérifier les incidents
      if (generateRandomIncident(currentLap, driverData.aggression)) {
        newIncidents++;
        console.log(`🚨 Incident pour ${driver.name}!`);
        return {
          ...driver,
          status: 'DNF',
          currentLap: driver.currentLap + 1
        };
      }

      // Facteurs pour calcul temps au tour
      const lapTimeFactors: LapTimeFactors = {
        tyreWear: driver.tyres.wear,
        fuelLoad: driver.fuel,
        trackEvolution,
        driverPerformance: (Math.random() - 0.5) * 2 * (1 - driverData.consistency),
        weatherImpact: getWeatherMultiplier(weather),
        traffic: Math.random() * 0.3, // Simulation traffic
        carPerformance: teamData.performance,
        tyreCompound: driver.tyres.compound,
        drsEffect: Math.random() > 0.6 ? 1 : 0 // DRS aléatoire
      };

      // Calcul du temps au tour réaliste
      const baseLapTime = 90; // Temps de base en secondes
      const lapTime = calculateLapTime(baseLapTime, lapTimeFactors, raceSettings.circuitId);

      // Calcul usure pneus réaliste
      const newWear = calculateTyreWear(
        driver.tyres.compound,
        driver.tyres.wear,
        trackTemp,
        driverData.aggression,
        raceSettings.circuitId
      );

      // Consommation carburant réaliste
      const fuelConsumption = calculateFuelConsumption(
        BASE_FUEL_CONSUMPTION,
        weather,
        safetyCar === 'SC',
        safetyCar === 'VSC',
        raceSettings.circuitId
      );

      return {
        ...driver,
        currentLap: driver.currentLap + 1,
        tyres: {
          ...driver.tyres,
          wear: newWear,
          age: driver.tyres.age + 1
        },
        fuel: Math.max(0, driver.fuel - fuelConsumption),
        lapTimes: [...driver.lapTimes, lapTime],
        totalTime: driver.totalTime + lapTime,
        status: driver.status === 'PIT' ? 'RUNNING' : driver.status
      };
    });

    // Simulation des dépassements
    let driversWithOvertakes = simulateOvertakes(updatedDrivers, raceSettings.circuitId);

    // Vérifier safety car
    if (newSafetyCar === 'NONE' && generateSafetyCarProbability(currentLap, newIncidents) > Math.random()) {
      newSafetyCar = 'SC';
      console.log('🚨 SAFETY CAR!');
    } else if (newSafetyCar !== 'NONE' && Math.random() > 0.6) {
      newSafetyCar = 'NONE';
      console.log('✅ Safety car terminée');
    }

    // Tri par temps total pour les positions (sauf DNF)
    const activeDrivers = driversWithOvertakes.filter(d => d.status !== 'DNF');
    const sortedDrivers = [...activeDrivers].sort((a, b) => a.totalTime - b.totalTime);
    
    // Calcul des écarts
    const leaderTime = sortedDrivers[0]?.totalTime || 0;
    const positionedDrivers = sortedDrivers.map((driver, index) => ({
      ...driver,
      position: index + 1,
      gapToLeader: index === 0 ? 0 : driver.totalTime - leaderTime,
      intervalToNext: index < sortedDrivers.length - 1 ? sortedDrivers[index + 1].totalTime - driver.totalTime : 0
    }));

    // Ajouter les DNF à la fin
    const dnfDrivers = driversWithOvertakes.filter(d => d.status === 'DNF')
      .map(driver => ({ 
        ...driver, 
        position: positionedDrivers.length + 1,
        gapToLeader: driver.totalTime - leaderTime
      }));

    const finalDrivers = [...positionedDrivers, ...dnfDrivers];

    set({ 
      drivers: finalDrivers,
      currentLap: currentLap + 1,
      sessionTime: get().sessionTime + (now - get().lastLapTimestamp),
      lastLapTimestamp: now,
      incidents: newIncidents,
      safetyCar: newSafetyCar,
      trackTemp: trackTemp + (Math.random() - 0.5) * 2, // Variation température piste
      airTemp: airTemp + (Math.random() - 0.5) * 1 // Variation température air
    });
  },

  changeTyre: (driverId, compound) => {
    const { drivers, raceSettings } = get();
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;

    const teamData = TEAM_DATA[driver.team];
    
    set({
      drivers: drivers.map(driver => 
        driver.id === driverId 
          ? { 
              ...driver, 
              tyres: { 
                compound, 
                wear: 0, 
                age: 0,
                degradationRate: getTyreDegradationRate(compound, teamData?.performance || 0.8, raceSettings.circuitId)
              },
              pitStops: driver.pitStops + 1
            }
          : driver
      )
    });
  },

  addFuel: (driverId, amount) => {
    const { drivers } = get();
    set({
      drivers: drivers.map(driver => 
        driver.id === driverId 
          ? { ...driver, fuel: Math.min(100, driver.fuel + amount) }
          : driver
      )
    });
  },

  toggleSafetyCar: () => {
    const { safetyCar } = get();
    const newSafetyCar = safetyCar === 'NONE' ? 'SC' : safetyCar === 'SC' ? 'VSC' : 'NONE';
    set({ 
      safetyCar: newSafetyCar 
    });
  },

  setWeather: (weather) => {
    const newTrackCondition = weather === 'WET' ? 'WET' : weather === 'DRIZZLE' ? 'DRYING' : 'DRY';
    const newTrackTemp = weather === 'WET' ? 25 : weather === 'DRIZZLE' ? 30 : 42;
    const newAirTemp = weather === 'WET' ? 20 : weather === 'DRIZZLE' ? 25 : 28;
    
    set({ 
      weather,
      trackCondition: newTrackCondition,
      trackTemp: newTrackTemp,
      airTemp: newAirTemp
    });
  },

  setCircuit: (circuitId: string) => {
    const newRaceSettings = getRaceSettings(circuitId);
    const newDrivers = createInitialDrivers(circuitId);
    const circuit = CIRCUIT_DATA[circuitId as keyof typeof CIRCUIT_DATA] || CIRCUIT_DATA.monaco;
    
    set({
      raceSettings: newRaceSettings,
      totalLaps: newRaceSettings.totalLaps,
      drivers: newDrivers,
      currentLap: 1,
      sessionTime: 0,
      lastLapTimestamp: 0,
      incidents: 0,
      safetyCar: 'NONE',
      weather: 'DRY',
      trackCondition: 'DRY',
      trackTemp: circuit.tyreWear > 1.2 ? 45 : 38, // Température adaptée au circuit
      airTemp: 28
    });
  },

  calculateDriverStrategy: (driverId: string) => {
    const { drivers, totalLaps, weather, raceSettings } = get();
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return null;

    const remainingTyres = { ...raceSettings.tyreAllocation };
    
    return calculateOptimalStrategy(
      driver,
      totalLaps,
      weather,
      remainingTyres,
      raceSettings.circuitId
    );
  },

  setPitStop: (driverId, compound, fuel) => {
    const { drivers, raceSettings } = get();
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;

    const teamData = TEAM_DATA[driver.team];
    const pitStopTime = predictPitStopTime(compound, fuel, teamData);
    
    set({
      drivers: drivers.map(driver => 
        driver.id === driverId 
          ? { 
              ...driver, 
              tyres: { 
                compound, 
                wear: 0, 
                age: 0,
                degradationRate: getTyreDegradationRate(compound, teamData?.performance || 0.8, raceSettings.circuitId)
              },
              fuel: Math.min(100, driver.fuel + fuel),
              pitStops: driver.pitStops + 1,
              status: 'PIT',
              totalTime: driver.totalTime + pitStopTime // Ajout du temps pit stop
            }
          : driver
      )
    });

    // Remet le statut à RUNNING après un pit stop
    setTimeout(() => {
      const { drivers } = get();
      set({
        drivers: drivers.map(driver => 
          driver.id === driverId ? { ...driver, status: 'RUNNING' } : driver
        )
      });
    }, 3000);
  },

  resetRace: () => {
    const { raceSettings } = get();
    set({
      isRaceRunning: false,
      currentLap: 1,
      sessionTime: 0,
      lastLapTimestamp: 0,
      safetyCar: 'NONE',
      weather: 'DRY',
      trackCondition: 'DRY',
      trackTemp: 42,
      airTemp: 28,
      incidents: 0,
      drivers: createInitialDrivers(raceSettings.circuitId).map(driver => ({
        ...driver,
        lapTimes: driver.lapTimes.slice(0, 1),
        currentLap: 1,
        pitStops: 0,
        fuel: 95 + Math.random() * 8,
        totalTime: driver.lapTimes[0] || 87.0,
        status: 'RUNNING',
        gapToLeader: 0,
        intervalToNext: 0,
        tyres: { 
          compound: 'MEDIUM', 
          wear: 8 + Math.random() * 15,
          age: 1,
          degradationRate: getTyreDegradationRate('MEDIUM', TEAM_DATA[driver.team]?.performance || 0.8, raceSettings.circuitId)
        }
      }))
    });
  }
}));