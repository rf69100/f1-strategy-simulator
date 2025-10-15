import { Driver } from '../../types/f1';
import { Card } from '../ui/Card';
import { Zap, TrendingDown, Award, Clock, Calculator } from 'lucide-react';
import React from 'react';
import { getDriverPerformance, getTeamPerformance } from '../../utils/f1Data';

interface DriverCardProps {
  driver: Driver;
  onStrategyClick?: () => void;
  leaderTime?: number;
}

export const DriverCard: React.FC<DriverCardProps> = ({ 
  driver, 
  onStrategyClick, 
  leaderTime 
}) => {
  const lastLap = driver.lapTimes[driver.lapTimes.length - 1];
  const bestLap = driver.lapTimes.length > 0 ? Math.min(...driver.lapTimes) : 0;

  // Récupérer les données du pilote et de l'équipe
  const driverData = getDriverPerformance(driver.name);
  const teamData = getTeamPerformance(driver.team);
  
  // Calculer l'écart avec le leader
  const gapToLeader = driver.position === 1 ? 0 : (leaderTime ? driver.totalTime - leaderTime : driver.gapToLeader || 0);

  const getTyreColor = (compound: string) => {
    const colors: Record<string, string> = {
      'SOFT': 'bg-red-500',
      'MEDIUM': 'bg-yellow-500', 
      'HARD': 'bg-white',
      'INTERMEDIATE': 'bg-green-500',
      'WET': 'bg-blue-500'
    };
    return colors[compound] || 'bg-gray-500';
  };

  const getPerformanceTrend = () => {
    if (driver.lapTimes.length < 3) return 'stable';
    const recent = driver.lapTimes.slice(-3);
    const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
    
    if (driver.lapTimes.length < 6) return 'stable';
    
    const previous = driver.lapTimes.slice(-6, -3);
    const avgPrevious = previous.reduce((a, b) => a + b, 0) / 3;
    
    return avgRecent < avgPrevious ? 'improving' : avgRecent > avgPrevious ? 'degrading' : 'stable';
  };

  const performanceTrend = getPerformanceTrend();
  const teamColor = teamData?.color || '#666666';

  // Calculer si un pit stop est recommandé
  const needsPitStop = driver.tyres.wear > 80 || driver.fuel < 20;

  return (
    <Card 
      className="h-full smooth-transition relative border-l-3"
      style={{
        borderLeftColor: teamColor,
        background: `linear-gradient(145deg, rgba(30, 30, 45, 0.95) 0%, ${teamColor}15 100%)`
      }}
    >
      {/* Badge Pit Stop Urgent */}
      {needsPitStop && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse z-10">
          ⚠️ PIT
        </div>
      )}

      {/* Badge Leader permanent */}
      {driver.position === 1 && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs px-3 py-1 rounded-full font-bold shadow z-10" style={{letterSpacing:2}}>
          LEADER
        </div>
      )}

      {/* Header avec statut et données équipe */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg xs:text-xl font-bold text-white truncate">
              {driver.name}
            </h3>
            {driver.status === 'PIT' && (
              <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full animate-pulse">
                PIT
              </span>
            )}
            {driver.status === 'DNF' && (
              <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                DNF
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <p 
              className="text-gray-300 text-sm truncate"
              style={{ color: teamColor }}
            >
              {driver.team}
            </p>
            <div className="flex items-center gap-1">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: teamColor }}
              />
              <span className="text-xs text-gray-400">
                Perf: {Math.round((teamData?.performance || 0.8) * 100)}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-1 rounded text-xs font-bold ${
              driver.position === 1 ? 'bg-yellow-500 text-black' :
              driver.position === 2 ? 'bg-gray-400 text-black' :
              driver.position === 3 ? 'bg-orange-500 text-black' :
              'bg-gray-700 text-white'
            }`}>
              P{driver.position}
            </span>
            <span className="text-xs text-gray-400 bg-black/30 px-2 py-1 rounded">
              Lap {driver.currentLap}
            </span>
            <span className="text-xs text-gray-400 bg-black/30 px-2 py-1 rounded">
              Pit: {driver.pitStops}
            </span>
            
            {/* Indicateur de performance */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
              performanceTrend === 'improving' ? 'bg-green-500/20 text-green-400' :
              performanceTrend === 'degrading' ? 'bg-red-500/20 text-red-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              <TrendingDown 
                size={12} 
                className={
                  performanceTrend === 'improving' ? 'text-green-400' : 
                  performanceTrend === 'degrading' ? 'text-red-400' : 
                  'text-gray-400'
                } 
              />
              <span className="text-xs">
                {performanceTrend === 'improving' ? '↑' : 
                 performanceTrend === 'degrading' ? '↓' : '→'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Pneus avec style F1 */}
        <div className="text-right ml-2 flex-shrink-0">
          <div 
            className={`px-3 py-2 rounded-full text-xs font-bold text-black ${getTyreColor(driver.tyres.compound)} shadow-lg`}
          >
            {driver.tyres.compound.slice(0,1)}
          </div>
          <div className="flex items-center justify-end gap-1 mt-1">
            <div className="text-xs text-gray-300">
              {Math.round(driver.tyres.wear)}%
            </div>
            <div className={`w-2 h-2 rounded-full ${
              driver.tyres.wear < 30 ? 'bg-green-500' :
              driver.tyres.wear < 70 ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
          </div>
          <p className="text-xs text-gray-400">
            {driver.tyres.age} laps
          </p>
        </div>
      </div>
      
      {/* Données de performance avec style F1 */}
      <div className="grid grid-cols-2 gap-2 text-xs xs:text-sm mb-3">
        <div className="bg-black/20 rounded-lg p-2">
          <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
            <Zap size={12} />
            Carburant
          </div>
          <p className="text-white font-bold">{driver.fuel.toFixed(1)} kg</p>
          {driver.fuel < 30 && (
            <div className="text-red-400 text-[10px] animate-pulse">FAIBLE</div>
          )}
        </div>
        
        <div className="bg-black/20 rounded-lg p-2">
          <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
            <Clock size={12} />
            Dernier
          </div>
          <p className="text-white font-bold">
            {lastLap ? lastLap.toFixed(3) : 'N/A'}
          </p>
        </div>
        
        <div className="bg-black/20 rounded-lg p-2">
          <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
            <Award size={12} />
            Meilleur
          </div>
          <p className="text-white font-bold">{bestLap > 0 ? bestLap.toFixed(3) : 'N/A'}</p>
        </div>
        
        <div className="bg-black/20 rounded-lg p-2">
          <p className="text-gray-400 text-xs mb-1">Écart leader</p>
          <p className="text-white font-bold">
            {gapToLeader > 0 ? `+${gapToLeader.toFixed(1)}s` : 'Leader'}
          </p>
        </div>
      </div>

      {/* Barres de progression F1 */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
            <span>Carburant</span>
            <span className="flex items-center gap-1">
              {driver.fuel.toFixed(0)}%
              {driver.fuel < 20 && <Zap size={12} className="text-yellow-400 animate-pulse" />}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                driver.fuel > 50 ? 'bg-green-500' :
                driver.fuel > 20 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(driver.fuel, 100)}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
            <span>Usure pneus</span>
            <span className="flex items-center gap-1">
              {Math.round(driver.tyres.wear)}%
              {driver.tyres.wear > 80 && <TrendingDown size={12} className="text-red-400 animate-pulse" />}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                driver.tyres.wear < 30 ? 'bg-green-500' :
                driver.tyres.wear < 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(driver.tyres.wear, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Statistiques pilote */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Consistance: {Math.round((driverData?.consistency || 0.8) * 100)}%</span>
          <span>Agression: {Math.round((driverData?.aggression || 0.8) * 100)}%</span>
          <span>Fiabilité: {Math.round((teamData?.reliability || 0.8) * 100)}%</span>
        </div>
      </div>

      {/* Bouton stratégie F1 amélioré */}
      {onStrategyClick && (
        <button
          onClick={onStrategyClick}
          className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors"
        >
          <Calculator size={14} />
          Stratégie
          {needsPitStop && <span className="animate-pulse">⚠️</span>}
        </button>
      )}
    </Card>
  );
};