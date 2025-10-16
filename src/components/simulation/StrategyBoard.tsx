import React from 'react';
import { Driver, TyreCompound } from '../../types/f1';
import { Card } from '../ui/Card';
import { Calculator, TrendingUp, Clock, Zap, AlertTriangle, Target } from 'lucide-react';
import { getTyrePerformance, getTeamPerformance } from '../../utils/f1Data';

interface StrategyBoardProps {
  driver: Driver;
  onTyreChange: (compound: TyreCompound) => void;
  onFuelAdd: (amount: number) => void;
  onManualPit: (pitConfig: { tyreThreshold: number; fuelThreshold: number; pitDuration: number; compound?: TyreCompound }) => void;
  currentLap: number;
  totalLaps: number;
  weather?: string;
  pitConfig: {
    tyreThreshold: number;
    fuelThreshold: number;
    pitDuration: number;
    setTyreThreshold: (val: number) => void;
    setFuelThreshold: (val: number) => void;
    setPitDuration: (val: number) => void;
  };
}

export const StrategyBoard = ({ 
  driver, 
  onTyreChange, 
  onFuelAdd, 
  onManualPit,
  currentLap, 
  totalLaps,
  weather = 'DRY',
  pitConfig
}: StrategyBoardProps) => {
  const tyreOptions: TyreCompound[] = ['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET'];
  const [selectedPitCompound, setSelectedPitCompound] = React.useState<TyreCompound>(driver.tyres.compound);
  
  // Données F1 réelles
  const teamData = getTeamPerformance(driver.team);
  
  // Calculs stratégiques améliorés
  const lapsRemaining = totalLaps - currentLap;
  const predictedLapsOnFuel = Math.floor(driver.fuel / 1.2);
  const predictedLapsOnTyres = Math.floor((100 - driver.tyres.wear) / (driver.tyres.degradationRate || 1.5));
  
  // Meilleur tour pour pit stop basé sur les données F1
  const optimalPitLap = Math.min(
    currentLap + predictedLapsOnTyres,
    currentLap + predictedLapsOnFuel,
    totalLaps - 5 // Ne pas s'arrêter dans les 5 derniers tours
  );

  // Recommandation de pneus basée sur la météo et les données F1
  const getRecommendedTyres = (): TyreCompound[] => {
    if (weather === 'WET') return ['WET', 'INTERMEDIATE'];
    if (weather === 'DRIZZLE') return ['INTERMEDIATE', 'MEDIUM'];
    
    const remainingLaps = totalLaps - currentLap;
    if (remainingLaps <= 15) return ['SOFT', 'MEDIUM'];
    if (remainingLaps <= 30) return ['MEDIUM', 'HARD'];
    return ['HARD', 'MEDIUM'];
  };

  const recommendedTyres = getRecommendedTyres();

  // Score de stratégie
  const calculateStrategyScore = (compound: TyreCompound): number => {
    const tyrePerf = getTyrePerformance(compound);
    let score = 0;
    
    // Adéquation météo
    if (weather === 'WET' && (compound === 'WET' || compound === 'INTERMEDIATE')) score += 30;
    if (weather === 'DRIZZLE' && compound === 'INTERMEDIATE') score += 25;
    if (weather === 'DRY' && compound !== 'WET' && compound !== 'INTERMEDIATE') score += 20;
    
    // Adéquation distance restante
    const lapsAfterPit = totalLaps - currentLap;
    const expectedLaps = Math.floor(tyrePerf.durability * 40); // 40 tours max pour référence

    if (lapsAfterPit <= expectedLaps * 0.8) score += 25; // Parfait pour la distance
    else if (lapsAfterPit <= expectedLaps) score += 15; // Correct pour la distance
    
    // Performance
    score += tyrePerf.grip * 20;
    score += tyrePerf.warmup * 10;
    
    return Math.round(score);
  };

  // Niveau d'urgence
  const getUrgencyLevel = () => {
    if (driver.tyres.wear > 90 || driver.fuel < 15) return 'CRITICAL';
    if (driver.tyres.wear > 75 || driver.fuel < 25) return 'HIGH';
    if (driver.tyres.wear > 60 || driver.fuel < 40) return 'MEDIUM';
    return 'LOW';
  };

  const urgencyLevel = getUrgencyLevel();

  // Pit config controls
  const { tyreThreshold, fuelThreshold, pitDuration, setTyreThreshold, setFuelThreshold, setPitDuration } = pitConfig;

  const getTyreColor = (compound: TyreCompound) => {
    const colors: Record<TyreCompound, string> = {
      'SOFT': 'bg-red-500 text-white',
      'MEDIUM': 'bg-yellow-500 text-black',
      'HARD': 'bg-white text-black',
      'INTERMEDIATE': 'bg-green-500 text-white',
      'WET': 'bg-blue-500 text-white'
    };
    return colors[compound];
  };

  return (
  <Card className="p-4">
      {/* Configurable pit thresholds & manual pit button */}
      <div className="mb-4 bg-black/20 rounded-lg p-3 border border-gray-700">
        <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <AlertTriangle size={16} className="text-yellow-400" />
          Paramètres Pitstop
        </h4>
        <div className="grid grid-cols-4 gap-3 mb-2">
          <div>
            <label className="text-xs text-gray-300">Usure pneus (%)</label>
            <input type="number" min={0} max={100} value={tyreThreshold} onChange={e => setTyreThreshold(Number(e.target.value))} className="w-full mt-1 p-1 rounded bg-gray-800 text-white text-xs" />
          </div>
          <div>
            <label className="text-xs text-gray-300">Carburant (kg)</label>
            <input type="number" min={0} max={100} value={fuelThreshold} onChange={e => setFuelThreshold(Number(e.target.value))} className="w-full mt-1 p-1 rounded bg-gray-800 text-white text-xs" />
          </div>
          <div>
            <label className="text-xs text-gray-300">Durée pit (s)</label>
            <input type="number" min={1} max={30} value={pitDuration} onChange={e => setPitDuration(Number(e.target.value))} className="w-full mt-1 p-1 rounded bg-gray-800 text-white text-xs" />
          </div>
          <div>
            <label className="text-xs text-gray-300">Pneus au pit</label>
            <select value={selectedPitCompound} onChange={e => setSelectedPitCompound(e.target.value as TyreCompound)} className="w-full mt-1 p-1 rounded bg-gray-800 text-white text-xs">
              {tyreOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-all mt-2 w-full"
          onClick={() => onManualPit({ tyreThreshold, fuelThreshold, pitDuration, compound: selectedPitCompound })}
        >
          Forcer PIT maintenant
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-all mt-2 w-full"
          onClick={() => onFuelAdd(20)}
        >
          Ajouter 20kg de carburant
        </button>
      </div>
  {/* ...existing code... */}
      <div className="flex items-center gap-3 mb-4">
        <Calculator size={20} className="text-blue-400" />
        <div>
          <h3 className="text-lg font-bold text-white">STRATÉGIE {driver.name.split(' ')[1]}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: teamData?.color || '#666666' }}
            ></div>
            <span>{driver.team}</span>
            <span>•</span>
            <span>Perf: {Math.round((teamData?.performance || 0.8) * 100)}%</span>
            <span>•</span>
            <span>Fiab: {Math.round((teamData?.reliability || 0.8) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Indicateurs stratégiques */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-black/30 rounded-lg p-3 border border-gray-600">
          <p className="text-gray-400 text-xs mb-1">TOURS RESTANTS</p>
          <div className="flex items-end gap-2">
            <p className="text-white font-bold text-xl">{predictedLapsOnFuel}</p>
            <span className="text-gray-400 text-xs mb-1">sur {lapsRemaining}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
            <div 
              className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (predictedLapsOnFuel / lapsRemaining) * 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-black/30 rounded-lg p-3 border border-gray-600">
          <p className="text-gray-400 text-xs mb-1">PIT OPTIMAL</p>
          <p className="text-white font-bold text-xl">Lap {optimalPitLap}</p>
          <div className="text-gray-400 text-xs mt-1">
            {optimalPitLap - currentLap > 0 
              ? `Dans ${optimalPitLap - currentLap} tours` 
              : 'Maintenant!'}
          </div>
        </div>
      </div>

      {/* Indicateur d'urgence */}
      {urgencyLevel !== 'LOW' && (
        <div className={`mb-4 rounded-lg p-3 border ${
          urgencyLevel === 'CRITICAL' 
            ? 'bg-red-900/30 border-red-500 animate-pulse' 
            : urgencyLevel === 'HIGH'
            ? 'bg-orange-900/30 border-orange-500'
            : 'bg-yellow-900/30 border-yellow-500'
        }`}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className={
              urgencyLevel === 'CRITICAL' ? 'text-red-400' :
              urgencyLevel === 'HIGH' ? 'text-orange-400' : 'text-yellow-400'
            } />
            <span className="text-white font-semibold text-sm">
              {urgencyLevel === 'CRITICAL' ? 'ACTION IMMÉDIATE REQUISE' :
               urgencyLevel === 'HIGH' ? 'ACTION RECOMMANDÉE' : 'SURVEILLANCE'}
            </span>
          </div>
          <p className="text-gray-200 text-xs mt-1">
            {driver.tyres.wear > 80 && `Pneus à ${Math.round(driver.tyres.wear)}% usure`}
            {driver.tyres.wear > 80 && driver.fuel < 30 && ' • '}
            {driver.fuel < 30 && `Carburant à ${driver.fuel.toFixed(0)}kg`}
          </p>
        </div>
      )}

      {/* Changement pneus avec scores */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <TrendingUp size={16} />
          CHANGEMENT PNEUS
          <span className="text-xs text-gray-400 ml-auto">Météo: {weather}</span>
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {tyreOptions.map((compound) => {
            const tyrePerf = getTyrePerformance(compound);
            const score = calculateStrategyScore(compound);
            const isRecommended = recommendedTyres.includes(compound);
            const isCurrent = driver.tyres.compound === compound;
            
            return (
              <button
                key={compound}
                onClick={() => onTyreChange(compound)}
                className={`p-3 rounded-lg text-xs font-bold transition-all relative group ${
                  isCurrent 
                    ? 'ring-2 ring-white scale-105 shadow-lg' 
                    : isRecommended
                    ? 'ring-2 ring-green-400 scale-105'
                    : 'hover:scale-105'
                } ${getTyreColor(compound)}`}
              >
                <div className="text-center">
                  <div className="font-mono text-lg mb-1">{compound.slice(0,1)}</div>
                  <div className="text-xs opacity-80">{compound}</div>
                </div>
                
                {/* Score de stratégie */}
                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                  score >= 70 ? 'bg-green-500 text-white' :
                  score >= 50 ? 'bg-yellow-500 text-black' :
                  'bg-red-500 text-white'
                }`}>
                  {score}
                </div>
                
                {/* Info-bulle performance */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-900 border border-gray-600 rounded-lg p-2 text-xs min-w-[140px] shadow-xl">
                    <div className="font-bold text-white mb-1">{compound}</div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-gray-300">
                      <div>Adhérence:</div>
                      <div className="text-right">{Math.round(tyrePerf.grip * 100)}%</div>
                      <div>Durabilité:</div>
                      <div className="text-right">{Math.round(tyrePerf.durability * 100)}%</div>
                      <div>Réchauffement:</div>
                      <div className="text-right">{Math.round(tyrePerf.warmup * 100)}%</div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Légende recommandations */}
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Target size={12} className="text-green-400" />
            <span>Recommandé</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Score ≥70</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Score ≥50</span>
          </div>
        </div>
      </div>

      {/* Ajout carburant */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Zap size={16} />
          RAVITAILLEMENT
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {[10, 20, 30].map((amount) => {
            const newFuel = Math.min(100, driver.fuel + amount);
            const lapsGained = Math.floor(amount / 1.2);
            
            return (
              <button
                key={amount}
                onClick={() => onFuelAdd(amount)}
                className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg text-white text-xs font-semibold transition-all hover:scale-105 group relative"
              >
                <div className="text-center">
                  <div className="font-mono text-lg">+{amount}kg</div>
                  <div className="text-gray-300 text-xs">≈{lapsGained}tours</div>
                </div>
                
                {/* Info-bulle */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-900 border border-gray-600 rounded-lg p-2 text-xs shadow-xl">
                    <div>Nouveau total: {newFuel}kg</div>
                    <div>Tours gagnés: +{lapsGained}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommandation stratégique */}
      <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/50">
        <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <Clock size={16} className="text-blue-400" />
          RECOMMANDATION STRATÉGIQUE
        </h4>
        <p className="text-blue-200 text-xs leading-relaxed">
          {urgencyLevel === 'CRITICAL' 
            ? `🔄 Arrêt IMMÉDIAT requis! Pneus: ${Math.round(driver.tyres.wear)}% usure, Carburant: ${driver.fuel.toFixed(0)}kg`
            : driver.tyres.wear > 70
            ? `🎯 Arrêt recommandé dans ${optimalPitLap - currentLap} tours. Pneus ${recommendedTyres[0]} conseillés`
            : driver.fuel < 40
            ? `⛽ Ravitaillement recommandé. ${Math.max(0, predictedLapsOnFuel - 5)} tours de marge`
            : `✅ Stratégie optimale. Prochain arrêt prévu au tour ${optimalPitLap}`
          }
        </p>
        <div className="flex items-center gap-4 mt-2 text-xs text-blue-300">
          <span>Pneus conseillés: {recommendedTyres.join(', ')}</span>
        </div>
      </div>
    </Card>
  );
};