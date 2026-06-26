import { useEffect, useState } from "react";
import { PersonaEntryContent } from "./PersonaDetails";
import type { GameData, Persona } from "../types";

type OwnedPersonas = {
  [personaName: string]: boolean;
};

type PersonaPopupProps = {
  persona: Persona;
  gameData: GameData;
  ownedPersonas?: OwnedPersonas;
  toggleOwned?: (personaName: string) => void;
  onClose: () => void;
};

type PersonaNameButtonProps = {
  personaName: string;
  persona?: Persona | null;
  gameData: GameData;
  ownedPersonas?: OwnedPersonas;
  toggleOwned?: (personaName: string) => void;
};

function PersonaPopup({
  persona,
  gameData,
  ownedPersonas,
  toggleOwned,
  onClose,
}: PersonaPopupProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="popup-backdrop" onClick={onClose}>
      <div
        className="persona-popup"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="popup-header">
          <h3>Compendium Entry</h3>

          <button
            type="button"
            onClick={onClose}
            className="popup-close-button"
          >
            Close
          </button>
        </div>

        <PersonaEntryContent
          persona={persona}
          skills={gameData.skills}
          affinities={gameData.affinities}
          showTreasureDemon={gameData.rareFusion.rarePersonas.length > 0}
          ownedPersonas={ownedPersonas}
          toggleOwned={toggleOwned}
          title="Persona Details"
        />
      </div>
    </div>
  );
}

export function PersonaNameButton({
  personaName,
  persona,
  gameData,
  ownedPersonas,
  toggleOwned,
}: PersonaNameButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const compendiumPersona =
    persona ?? gameData.personas.find((item) => item.name === personaName) ?? null;

  if (!compendiumPersona) {
    return <>{personaName}</>;
  }

  return (
    <>
      <button
        type="button"
        className="persona-link-button"
        onClick={() => setIsOpen(true)}
        title={`Open ${compendiumPersona.name} compendium entry`}
      >
        {personaName}
      </button>

      {isOpen && (
        <PersonaPopup
          persona={compendiumPersona}
          gameData={gameData}
          ownedPersonas={ownedPersonas}
          toggleOwned={toggleOwned}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

export default PersonaPopup;
