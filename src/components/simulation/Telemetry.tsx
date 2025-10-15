import { Driver } from '../../types/f1';
import { Card } from '../ui/Card';
import { Activity, Gauge, Thermometer, TrendingUp, Zap, AlertTriangle, Target } from 'lucide-react';
import { getDriverPerformance, getTeamPerformance } from '../../utils/f1Data';

interface TelemetryProps {
  driver: Driver;
  currentLap: number;
}

export const Telemetry = ({ driver, currentLap }: TelemetryProps) => {
  const lapTimes = driver.lapTimes.slice(-15); // 15 derniers tours
  const avgLapTime = lapTimes.length > 0 ? lapTimes.reduce((a, b) => a + b, 0) / lapTimes.length : 0;
  const bestLap = lapTimes.length > 0 ? Math.min(...lapTimes) : 0;
  
  // Données F1 réelles
  const driverData = getDriverPerformance(driver.name);
  const teamData = getTeamPerformance(driver.team);

  // Données de télémétrie réalistes basées sur les performances F1
  const getTelemetryData = () => {
    const basePerformance = teamData?.performance || 0.8;
    const driverConsistency = driverData?.consistency || 0.8;
    
    // Variation basée sur la consistance du pilote
    const consistencyFactor = 1 - (driverConsistency * 0.3);
    const randomVariation = (Math.random() - 0.5) * 2 * consistencyFactor;
    
    return {
      speed: 280 + (basePerformance * 40) + (randomVariation * 20), // km/h
      rpm: 11500 + (basePerformance * 2000) + (randomVariation * 1000),
      throttle: 75 + ((driverData?.aggression || 0.8) * 20) + (randomVariation * 10), // %
      brake: 15 + ((1 - (driverData?.aggression || 0.8)) * 20) + (randomVariation * 8), // %
      gear: Math.floor(6 + basePerformance * 2 + randomVariation),
      engineTemp: 90 + (basePerformance * 10) + (randomVariation * 5), // °C
      brakeTemp: 350 + ((driverData?.aggression || 0.8) * 150) + (randomVariation * 50), // °C
      drs: Math.random() > 0.7 && currentLap > 2,
      ers: 80 + (randomVariation * 20), // %
      fuelFlow: 2.5 + (randomVariation * 0.5), // kg/s
    };
  };

  const telemetryData = getTelemetryData();

  // Analyse de performance
  const getPerformanceAnalysis = () => {
    if (lapTimes.length < 3) return { trend: 'stable', consistency: 0 };
    
    const recentAvg = lapTimes.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const previousAvg = lapTimes.length >= 6 ? 
      lapTimes.slice(-6, -3).reduce((a, b) => a + b, 0) / 3 : recentAvg;
    
    const trend = recentAvg < previousAvg ? 'improving' : recentAvg > previousAvg ? 'degrading' : 'stable';
    
    // Calcul de la consistance basé sur l'écart-type
    const variance = lapTimes.reduce((sum, time) => sum + Math.pow(time - avgLapTime, 2), 0) / lapTimes.length;
    const consistency = Math.max(0, 100 - (Math.sqrt(variance) * 10));
    
    return { trend, consistency: Math.round(consistency) };
  };

  const performance = getPerformanceAnalysis();

  // Alertes télémétriques
  const getAlerts = () => {
    const alerts: { type: 'warning' | 'danger'; message: string }[] = [];
    
    if (telemetryData.engineTemp > 110) {
      alerts.push({ type: 'danger', message: 'Température moteur critique' });
    }
    if (telemetryData.brakeTemp > 600) {
      alerts.push({ type: 'warning', message: 'Freins surchauffés' });
    }
    if (telemetryData.fuelFlow > 3.0) {
      alerts.push({ type: 'warning', message: 'Consommation carburant élevée' });
    }
    if (driver.tyres.wear > 80 && telemetryData.speed > 300) {
      alerts.push({ type: 'warning', message: 'Vitesse élevée avec pneus usés' });
    }
    
    return alerts;
  };

  const alerts = getAlerts();

  return (
    <Card className="p-4 race-overlay">
      {/* En-tête avec données pilote */}
      <div className="flex items-center gap-3 mb-4">
        <Activity size={20} className="text-green-400 animate-pulse" />
        <div>
          <h3 className="text-lg font-bold text-white">TÉLÉMÉTRIE {driver.name.split(' ')[1]}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: teamData?.color || '#666666' }}
            ></div>
            <span>{driver.team}</span>
            <span>•</span>
            <span>Tour {currentLap}</span>
            <span>•</span>
            <span>P{driver.position}</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-400">Consistance</div>
            <div className="text-white font-bold text-sm">
              {performance.consistency}%
            </div>
          </div>
        </div>
      </div>

      {/* Alertes */}
      {alerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                alert.type === 'danger' 
                  ? 'bg-red-900/30 border border-red-500 text-red-200 animate-pulse' 
                  : 'bg-orange-900/30 border border-orange-500 text-orange-200'
              }`}
            >
              <AlertTriangle size={14} />
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Graphique temps au tour amélioré */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Target size={16} />
            ANALYSE TOURS
          </h4>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Moyenne: {avgLapTime.toFixed(3)}s</span>
            <span>Meilleur: {bestLap.toFixed(3)}s</span>
          </div>
        </div>
        <div className="h-24 bg-black/30 rounded-xl p-3 flex items-end gap-1 border border-gray-600">
          {lapTimes.map((time, index) => {
            const minTime = Math.min(...lapTimes);
            const maxTime = Math.max(...lapTimes);
            const range = maxTime - minTime || 1;
            const height = ((time - minTime) / range) * 80 || 40;
            const isBestLap = time === bestLap;
            const lapNumber = driver.currentLap - lapTimes.length + index + 1;
            
            return (
              <div
                key={index}
                className="flex-1 group relative"
              >
                <div
                  className={`w-full rounded-t transition-all duration-500 ${
                    isBestLap 
                      ? 'bg-gradient-to-t from-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/30' 
                      : performance.trend === 'improving' && index === lapTimes.length - 1
                      ? 'bg-gradient-to-t from-green-500 to-green-600'
                      : 'bg-gradient-to-t from-blue-500 to-blue-600'
                  }`}
                  style={{ height: `${100 - height}%` }}
                />
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 hidden group-hover:block z-10">
                  <div className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-xs whitespace-nowrap">
                    Lap {lapNumber}: {time.toFixed(3)}s
                    {isBestLap && ' 🏆'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Légende graphique */}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-1 bg-blue-500 rounded"></div>
              <span>Normal</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1 bg-green-500 rounded"></div>
              <span>Amélioration</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1 bg-yellow-500 rounded"></div>
              <span>Meilleur tour</span>
            </div>
          </div>
          <div className={`flex items-center gap-1 ${
            performance.trend === 'improving' ? 'text-green-400' :
            performance.trend === 'degrading' ? 'text-red-400' : 'text-gray-400'
          }`}>
            <TrendingUp size={12} className={
              performance.trend === 'improving' ? 'rotate-0' :
              performance.trend === 'degrading' ? 'rotate-180' : ''
            } />
            <span className="capitalize">{performance.trend}</span>
          </div>
        </div>
      </div>

      {/* Données télémétriques complètes */}
      <div className="grid grid-cols-2 gap-3">
        {/* Vitesse */}
        <div className="bg-black/30 rounded-xl p-3 border border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <Gauge size={16} className="text-red-400" />
            <p className="text-gray-400 text-xs">VITESSE</p>
            {telemetryData.drs && (
              <span className="ml-auto bg-purple-500 text-white text-[10px] px-1 rounded">DRS</span>
            )}
          </div>
          <p className="text-white font-bold text-xl font-mono">{Math.round(telemetryData.speed)}</p>
          <p className="text-gray-400 text-xs mt-1">km/h</p>
        </div>

        {/* RPM */}
        <div className="bg-black/30 rounded-xl p-3 border border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-yellow-400" />
            <p className="text-gray-400 text-xs">RPM</p>
          </div>
          <p className="text-white font-bold text-xl font-mono">{Math.round(telemetryData.rpm).toLocaleString()}</p>
          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
            <div 
              className="bg-yellow-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(telemetryData.rpm / 13000) * 100}%` }}
            />
          </div>
        </div>

        {/* Accélérateur */}
        <div className="bg-black/30 rounded-xl p-3 border border-gray-600">
          <p className="text-gray-400 text-xs mb-2">ACCÉLÉRATEUR</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-700 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-200"
                style={{ width: `${telemetryData.throttle}%` }}
              />
            </div>
            <p className="text-white font-bold text-lg font-mono w-10 text-right">{Math.round(telemetryData.throttle)}%</p>
          </div>
          <div className="text-gray-400 text-xs mt-1 flex justify-between">
            <span>Agression: {Math.round((driverData?.aggression || 0.8) * 100)}%</span>
          </div>
        </div>

        {/* Freinage */}
        <div className="bg-black/30 rounded-xl p-3 border border-gray-600">
          <p className="text-gray-400 text-xs mb-2">FREINAGE</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-700 rounded-full h-3">
              <div 
                className="bg-red-500 h-3 rounded-full transition-all duration-200"
                style={{ width: `${telemetryData.brake}%` }}
              />
            </div>
            <p className="text-white font-bold text-lg font-mono w-10 text-right">{Math.round(telemetryData.brake)}%</p>
          </div>
        </div>

        {/* Température moteur */}
        <div className="bg-black/30 rounded-xl p-3 border border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer size={16} className="text-orange-400" />
            <p className="text-gray-400 text-xs">MOTEUR</p>
          </div>
          <p className="text-white font-bold text-xl font-mono">{Math.round(telemetryData.engineTemp)}°C</p>
          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                telemetryData.engineTemp > 105 ? 'bg-red-500' :
                telemetryData.engineTemp > 95 ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${(telemetryData.engineTemp / 120) * 100}%` }}
            />
          </div>
        </div>

        {/* Température freins */}
        <div className="bg-black/30 rounded-xl p-3 border border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer size={16} className="text-red-400" />
            <p className="text-gray-400 text-xs">FREINS</p>
          </div>
          <p className="text-white font-bold text-xl font-mono">{Math.round(telemetryData.brakeTemp)}°C</p>
          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                telemetryData.brakeTemp > 550 ? 'bg-red-500' :
                telemetryData.brakeTemp > 450 ? 'bg-orange-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${(telemetryData.brakeTemp / 700) * 100}%` }}
            />
          </div>
        </div>

        {/* ERS et Carburant */}
        <div className="bg-black/30 rounded-xl p-3 border border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} className="text-blue-400" />
            <p className="text-gray-400 text-xs">SYSTÈME ERS</p>
          </div>
          <p className="text-white font-bold text-lg font-mono">{Math.round(telemetryData.ers)}%</p>
          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${telemetryData.ers}%` }}
            />
          </div>
        </div>

        {/* Vitesse engagée */}
        <div className="bg-black/30 rounded-xl p-3 border border-gray-600">
          <p className="text-gray-400 text-xs mb-2">ENGAGEMENT</p>
          <div className="flex items-center justify-between">
            <div className="text-white font-bold text-lg font-mono">
              Vitesse {Math.round(telemetryData.speed * 0.8)}%
            </div>
            <div className="text-gray-400 text-xs text-right">
              G{telemetryData.gear}<br/>
              {Math.round(telemetryData.fuelFlow * 100)/100}kg/s
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques de performance */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center text-xs">
          <div>
            <div className="text-gray-400">Consistance</div>
            <div className="text-white font-bold">{performance.consistency}%</div>
          </div>
          <div>
            <div className="text-gray-400">Agression</div>
            <div className="text-white font-bold">{Math.round((driverData?.aggression || 0.8) * 100)}%</div>
          </div>
          <div>
            <div className="text-gray-400">Performance</div>
            <div className="text-white font-bold">{Math.round((teamData?.performance || 0.8) * 100)}%</div>
          </div>
        </div>
      </div>
    </Card>
  );
};