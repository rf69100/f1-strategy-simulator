import { Driver } from '../../types/f1';
import { Card } from '../ui/Card';
import { MapPin, Users, Flag, Zap, TrendingUp } from 'lucide-react';
import { getDriverPerformance, getTeamPerformance } from '../../utils/f1Data';

interface RaceTrackProps {
  drivers: Driver[];
  currentLap: number;
  totalLaps: number;
  circuitId?: string;
}

export const RaceTrack = ({ drivers, currentLap, totalLaps }: RaceTrackProps) => {
  // Simuler les positions sur la piste basées sur le temps total
  const sortedDrivers = [...drivers].sort((a, b) => a.totalTime - b.totalTime);
  const leaderTime = sortedDrivers[0]?.totalTime || 0;
  
  // Calculer le pourcentage de course complétée
  const raceProgress = (currentLap / totalLaps) * 100;

  return (
    <Card className="p-4 race-overlay">
      {/* En-tête avec informations circuit */}
      <div className="flex items-center gap-3 mb-4">
        <MapPin size={20} className="text-red-400 animate-pulse" />
        <div>
          <h3 className="text-lg font-bold text-white">POSITIONS EN PISTE</h3>
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <Flag size={14} />
            Tour {currentLap}/{totalLaps} • {raceProgress.toFixed(1)}% complété
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-400">Leader</div>
            <div className="text-white font-bold text-sm">
              {sortedDrivers[0]?.name.split(' ')[1] || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Piste de course */}
      <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-6 border-2 border-gray-700 min-h-[400px]">
        {/* Ligne de départ/arrivée avec effet F1 */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-2 h-12 bg-gradient-to-b from-white to-gray-300 rounded-sm shadow-lg"></div>
        
        {/* Marquages de piste */}
        <div className="absolute top-1/2 left-4 right-4 h-1 bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
        <div className="absolute top-1/4 left-4 right-4 h-0.5 bg-gray-600/50"></div>
        <div className="absolute top-3/4 left-4 right-4 h-0.5 bg-gray-600/50"></div>

        {/* Pilotes sur piste avec données F1 */}
        {sortedDrivers.map((driver, index) => {
          const driverData = getDriverPerformance(driver.name);
          const teamData = getTeamPerformance(driver.team);
          const gapToLeader = driver.position === 1 ? 0 : driver.totalTime - leaderTime;
          
          // Position basée sur l'écart au leader (plus réaliste)
          const positionPercentage = Math.max(5, Math.min(95, 
            (gapToLeader / 10) * 100 // 10s d'écart max pour l'affichage
          ));
          
          return (
            <div
              key={driver.id}
              className="absolute transition-all duration-500 ease-out transform hover:scale-110 hover:z-10"
              style={{
                left: `${positionPercentage}%`,
                top: `${15 + (index % 4) * 20}%`,
              }}
            >
              {/* Voiture/position */}
              <div 
                className="relative group"
                style={{ color: teamData?.color || '#666666' }}
              >
                <div 
                  className={`w-10 h-6 rounded-md flex items-center justify-center text-xs font-bold shadow-lg transform -skew-x-12 border-2 ${
                    driver.position === 1 ? 'ring-2 ring-yellow-400' :
                    driver.position === 2 ? 'ring-2 ring-gray-300' :
                    driver.position === 3 ? 'ring-2 ring-orange-500' :
                    'ring-1 ring-white/20'
                  }`}
                  style={{ 
                    backgroundColor: teamData?.color || '#666666',
                    borderColor: driver.position <= 3 ? 'currentColor' : '#4B5563'
                  }}
                  title={`${driver.name} - P${driver.position}\nÉquipe: ${driver.team}\nÉcart: +${gapToLeader.toFixed(1)}s`}
                >
                  <span className="transform skew-x-12 text-white font-mono font-bold">
                    {driver.position}
                  </span>
                </div>
                
                {/* Info-bulle au survol */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                  <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 text-xs min-w-[200px] shadow-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-white">{driver.name}</div>
                        <div className="text-gray-400" style={{ color: teamData?.color || '#666666' }}>
                          {driver.team}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-white">P{driver.position}</div>
                        <div className="text-gray-400">+{gapToLeader.toFixed(1)}s</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-gray-300">
                      <div className="flex items-center gap-1">
                        <Zap size={10} />
                        <span>Carb: {driver.fuel.toFixed(0)}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp size={10} />
                        <span>Pneus: {Math.round(driver.tyres.wear)}%</span>
                      </div>
                      <div>Consistance: {Math.round((driverData?.consistency || 0.8) * 100)}%</div>
                      <div>Agression: {Math.round((driverData?.aggression || 0.8) * 100)}%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nom du pilote */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="text-xs text-white bg-black/80 px-2 py-1 rounded border border-gray-600 whitespace-nowrap">
                  {driver.name.split(' ')[1]}
                </div>
                {driver.status === 'PIT' && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-[10px] px-1 rounded animate-pulse">
                    PIT
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Légende des écarts */}
        <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-xl p-3 border border-gray-700 min-w-[200px]">
          <div className="flex items-center gap-2 text-white mb-2">
            <Users size={14} className="text-red-400" />
            <span className="font-bold text-sm">ÉCARTS AU LEADER</span>
          </div>
          <div className="space-y-1 text-xs">
            {sortedDrivers.slice(0, 6).map((driver, index) => {
              const gapToLeader = index === 0 ? 0 : driver.totalTime - sortedDrivers[0].totalTime;
              const driverData = getDriverPerformance(driver.name);
              const teamData = getTeamPerformance(driver.team);
              
              return (
                <div 
                  key={driver.id} 
                  className="flex justify-between items-center py-1 px-2 rounded hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: teamData?.color || '#666666' }}
                    ></div>
                    <span className="text-white font-medium">
                      P{driver.position} {driver.name.split(' ')[1]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {index === 0 ? (
                      <span className="text-green-400 font-bold">LEADER</span>
                    ) : (
                      <span className="text-gray-300 font-mono">+{gapToLeader.toFixed(1)}s</span>
                    )}
                    <div 
                      className={`w-2 h-2 rounded-full ${
                        (driverData?.consistency || 0.8) > 0.9 ? 'bg-green-500' :
                        (driverData?.consistency || 0.8) > 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      title={`Consistance: ${Math.round((driverData?.consistency || 0.8) * 100)}%`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Indicateur de progression */}
        <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">PROGRESSION</div>
            <div className="text-white font-bold text-lg">{raceProgress.toFixed(1)}%</div>
            <div className="w-20 bg-gray-700 rounded-full h-2 mt-1 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${raceProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Classement rapide */}
      <div className="mt-4">
        <h4 className="text-sm font-bold text-gray-400 mb-2">CLASSEMENT - TOP 8</h4>
        <div className="grid grid-cols-1 gap-1">
          {sortedDrivers.slice(0, 8).map((driver) => {
            const teamData = getTeamPerformance(driver.team);
            const gapToLeader = driver.position === 1 ? 0 : driver.totalTime - sortedDrivers[0].totalTime;
            
            return (
              <div
                key={driver.id}
                className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 ${
                      driver.position === 1 ? 'bg-yellow-500 text-black ring-2 ring-yellow-300' :
                      driver.position === 2 ? 'bg-gray-400 text-black ring-2 ring-gray-300' :
                      driver.position === 3 ? 'bg-orange-800 text-white ring-2 ring-orange-600' :
                      'bg-gray-700 text-white'
                    }`}
                    style={{ 
                      borderColor: teamData?.color || '#666666',
                      backgroundColor: driver.position > 3 ? `${teamData?.color || '#666666'}40` : undefined 
                    }}
                  >
                    {driver.position}
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{driver.name}</div>
                    <div 
                      className="text-xs opacity-70"
                      style={{ color: teamData?.color || '#666666' }}
                    >
                      {driver.team}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-300 text-sm font-mono">
                    {driver.position === 1 ? 'LEADER' : `+${gapToLeader.toFixed(1)}s`}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                    <span>Pneus: {driver.tyres.compound.slice(0,1)}</span>
                    <span>•</span>
                    <span>Carb: {driver.fuel.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};