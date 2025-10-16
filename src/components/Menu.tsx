import { useState } from "react";
import MenuMode from "./menu/MenuMode";
import MenuTeam from "./menu/MenuTeam";
import MenuDrivers from "./menu/MenuDrivers";
import MenuConfirm from "./menu/MenuConfirm";
import MenuCircuit from "./menu/MenuCircuit";
import MenuQualifs from "./menu/MenuQualifs";

export interface MenuProps {
  onDone?: (choices: any) => void;
}

export function Menu({ onDone }: MenuProps) {
  const [step, setStep] = useState<"mode" | "team" | "drivers" | "confirm" | "difficulty" | "circuit" | "qualifs">("mode");
  const [selectedMode, setSelectedMode] = useState<"gp" | "race" | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedDriver1, setSelectedDriver1] = useState<string | undefined>(undefined);
  const [selectedDriver2, setSelectedDriver2] = useState<string | undefined>(undefined);
  const [selectedCircuit, setSelectedCircuit] = useState<string | undefined>(undefined);

  // Flow handlers
  const handleSelectMode = (mode: "gp" | "race") => {
    setSelectedMode(mode);
    setStep("team");
  };
  const handleSelectTeam = (team: string) => {
    setSelectedTeam(team);
    setStep("drivers");
  };
  const handleSelectDriver1 = (driver: string) => {
    setSelectedDriver1(driver);
    // If both drivers are selected, go to circuit selection
    if (driver && selectedDriver2) {
      setStep("circuit");
    }
  };
  const handleSelectDriver2 = (driver: string) => {
    setSelectedDriver2(driver);
    if (selectedDriver1 && driver) {
      setStep("circuit");
    }
  };
  const handleConfirm = () => {
      setStep("circuit");
  };
  const handleSelectCircuit = (circuit: string) => {
    setSelectedCircuit(circuit);
    if (selectedMode === "race") {
      if (onDone) {
        onDone({
          mode: selectedMode,
          team: selectedTeam,
          driver1: selectedDriver1,
          driver2: selectedDriver2,
          circuit: circuit
        });
      }
    } else {
      setStep("qualifs");
    }
  };
  const handleQualifsNext = () => {
    if (onDone) {
      onDone({
        mode: selectedMode,
        team: selectedTeam,
        driver1: selectedDriver1,
        driver2: selectedDriver2,
        circuit: selectedCircuit
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-red-900 text-white px-4 py-8">
      <div className="w-full max-w-2xl mx-auto text-center space-y-8 md:space-y-10">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-wide text-red-500 mb-2 md:mb-4">Menu F1 Simulator</h1>
        {step === "mode" && (
          <MenuMode onSelectMode={handleSelectMode} />
        )}
        {step === "team" && (
          <MenuTeam onSelectTeam={handleSelectTeam} />
        )}
        {step === "drivers" && selectedTeam && (
          <MenuDrivers
            team={selectedTeam}
            onSelectDriver1={driver => { handleSelectDriver1(driver); setStep("drivers"); }}
            onSelectDriver2={driver => handleSelectDriver2(driver)}
            selectedDriver1={selectedDriver1}
            selectedDriver2={selectedDriver2}
          />
        )}
        {step === "confirm" && selectedTeam && selectedDriver1 && (
          <MenuConfirm
            team={selectedTeam}
            driver1={selectedDriver1}
            driver2={selectedDriver2}
            onConfirm={handleConfirm}
          />
        )}
        {step === "circuit" && (
          <MenuCircuit
            selectedCircuit={selectedCircuit}
            onSelectCircuit={handleSelectCircuit}
          />
        )}
        {step === "qualifs" && selectedMode !== "race" && (
          <MenuQualifs onNext={handleQualifsNext} />
        )}
      </div>
    </div>
  );
}
