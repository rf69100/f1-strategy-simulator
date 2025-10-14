import { ReactNode } from 'react';
import { TeamName } from '../../types/f1';

interface CardProps {
  children: ReactNode;
  className?: string;
  team?: TeamName;
  glow?: boolean;
  hover?: boolean;
}

export const Card = ({ 
  children, 
  className = '', 
  team,
  glow = false,
  hover = false 
}: CardProps) => {
  const teamBorder = team ? `border-l-4 border-[${getTeamColor(team)}]` : 'border-l-4 border-gray-500';
  const glowEffect = glow ? 'shadow-lg' : 'shadow-md';
  const hoverEffect = hover ? 'transition-all duration-300 hover:scale-[1.02] hover:shadow-xl' : '';
  
  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${teamBorder} ${glowEffect} ${hoverEffect} ${className}`}>
      {children}
    </div>
  );
};

const getTeamColor = (team: TeamName): string => {
  const teamColors: Record<TeamName, string> = {
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
  return teamColors[team] || '#666666';
};

// Composant Card spécialisé pour les données F1
interface F1CardProps {
  driverName: string;
  team: TeamName;
  position: number;
  children: ReactNode;
  className?: string;
}

export const F1DriverCard = ({ 
  driverName, 
  team, 
  position, 
  children, 
  className = '' 
}: F1CardProps) => {
  const isPodium = position <= 3;
  const podiumGlow = isPodium ? 'shadow-lg shadow-yellow-500/20' : '';
  
  return (
    <Card team={team} glow={isPodium} hover={true} className={className}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-white truncate">{driverName}</h3>
          <p className="text-gray-300 text-sm">{team}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
          position === 1 ? 'bg-yellow-500 text-black' :
          position === 2 ? 'bg-gray-400 text-black' :
          position === 3 ? 'bg-orange-800 text-white' :
          'bg-gray-700 text-white'
        }`}>
          P{position}
        </div>
      </div>
      {children}
    </Card>
  );
};