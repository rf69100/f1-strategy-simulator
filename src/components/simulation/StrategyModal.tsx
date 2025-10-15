import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Card } from '../ui/Card';
import { Calculator, TrendingUp, Clock, Zap, Target, Award } from 'lucide-react';
import { useStrategy } from '../../hooks/useStrategy';
import { StintHistory } from './StintHistory';
import { TyreCompound } from '../../types/f1';

import { PitConfig } from '../../stores/simulationStore';

interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverId: string;
  manualPit?: (driverId: string, pitConfig: PitConfig) => void;
  pitConfig?: PitConfig;
}

export const StrategyModal = ({ isOpen, onClose, driverId, manualPit, pitConfig }: StrategyModalProps) => {
  const {
    driver,
    activeStrategy,
    optimalStrategy,
    pitStopRecommendation,
    strategyAnalysis,
    setCustomTyreStrategy,
    resetToOptimal,
    predefinedStrategies,
    teamData,
    driverData
  } = useStrategy(driverId);

  const [selectedCompound, setSelectedCompound] = useState<TyreCompound>('MEDIUM');
  const [selectedStops, setSelectedStops] = useState(2);

  if (!driver) return null;

  const handleApplyStrategy = () => {
    setCustomTyreStrategy(selectedCompound, selectedStops);
    onClose();
  };

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
    <Modal isOpen={isOpen} onClose={onClose} title="STRATÉGIE DE COURSE" size="xl">
      {/* En-tête Pilote */}
      <div className="mb-6 p-4 bg-gradient-to-r from-gray-800 to-black rounded-lg border border-gray-600">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">{driver.name}</h3>
            <p className="text-gray-300" style={{ color: teamData?.color || '#666666' }}>
              {driver.team} • P{driver.position}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Performance</div>
            <div className="text-white font-bold">{Math.round((teamData?.performance || 0.8) * 100)}%</div>
          </div>
        </div>
      </div>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne 1: État actuel */}
        <div className="lg:col-span-1">
          <Card className="p-4 mb-4">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Calculator size={16} />
              ÉTAT ACTUEL
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Pneus actuels</span>
                <div className={`px-2 py-1 rounded text-xs font-bold ${getTyreColor(driver.tyres.compound)}`}>
                  {driver.tyres.compound}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Usure pneus</span>
                  <span>{Math.round(driver.tyres.wear)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      driver.tyres.wear < 30 ? 'bg-green-500' :
                      driver.tyres.wear < 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${driver.tyres.wear}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Carburant</span>
                  <span>{driver.fuel.toFixed(1)} kg</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${driver.fuel}%` }}
                  />
                </div>
              </div>

              {/* Recommandation */}
              <div className={`p-3 rounded-lg border ${
                pitStopRecommendation.type === 'CRITICAL' ? 'bg-red-900/30 border-red-500' :
                pitStopRecommendation.type === 'IMMEDIATE' ? 'bg-orange-900/30 border-orange-500' :
                pitStopRecommendation.type === 'SOON' ? 'bg-yellow-900/30 border-yellow-500' :
                'bg-green-900/30 border-green-500'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <Target size={14} className={
                    pitStopRecommendation.type === 'CRITICAL' ? 'text-red-400' :
                    pitStopRecommendation.type === 'IMMEDIATE' ? 'text-orange-400' :
                    pitStopRecommendation.type === 'SOON' ? 'text-yellow-400' : 'text-green-400'
                  } />
                  <span className="text-white text-sm font-semibold">
                    {pitStopRecommendation.type === 'CRITICAL' ? '🚨 ACTION REQUISE' :
                     pitStopRecommendation.type === 'IMMEDIATE' ? '⚠️ ARRÊT CONSEILLÉ' :
                     pitStopRecommendation.type === 'SOON' ? '📅 ARRÊT PROCHAIN' : '✅ TOUT VA BIEN'}
                  </span>
                </div>
                <p className="text-gray-200 text-xs">
                  {pitStopRecommendation.reason}
                </p>
                {/* Manual PIT button if available */}
                {manualPit && pitConfig && (
                  <button
                    className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-all"
                    onClick={() => manualPit(driverId, pitConfig)}
                  >
                    Forcer PIT maintenant
                  </button>
                )}
              </div>
            </div>
          </Card>
          {/* Ajout du composant StintHistory */}
          <StintHistory driver={driver} />

          {/* Analyse performance */}
          <Card className="p-4">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp size={16} />
              ANALYSE PERFORMANCE
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Niveau risque</span>
                <span className={`font-semibold ${
                  strategyAnalysis.riskLevel === 'HIGH' ? 'text-red-400' :
                  strategyAnalysis.riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {strategyAnalysis.riskLevel === 'HIGH' ? 'Élevé' :
                   strategyAnalysis.riskLevel === 'MEDIUM' ? 'Moyen' : 'Faible'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Avantage pneus</span>
                <span className={`font-semibold ${
                  strategyAnalysis.tyreAdvantage > 0 ? 'text-green-400' :
                  strategyAnalysis.tyreAdvantage < 0 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {strategyAnalysis.tyreAdvantage > 0 ? '+' : ''}
                  {(strategyAnalysis.tyreAdvantage * 100).toFixed(1)}%
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Efficacité carburant</span>
                <span className="text-white font-semibold">
                  {Math.round(strategyAnalysis.fuelEfficiency * 100)}%
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Agression pilote</span>
                <span className="text-white font-semibold">
                  {Math.round((driverData?.aggression || 0.8) * 100)}%
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Colonne 2: Stratégie personnalisée */}
        <div className="lg:col-span-1">
          <Card className="p-4 h-full">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Zap size={16} />
              STRATÉGIE PERSONNALISÉE
            </h4>

            {/* Sélection pneus */}
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-2 block">Compound</label>
              <div className="grid grid-cols-3 gap-2">
                {(['SOFT', 'MEDIUM', 'HARD'] as TyreCompound[]).map((compound) => (
                  <button
                    key={compound}
                    onClick={() => setSelectedCompound(compound)}
                    className={`p-2 rounded text-xs font-bold transition-all ${
                      selectedCompound === compound ? 'scale-105 ring-2 ring-white' : ''
                    } ${getTyreColor(compound)}`}
                  >
                    {compound.slice(0,1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre d'arrêts */}
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-2 block">Nombre d'arrêts</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((stops) => (
                  <button
                    key={stops}
                    onClick={() => setSelectedStops(stops)}
                    className={`p-2 rounded text-xs font-semibold transition-all ${
                      selectedStops === stops 
                        ? 'bg-blue-600 text-white scale-105' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {stops} {stops === 1 ? 'arrêt' : 'arrêts'}
                  </button>
                ))}
              </div>
            </div>

            {/* Stratégies prédéfinies */}
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-2 block">Stratégies prédéfinies</label>
              <div className="space-y-2">
                {Object.entries(predefinedStrategies).map(([key, strategy]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedCompound(strategy.preferredCompound);
                      setSelectedStops(strategy.targetStops);
                    }}
                    className="w-full text-left p-2 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
                  >
                    <div className="font-semibold text-white">{strategy.name}</div>
                    <div className="text-gray-400">{strategy.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleApplyStrategy}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 text-sm rounded transition-colors"
            >
              Appliquer cette stratégie
            </button>

            {activeStrategy !== optimalStrategy && (
              <button
                onClick={resetToOptimal}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 text-sm rounded transition-colors mt-2"
              >
                Revenir à la stratégie optimale
              </button>
            )}
          </Card>
        </div>

        {/* Colonne 3: Stratégie optimale */}
        <div className="lg:col-span-1">
          <Card className="p-4 h-full">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Award size={16} />
              STRATÉGIE OPTIMALE
            </h4>

            {optimalStrategy && (
              <div className="space-y-4">
                <div className="text-center p-3 bg-gradient-to-r from-green-900/30 to-green-800/20 rounded-lg border border-green-500/50">
                  <div className="text-green-400 text-sm font-semibold">RECOMMANDÉE</div>
                  <div className="text-white font-bold text-lg">
                    {optimalStrategy.plannedStops} {optimalStrategy.plannedStops === 1 ? 'arrêt' : 'arrêts'}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getTyreColor(optimalStrategy.targetCompound)}`}>
                    {optimalStrategy.targetCompound}
                  </div>
                </div>

                {/* Arrêts prévus */}
                <div>
                  <h5 className="text-sm text-gray-400 mb-2">Arrêts prévus</h5>
                  <div className="space-y-2">
                    {optimalStrategy.pitStops?.map((stop: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                        <div className="flex items-center gap-2">
                          <Clock size={12} className="text-gray-400" />
                          <span className="text-white text-sm">Tour {stop.lap}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-2 py-1 rounded text-xs ${getTyreColor(stop.tyreCompound)}`}>
                            {stop.tyreCompound.slice(0,1)}
                          </div>
                          <span className="text-gray-400 text-xs">+{stop.fuelAdded}kg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Temps prévu */}
                {optimalStrategy.expectedRaceTime && (
                  <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/50">
                    <div className="text-blue-400 text-sm font-semibold">Temps course prévu</div>
                    <div className="text-white font-bold text-lg">
                      {Math.floor(optimalStrategy.expectedRaceTime / 60)}:{(optimalStrategy.expectedRaceTime % 60).toFixed(3)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Modal>
  );
};