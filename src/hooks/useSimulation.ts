import { useSimulationStore } from '../stores/simulationStore';
import { useEffect, useRef, useState } from 'react';
import { DRIVER_DATA, TEAM_DATA } from '../utils/f1Data';

export const useSimulation = () => {
  const { 
    isRaceRunning, 
    advanceLap, 
    drivers,
    currentLap,
    totalLaps,
    safetyCar,
    weather,
    setWeather,
    incidents,
    raceSettings
  } = useSimulationStore();

  const [simulationSpeed, setSimulationSpeed] = useState(1500); // 1.5 secondes par défaut
  const intervalRef = useRef<number | undefined>();
  const incidentCountRef = useRef(0);
  const weatherChangeRef = useRef(0);

  // Simulation automatique améliorée
  useEffect(() => {
    if (!isRaceRunning) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      // Vérifier les incidents avec données F1
      drivers.forEach(driver => {
        if (driver.status !== 'RUNNING') return;
        
        const driverData = DRIVER_DATA[driver.name as keyof typeof DRIVER_DATA];
        const teamData = TEAM_DATA[driver.team];
        
        if (!driverData || !teamData) return;

        // Probabilité d'incident basée sur agression et fiabilité
        const incidentProbability = 0.003 + (driverData.aggression * 0.004) + ((1 - teamData.reliability) * 0.003);
        
        if (Math.random() < incidentProbability) {
          incidentCountRef.current++;
          console.log(`🚨 Incident pour ${driver.name}! (Agression: ${Math.round(driverData.aggression * 100)}%, Fiabilité: ${Math.round(teamData.reliability * 100)}%)`);
        }
      });

      advanceLap();
    }, simulationSpeed);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isRaceRunning, simulationSpeed, advanceLap, drivers]);

  // Simulation météo dynamique améliorée
  useEffect(() => {
    if (!isRaceRunning || currentLap < 5) return;

    weatherChangeRef.current++;
    
    // Changement météo tous les 10-20 tours
    if (weatherChangeRef.current >= 10 + Math.random() * 10) {
      weatherChangeRef.current = 0;
      
      const weatherOptions = ['DRY', 'DRIZZLE', 'WET'] as const;
      const currentWeatherIndex = weatherOptions.indexOf(weather);
      
      // Transition progressive (sec → pluie légère → forte pluie)
      let newWeather: typeof weatherOptions[number];
      if (currentWeatherIndex === 0 && Math.random() > 0.7) {
        newWeather = 'DRIZZLE';
      } else if (currentWeatherIndex === 1) {
        newWeather = Math.random() > 0.5 ? 'WET' : 'DRY';
      } else if (currentWeatherIndex === 2 && Math.random() > 0.6) {
        newWeather = 'DRIZZLE';
      } else {
        newWeather = weather;
      }
      
      if (newWeather !== weather) {
        setWeather(newWeather);
        console.log(`🌦️ Changement météo: ${weather} → ${newWeather}`);
      }
    }
  }, [currentLap, isRaceRunning, weather, setWeather]);

  // Contrôle de vitesse de simulation
  const speedUp = () => {
    setSimulationSpeed(prev => Math.max(300, prev / 1.5));
  };

  const slowDown = () => {
    setSimulationSpeed(prev => Math.min(5000, prev * 1.5));
  };

  // Calculs en temps réel améliorés
  const getRaceProgress = () => {
    return (currentLap / totalLaps) * 100;
  };

  const getLeader = () => {
    return drivers.find(driver => driver.position === 1 && driver.status === 'RUNNING');
  };

  const getDriverGap = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    const leader = getLeader();
    if (!driver || !leader || driver.position === 1) return 0;
    
    return driver.gapToLeader || driver.totalTime - leader.totalTime;
  };

  // Analyse de performance des pilotes
  const getDriverPerformance = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver || driver.lapTimes.length < 3) return { trend: 'stable', consistency: 0 };
    
    const recentLaps = driver.lapTimes.slice(-5);
    const avgRecent = recentLaps.reduce((a, b) => a + b, 0) / recentLaps.length;
    const previousLaps = driver.lapTimes.slice(-10, -5);
    const avgPrevious = previousLaps.length > 0 ? previousLaps.reduce((a, b) => a + b, 0) / previousLaps.length : avgRecent;
    
    // Calcul de la consistance (écart-type)
    const variance = recentLaps.reduce((sum, time) => sum + Math.pow(time - avgRecent, 2), 0) / recentLaps.length;
    const consistency = Math.max(0, 100 - (Math.sqrt(variance) * 20));
    
    return {
      trend: avgRecent < avgPrevious ? 'improving' : avgRecent > avgPrevious ? 'degrading' : 'stable',
      consistency: Math.round(consistency)
    };
  };

  // Statistiques de course
  const getRaceStats = () => {
    const runningDrivers = drivers.filter(d => d.status === 'RUNNING');
    const avgLapTime = runningDrivers.reduce((sum, driver) => {
      const lastLap = driver.lapTimes[driver.lapTimes.length - 1];
      return sum + (lastLap || 0);
    }, 0) / runningDrivers.length;

    const fastestLap = Math.min(...runningDrivers.map(d => 
      Math.min(...d.lapTimes.slice(-10))
    ));

    return {
      avgLapTime: avgLapTime || 0,
      fastestLap: isFinite(fastestLap) ? fastestLap : 0,
      runningDrivers: runningDrivers.length,
      dnfDrivers: drivers.filter(d => d.status === 'DNF').length,
      totalPitStops: drivers.reduce((sum, d) => sum + d.pitStops, 0)
    };
  };

  return {
    ...useSimulationStore(),
    simulationSpeed,
    setSimulationSpeed,
    speedUp,
    slowDown,
    getRaceProgress,
    getLeader,
    getDriverGap,
    getDriverPerformance,
    getRaceStats,
    incidentCount: incidentCountRef.current + incidents
  };
};