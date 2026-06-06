import { useState } from "react";
import skillsData from "../data/skills.json";
import type { Persona } from "../types";

type PersonaDetailsProps = {
  selectedPersona: Persona;
  ownedPersonas: {
    [personaName: string]: boolean;
  };
  toggleOwned: (personaName: string) => void;
};

type SkillInfo = {
  element: string;
  cost: string;
  description: string;
};

type SkillsData = {
  [skillName: string]: SkillInfo;
};

type AffinityKey =
  | "physical"
  | "gun"
  | "fire"
  | "ice"
  | "electric"
  | "wind"
  | "psy"
  | "nuclear"
  | "bless"
  | "curse";

const skills = skillsData as SkillsData;
const iconBasePath = `${import.meta.env.BASE_URL}icons/`;

const affinityRows: {
  key: AffinityKey;
  label: string;
  icon: string;
}[] = [
  { key: "physical", label: "Physical", icon: `${iconBasePath}physical.png` },
  { key: "gun", label: "Gun", icon: `${iconBasePath}gun.png` },
  { key: "fire", label: "Fire", icon: `${iconBasePath}fire.png` },
  { key: "ice", label: "Ice", icon: `${iconBasePath}ice.png` },
  { key: "electric", label: "Electric", icon: `${iconBasePath}electric.png` },
  { key: "wind", label: "Wind", icon: `${iconBasePath}wind.png` },
  { key: "psy", label: "Psy", icon: `${iconBasePath}psy.png` },
  { key: "nuclear", label: "Nuclear", icon: `${iconBasePath}nuclear.png` },
  { key: "bless", label: "Bless", icon: `${iconBasePath}bless.png` },
  { key: "curse", label: "Curse", icon: `${iconBasePath}curse.png` },
];

function getSkillIconPath(element: string) {
  return `${iconBasePath}${element.toLowerCase()}.png`;
}

function PersonaDetails({
  selectedPersona,
  ownedPersonas,
  toggleOwned,
}: PersonaDetailsProps) {
  const [selectedSkillName, setSelectedSkillName] = useState<string | null>(
    null
  );

  const selectedSkill = selectedSkillName ? skills[selectedSkillName] : null;

  return (
    <section className="details-panel">
      <div className="details-header">
        <div>
          <h2>Persona Details</h2>
          <h3>{selectedPersona.name}</h3>
        </div>

        <label className="owned-toggle">
          <input
            type="checkbox"
            checked={!!ownedPersonas[selectedPersona.name]}
            onChange={() => toggleOwned(selectedPersona.name)}
          />
          Owned
        </label>
      </div>

      <div className="info-grid">
        <p>Arcana: {selectedPersona.arcana}</p>
        <p>Level: {selectedPersona.level}</p>
        <p>Trait: {selectedPersona.trait}</p>
        <p>DLC: {selectedPersona.isDlc ? "Yes" : "No"}</p>
        <p>DLC Pack: {selectedPersona.dlcPack ?? "None"}</p>
        <p>Special Fusion: {selectedPersona.specialFusion ? "Yes" : "No"}</p>
        <p>Treasure Demon: {selectedPersona.rare ? "Yes" : "No"}</p>
        <p>Inherits: {selectedPersona.inherits}</p>
      </div>

      <div className="details-section">
        <h4>Stats</h4>

        <div className="info-grid compact">
          <p>Strength: {selectedPersona.stats.strength}</p>
          <p>Magic: {selectedPersona.stats.magic}</p>
          <p>Endurance: {selectedPersona.stats.endurance}</p>
          <p>Agility: {selectedPersona.stats.agility}</p>
          <p>Luck: {selectedPersona.stats.luck}</p>
        </div>
      </div>

      <div className="details-section">
        <h4>Affinities</h4>

        <div className="affinity-grid">
          {affinityRows.map((affinity) => (
            <div key={affinity.key} className="affinity-item">
              <img
                src={affinity.icon}
                alt={affinity.label}
                title={affinity.label}
                className="affinity-icon"
              />

              <span>{selectedPersona.affinities[affinity.key]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="details-section">
        <h4>Skills</h4>

        <div className="skill-list">
          {selectedPersona.skills.map((skill, index) => {
            const skillInfo = skills[skill.name];
            const iconPath = skillInfo
              ? getSkillIconPath(skillInfo.element)
              : `${iconBasePath}passive.png`;

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

                {skill.name} <span>Lv {skill.level}</span>
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
                    src={getSkillIconPath(selectedSkill.element)}
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

        {selectedPersona.locations.map((location, index) => (
          <div key={index} className="location-card">
            <p>Method: {location.method}</p>
            <p>Area: {location.area}</p>
            <p>Notes: {location.notes}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PersonaDetails;