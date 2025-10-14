import { useState, useEffect, useRef } from 'react';
import { Driver, TelemetryData } from '../types/f1';
import { TEAM_DATA, DRIVER_DATA, CIRCUIT_DATA } from '../utils/f1Data';

export const useTelemetry = (driver: Driver, isRaceRunning: boolean, circuitId: string = 'monaco') => {
  const [telemetry, setTelemetry] = useState<TelemetryData[]>([]);
  const [currentData, setCurrentData] = useState<TelemetryData | null>(null);
  const telemetryIntervalRef = useRef<number>();
  const dataPointCountRef = useRef(0);

  // Données F1 réelles
  const driverData = DRIVER_DATA[driver.name as keyof typeof DRIVER_DATA];
  const teamData = TEAM_DATA[driver.team];
  const circuitData = CIRCUIT_DATA[circuitId as keyof typeof CIRCUIT_DATA];

  // Génération de données télémétriques réalistes
  useEffect(() => {
    if (!isRaceRunning || !driver) {
      if (telemetryIntervalRef.current) {
        clearInterval(telemetryIntervalRef.current);
      }
      return;
    }

    const generateTelemetryPoint = (): TelemetryData => {
      const sector = (dataPointCountRef.current % 3) + 1 as 1 | 2 | 3;
      
      // Facteurs de performance
      const teamPerformance = teamData?.performance || 0.8;
      const driverAggression = driverData?.aggression || 0.8;
      const driverConsistency = driverData?.consistency || 0.8;
      
      // Variation basée sur consistance
      const consistencyFactor = 1 - (driverConsistency * 0.2);
      const randomVariation = (Math.random() - 0.5) * 2 * consistencyFactor;

      // Vitesse basée sur performance équipe et secteur
      const sectorMultipliers = {
        1: { speed: 0.85, rpm: 0.9, throttle: 0.7, brake: 0.8 },  // Secteur lent
        2: { speed: 1.0, rpm: 1.0, throttle: 0.8, brake: 0.5 },   // Secteur moyen
        3: { speed: 1.15, rpm: 1.1, throttle: 0.9, brake: 0.3 }   // Secteur rapide
      };

      const multipliers = sectorMultipliers[sector];
      const baseSpeed = circuitData?.averageSpeed || 220;
      
      // Effet usure pneus sur performance
      const tyreEffect = 1 - (driver.tyres.wear / 200);
      const fuelEffect = 1 - ((100 - driver.fuel) / 300);

      return {
        timestamp: Date.now(),
        speed: (baseSpeed * multipliers.speed * teamPerformance * tyreEffect * fuelEffect * (0.9 + randomVariation * 0.2)),
        rpm: 10500 + (teamPerformance * 1500) + (multipliers.rpm * 1000) + (randomVariation * 800),
        throttle: (70 + (driverAggression * 20)) * multipliers.throttle + (randomVariation * 10),
        brake: (20 + ((1 - driverAggression) * 15)) * multipliers.brake + (randomVariation * 8),
        gear: Math.floor(6 + teamPerformance + randomVariation),
        drs: sector === 3 && Math.random() > 0.6 && driver.fuel < 80,
        engineTemp: 85 + (teamPerformance * 10) + (randomVariation * 8) + (driver.fuel < 30 ? 10 : 0),
        brakeTemp: 350 + (driverAggression * 100) + (multipliers.brake * 50) + (randomVariation * 40),
        lapTime: driver.lapTimes[driver.lapTimes.length - 1] || 0,
        sector,
        ersDeployment: 75 + (driverAggression * 20) + (randomVariation * 10),
        fuelRemaining: driver.fuel
      };
    };

    // Générer un point de télémétrie toutes les 500ms
    telemetryIntervalRef.current = window.setInterval(() => {
      const newData = generateTelemetryPoint();
      setCurrentData(newData);
      setTelemetry(prev => {
        const updated = [...prev, newData].slice(-120); // Garder les 120 derniers points
        return updated;
      });
      dataPointCountRef.current++;
    }, 500);

    return () => {
      if (telemetryIntervalRef.current) {
        clearInterval(telemetryIntervalRef.current);
      }
    };
  }, [isRaceRunning, driver, driverData, teamData, circuitData]);

  // Analyse des données télémétriques améliorée
  const analysis = useRef({
    averageSpeed: 0,
    maxSpeed: 0,
    throttleEfficiency: 0,
    brakeEfficiency: 0,
    consistency: 0,
    sectorTimes: { 1: 0, 2: 0, 3: 0 },
    performanceScore: 0
  });

  useEffect(() => {
    if (telemetry.length === 0) return;

    const speeds = telemetry.map(t => t.speed);
    const throttles = telemetry.map(t => t.throttle);
    const brakes = telemetry.map(t => t.brake);

    // Analyse par secteur
    const sectorData = {
      1: telemetry.filter(t => t.sector === 1),
      2: telemetry.filter(t => t.sector === 2),
      3: telemetry.filter(t => t.sector === 3)
    };

    const sectorSpeeds = {
      1: sectorData[1].map(t => t.speed),
      2: sectorData[2].map(t => t.speed),
      3: sectorData[3].map(t => t.speed)
    };

    analysis.current = {
      averageSpeed: speeds.reduce((a, b) => a + b, 0) / speeds.length,
      maxSpeed: Math.max(...speeds),
      throttleEfficiency: throttles.reduce((a, b) => a + b, 0) / throttles.length,
      brakeEfficiency: brakes.reduce((a, b) => a + b, 0) / brakes.length,
      consistency: calculateAdvancedConsistency(telemetry),
      sectorTimes: {
        1: sectorSpeeds[1].length > 0 ? sectorSpeeds[1].reduce((a, b) => a + b, 0) / sectorSpeeds[1].length : 0,
        2: sectorSpeeds[2].length > 0 ? sectorSpeeds[2].reduce((a, b) => a + b, 0) / sectorSpeeds[2].length : 0,
        3: sectorSpeeds[3].length > 0 ? sectorSpeeds[3].reduce((a, b) => a + b, 0) / sectorSpeeds[3].length : 0
      },
      performanceScore: calculatePerformanceScore(telemetry, driverData, teamData)
    };
  }, [telemetry, driverData, teamData]);

  const calculateAdvancedConsistency = (data: TelemetryData[]): number => {
    if (data.length < 6) return 100;
    
    const sectors = [1, 2, 3];
    const sectorConsistencies = sectors.map(sector => {
      const sectorData = data.filter(d => d.sector === sector);
      if (sectorData.length < 2) return 100;
      
      const speeds = sectorData.map(d => d.speed);
      const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
      const variance = speeds.reduce((sum, speed) => sum + Math.pow(speed - avgSpeed, 2), 0) / speeds.length;
      
      return Math.max(0, 100 - (variance / 8));
    });

    return sectorConsistencies.reduce((a, b) => a + b, 0) / sectorConsistencies.length;
  };

  const calculatePerformanceScore = (data: TelemetryData[], driverData: any, teamData: any): number => {
    if (data.length === 0) return 0;
    
    let score = 0;
    
    // Score de vitesse
    const avgSpeed = analysis.current.averageSpeed;
    const maxCircuitSpeed = circuitData?.topSpeed || 320;
    score += (avgSpeed / maxCircuitSpeed) * 40;
    
    // Score de consistance
    score += analysis.current.consistency * 0.3;
    
    // Score d'efficacité
    const throttleEff = analysis.current.throttleEfficiency;
    const brakeEff = 100 - analysis.current.brakeEfficiency;
    score += ((throttleEff + brakeEff) / 2) * 0.2;
    
    // Bonus performance équipe/pilote
    if (teamData) score += teamData.performance * 5;
    if (driverData) score += driverData.consistency * 5;
    
    return Math.min(100, Math.round(score));
  };

  // Alertes basées sur la télémétrie améliorées
  const getAlerts = () => {
    const alerts: { type: 'warning' | 'danger' | 'info'; message: string; priority: number }[] = [];

    if (currentData) {
      // Alertes température
      if (currentData.engineTemp > 115) {
        alerts.push({ type: 'danger', message: '🚨 Température moteur CRITIQUE', priority: 1 });
      } else if (currentData.engineTemp > 105) {
        alerts.push({ type: 'warning', message: '⚠️ Température moteur élevée', priority: 2 });
      }

      if (currentData.brakeTemp > 650) {
        alerts.push({ type: 'danger', message: '🚨 Freins SURCHAUFFÉS', priority: 1 });
      } else if (currentData.brakeTemp > 550) {
        alerts.push({ type: 'warning', message: '⚠️ Température freins élevée', priority: 2 });
      }

      // Alertes performance
      if (currentData.speed > (circuitData?.topSpeed || 320) * 0.95 && driver.tyres.wear > 80) {
        alerts.push({ type: 'warning', message: '⚡ Vitesse élevée avec pneus usés', priority: 3 });
      }

      if (currentData.fuelRemaining < 20) {
        alerts.push({ type: 'danger', message: '⛽ Carburant CRITIQUE', priority: 1 });
      } else if (currentData.fuelRemaining < 35) {
        alerts.push({ type: 'warning', message: '⛽ Carburant faible', priority: 2 });
      }

      // Alertes système
      if (currentData.ersDeployment < 30) {
        alerts.push({ type: 'info', message: '🔋 ERS faible', priority: 4 });
      }

      if (analysis.current.consistency < 70) {
        alerts.push({ type: 'warning', message: '📊 Consistance faible', priority: 3 });
      }
    }

    return alerts.sort((a, b) => a.priority - b.priority);
  };

  // Réinitialiser la télémétrie
  const resetTelemetry = () => {
    setTelemetry([]);
    setCurrentData(null);
    dataPointCountRef.current = 0;
  };

  // Statistiques de performance
  const getPerformanceStats = () => {
    return {
      ...analysis.current,
      dataPoints: dataPointCountRef.current,
      telemetryAge: telemetry.length > 0 ? Date.now() - telemetry[0].timestamp : 0
    };
  };

  return {
    // Données en temps réel
    currentData,
    telemetryHistory: telemetry,
    
    // Analyse
    analysis: analysis.current,
    performanceStats: getPerformanceStats(),
    
    // Alertes
    alerts: getAlerts(),
    
    // Actions
    resetTelemetry,
    
    // Métadonnées
    dataPointCount: dataPointCountRef.current,
    isActive: isRaceRunning && !!driver,
    
    // Données F1
    driverData,
    teamData,
    circuitData
  };
};