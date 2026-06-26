import { useState } from "react";
import { getIconPath } from "../utils/icons";
import type { AffinityRow, Persona, SkillsData } from "../types";

type PersonaDetailsProps = {
  selectedPersona: Persona;
  skills: SkillsData;
  affinities: AffinityRow[];
  showTreasureDemon: boolean;
  ownedPersonas: {
    [personaName: string]: boolean;
  };
  toggleOwned: (personaName: string) => void;
};

type PersonaEntryContentProps = {
  persona: Persona;
  skills: SkillsData;
  affinities: AffinityRow[];
  showTreasureDemon?: boolean;
  ownedPersonas?: {
    [personaName: string]: boolean;
  };
  toggleOwned?: (personaName: string) => void;
  title?: string;
};

function formatSkillLevel(level: number) {
  return level <= 0 ? "Base" : `Lv ${level}`;
}

export function PersonaEntryContent({
  persona,
  skills,
  affinities,
  showTreasureDemon = true,
  ownedPersonas,
  toggleOwned,
  title = "Persona Details",
}: PersonaEntryContentProps) {
  const [selectedSkillName, setSelectedSkillName] = useState<string | null>(
    null
  );

  const selectedSkill = selectedSkillName ? skills[selectedSkillName] : null;

  return (
    <>
      <div className="details-header">
        <div>
          <h2>{title}</h2>
          <h3>{persona.name}</h3>
        </div>

        {ownedPersonas && toggleOwned && (
          <label className="owned-toggle">
            <input
              type="checkbox"
              checked={!!ownedPersonas[persona.name]}
              onChange={() => toggleOwned(persona.name)}
            />
            Owned
          </label>
        )}
      </div>

      <div className="info-grid">
        <p>Arcana: {persona.arcana}</p>
        <p>Level: {persona.level}</p>
        {persona.trait && <p>Trait: {persona.trait}</p>}
        <p>DLC: {persona.isDlc ? "Yes" : "No"}</p>
        <p>DLC Pack: {persona.dlcPack ?? "None"}</p>
        <p>Special Fusion: {persona.specialFusion ? "Yes" : "No"}</p>
        {showTreasureDemon && (
          <p>Treasure Demon: {persona.rare ? "Yes" : "No"}</p>
        )}
        <p>Inherits: {persona.inherits}</p>
      </div>

      <div className="details-section">
        <h4>Stats</h4>

        <div className="info-grid compact">
          <p>Strength: {persona.stats.strength}</p>
          <p>Magic: {persona.stats.magic}</p>
          <p>Endurance: {persona.stats.endurance}</p>
          <p>Agility: {persona.stats.agility}</p>
          <p>Luck: {persona.stats.luck}</p>
        </div>
      </div>

      <div className="details-section">
        <h4>Affinities</h4>

        <div className="affinity-grid">
          {affinities.map((affinity) => (
            <div key={affinity.key} className="affinity-item">
              <img
                src={affinity.icon}
                alt={affinity.label}
                title={affinity.label}
                className="affinity-icon"
              />

              <span>{persona.affinities[affinity.key]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="details-section">
        <h4>Skills</h4>

        <div className="skill-list">
          {persona.skills.map((skill, index) => {
            const skillInfo = skills[skill.name];
            const iconPath = skillInfo
              ? getIconPath(skillInfo.element)
              : getIconPath("passive");

            return (
              <button
                key={index}
                type="button"
                className="skill-chip skill-chip-button"
                onClick={() => setSelectedSkillName(skill.name)}
              >
                <img
                  src={iconPath}
                  alt={skillInfo?.element ?? "Skill"}
                  title={skillInfo?.element ?? "Skill"}
                  className="skill-type-icon"
                />

                {skill.name} <span>{formatSkillLevel(skill.level)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedSkillName && (
        <div
          className="popup-backdrop"
          onClick={() => setSelectedSkillName(null)}
        >
          <div
            className="skill-popup"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="popup-header">
              <h3>{selectedSkillName}</h3>

              <button
                type="button"
                onClick={() => setSelectedSkillName(null)}
                className="popup-close-button"
              >
                Close
              </button>
            </div>

            {selectedSkill ? (
              <>
                <div className="popup-skill-type">
                  <img
                    src={getIconPath(selectedSkill.element)}
                    alt={selectedSkill.element}
                    className="skill-type-icon large"
                  />
                  <span>{selectedSkill.element}</span>
                </div>

                <p>Cost: {selectedSkill.cost}</p>
                <p>{selectedSkill.description}</p>
              </>
            ) : (
              <p>No skill details found.</p>
            )}
          </div>
        </div>
      )}

      <div className="details-section">
        <h4>Locations</h4>

        {persona.locations.map((location, index) => (
          <div key={index} className="location-card">
            <p>Method: {location.method}</p>
            <p>Area: {location.area}</p>
            <p>Notes: {location.notes}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function PersonaDetails({
  selectedPersona,
  skills,
  affinities,
  showTreasureDemon,
  ownedPersonas,
  toggleOwned,
}: PersonaDetailsProps) {
  return (
    <section className="details-panel">
      <PersonaEntryContent
        persona={selectedPersona}
        skills={skills}
        affinities={affinities}
        showTreasureDemon={showTreasureDemon}
        ownedPersonas={ownedPersonas}
        toggleOwned={toggleOwned}
      />
    </section>
  );
}

export default PersonaDetails;
