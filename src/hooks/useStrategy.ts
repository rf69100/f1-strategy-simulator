import { useState, useMemo } from 'react';
import { Driver, TyreCompound, RaceStrategy, PitStop } from '../types/f1';
import { calculateOptimalStrategy, TYRE_STRATEGIES, predictPitStopTime } from '../utils/strategy';
import { useSimulationStore } from '../stores/simulationStore';
import { TYRE_PERFORMANCE, TEAM_DATA, DRIVER_DATA, CIRCUIT_DATA } from '../utils/f1Data';

export const useStrategy = (driverId: string) => {
  const { drivers, currentLap, totalLaps, weather, raceSettings, calculateDriverStrategy } = useSimulationStore();
  const [customStrategy, setCustomStrategy] = useState<RaceStrategy | null>(null);

  const driver = drivers.find(d => d.id === driverId);
  
  if (!driver) {
    throw new Error(`Driver with id ${driverId} not found`);
  }

  // Données F1 réelles
  const driverData = DRIVER_DATA[driver.name as keyof typeof DRIVER_DATA];
  const teamData = TEAM_DATA[driver.team];
  const circuitData = CIRCUIT_DATA[raceSettings.circuitId as keyof typeof CIRCUIT_DATA];

  // Stratégie optimale calculée avec données F1
  const optimalStrategy = useMemo(() => {
    return calculateDriverStrategy(driverId) || calculateOptimalStrategy(
      driver, 
      totalLaps, 
      weather, 
      raceSettings.tyreAllocation,
      raceSettings.circuitId
    );
  }, [driver, totalLaps, weather, raceSettings, calculateDriverStrategy, driverId]);

  // Stratégie active (optimale ou personnalisée)
  const activeStrategy = customStrategy || optimalStrategy;

  // Prochain arrêt prévu
  const nextPitStop = useMemo(() => {
    return activeStrategy.pitStops?.find(stop => stop.lap > currentLap);
  }, [activeStrategy.pitStops, currentLap]);

  // Tours restants sur pneus actuels
  const lapsOnCurrentTyres = useMemo(() => {
    return driver.tyres.age;
  }, [driver.tyres.age]);

  // Tours estimés avant changement (basé sur données F1)
  const estimatedLapsUntilPit = useMemo(() => {
    const tyrePerf = TYRE_PERFORMANCE[driver.tyres.compound];
    const circuitEffect = circuitData?.tyreWear || 1.0;
    const driverEffect = driverData?.aggression ? 0.8 + (driverData.aggression * 0.4) : 1.0;
    
    const maxLapsForCompound = Math.floor(tyrePerf.durability * 40 * circuitEffect * driverEffect);
    return Math.max(0, maxLapsForCompound - lapsOnCurrentTyres);
  }, [driver.tyres.compound, lapsOnCurrentTyres, circuitData, driverData]);

  // Recommandation d'arrêt améliorée
  const pitStopRecommendation = useMemo(() => {
    if (driver.tyres.wear > 90) {
      return { type: 'CRITICAL' as const, reason: 'Pneus très usés - Arrêt immédiat requis' };
    }
    if (driver.fuel < 15) {
      return { type: 'CRITICAL' as const, reason: 'Carburant critique - Ravitaillement urgent' };
    }
    if (driver.tyres.wear > 80) {
      return { type: 'IMMEDIATE' as const, reason: 'Pneus très usés' };
    }
    if (driver.fuel < 25) {
      return { type: 'IMMEDIATE' as const, reason: 'Carburant faible' };
    }
    if (driver.tyres.wear > 70 && estimatedLapsUntilPit < 3) {
      return { type: 'SOON' as const, reason: 'Pneus usés - arrêt recommandé' };
    }
    if (nextPitStop && nextPitStop.lap - currentLap <= 2) {
      return { type: 'PLANNED' as const, reason: 'Arrêt planifié prochainement' };
    }
    if (weather !== 'DRY' && driver.tyres.compound !== 'INTERMEDIATE' && driver.tyres.compound !== 'WET') {
      return { type: 'WEATHER' as const, reason: 'Changement pneus recommandé pour conditions' };
    }
    return { type: 'NO_NEED' as const, reason: 'Aucun arrêt nécessaire' };
  }, [driver.tyres.wear, driver.fuel, estimatedLapsUntilPit, nextPitStop, currentLap, weather, driver.tyres.compound]);

  // Temps estimé du prochain arrêt avec données équipe
  const estimatedPitStopTime = useMemo(() => {
    if (!nextPitStop) return 0;
    return predictPitStopTime(nextPitStop.tyreCompound, nextPitStop.fuelAdded, teamData);
  }, [nextPitStop, teamData]);

  // Analyse de stratégie
  const strategyAnalysis = useMemo(() => {
    const analysis = {
      riskLevel: activeStrategy.riskLevel || 'MEDIUM',
      expectedGain: 0,
      tyreAdvantage: 0,
      fuelEfficiency: 0
    };

    // Calcul avantage pneus
    const currentTyrePerf = TYRE_PERFORMANCE[driver.tyres.compound];
    const targetTyrePerf = TYRE_PERFORMANCE[activeStrategy.targetCompound];
    analysis.tyreAdvantage = targetTyrePerf.grip - currentTyrePerf.grip;

    // Calcul efficacité carburant
    analysis.fuelEfficiency = teamData?.performance || 0.8;

    return analysis;
  }, [activeStrategy, driver.tyres.compound, teamData]);

  // Fonctions helper
  const calculatePredictedLapTime = (compound: TyreCompound, stintLength: number, circuit: any): number => {
    const baseTime = 90; // Temps de base en secondes
    const tyrePerf = TYRE_PERFORMANCE[compound];
    return baseTime * (1.05 - (tyrePerf.grip * 0.1));
  };

  const calculateExpectedRaceTime = (driver: Driver, pitStops: PitStop[], lapsRemaining: number): number => {
    let totalTime = driver.totalTime;
    const baseLapTime = 90; // Temps de base en secondes
    
    totalTime += lapsRemaining * baseLapTime;
    totalTime += pitStops.reduce((sum, stop) => sum + stop.duration, 0);
    
    return totalTime;
  };

  // Actions améliorées
  const setCustomTyreStrategy = (compound: TyreCompound, plannedStops: number) => {
    const pitStops: PitStop[] = [];
    const stintLength = Math.floor((totalLaps - currentLap) / (plannedStops + 1));
    
    for (let i = 0; i < plannedStops; i++) {
      const pitLap = currentLap + (i + 1) * stintLength;
      const fuelToAdd = Math.min(100, stintLength * 1.8);
      const pitTime = predictPitStopTime(compound, fuelToAdd, teamData);
      
      pitStops.push({
        lap: pitLap,
        tyreCompound: compound,
        fuelAdded: fuelToAdd,
        duration: pitTime,
        predictedLapTime: calculatePredictedLapTime(compound, stintLength, circuitData)
      });
    }

    setCustomStrategy({
      driverId,
      plannedStops,
      pitStops,
      targetCompound: compound,
      riskLevel: plannedStops >= 3 ? 'HIGH' : plannedStops === 2 ? 'MEDIUM' : 'LOW',
      expectedRaceTime: calculateExpectedRaceTime(driver, pitStops, totalLaps - currentLap)
    });
  };

  const resetToOptimal = () => {
    setCustomStrategy(null);
  };

  return {
    // Données
    driver,
    optimalStrategy,
    activeStrategy,
    customStrategy,
    
    // État actuel
    nextPitStop,
    lapsOnCurrentTyres,
    estimatedLapsUntilPit,
    pitStopRecommendation,
    estimatedPitStopTime,
    strategyAnalysis,
    
    // Données F1
    driverData,
    teamData,
    circuitData,
    
    // Actions
    setCustomTyreStrategy,
    resetToOptimal,
    
    // Stratégies prédéfinies
    predefinedStrategies: TYRE_STRATEGIES
  };
};