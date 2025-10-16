import React from "react";
import { Card } from "../ui/Card";
import { TEAM_DATA } from "../../utils/f1Data";

export interface MenuTeamProps {
  onSelectTeam: (team: string) => void;
}

const MenuTeam: React.FC<MenuTeamProps> = ({ onSelectTeam }) => {
  return (
    <>
      <Card className="p-8 mb-8 animate-fade-in text-center">
        <h2 className="text-2xl font-extrabold mb-4 text-blue-400">Choisissez votre écurie</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {Object.keys(TEAM_DATA).map(team => (
            <button
              key={team}
              className="py-3 px-4 rounded-lg font-bold text-lg shadow-xl transition-colors bg-gray-800 hover:bg-red-700 text-white"
              onClick={() => onSelectTeam(team)}
            >
              {team}
            </button>
          ))}
        </div>
      </Card>
    </>
  );
};

export default MenuTeam;
