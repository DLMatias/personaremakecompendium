import { useState } from "react";
import type { Persona } from "../types";
import arcanasData from "../data/arcanas.json";

const arcanas = arcanasData as string[];

type PersonaListProps = {
  personas: Persona[];
  selectedPersona: Persona;
  ownedPersonas: {
    [personaName: string]: boolean;
  };
  searchText: string;
  setSearchText: (value: string) => void;
  setSelectedPersona: (persona: Persona) => void;
};

function PersonaList({
  personas,
  selectedPersona,
  ownedPersonas,
  searchText,
  setSearchText,
  setSelectedPersona,
}: PersonaListProps) {
  const [selectedArcana, setSelectedArcana] = useState("All");
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [includeDlc, setIncludeDlc] = useState(true);
  const [skillSearchText, setSkillSearchText] = useState("");

  const arcanaOptions = ["All", ...arcanas];

  const filteredPersonas = personas.filter((persona) => {
    const matchesSearch = persona.name
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const matchesArcana =
      selectedArcana === "All" || persona.arcana === selectedArcana;

    const matchesOwned = !ownedOnly || ownedPersonas[persona.name];

    const matchesDlc = includeDlc || !persona.isDlc;

    const matchesSkill =
      skillSearchText.trim() === "" ||
      persona.skills.some((skill) =>
        skill.name.toLowerCase().includes(skillSearchText.toLowerCase())
      );

    return (
      matchesSearch &&
      matchesArcana &&
      matchesOwned &&
      matchesDlc &&
      matchesSkill
    );
  });

  return (
    <aside className="persona-list-panel">
      <h2>Persona List</h2>

      <input
        className="form-control"
        type="text"
        placeholder="Search Persona..."
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
      />

      <select
        className="form-control"
        value={selectedArcana}
        onChange={(event) => setSelectedArcana(event.target.value)}
      >
        {arcanaOptions.map((arcana) => (
          <option key={arcana} value={arcana}>
            {arcana}
          </option>
        ))}
      </select>

      <input
        className="form-control"
        type="text"
        placeholder="Filter by Skill..."
        value={skillSearchText}
        onChange={(event) => setSkillSearchText(event.target.value)}
      />

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={ownedOnly}
          onChange={(event) => setOwnedOnly(event.target.checked)}
        />
        Owned Only
      </label>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={includeDlc}
          onChange={(event) => setIncludeDlc(event.target.checked)}
        />
        Include DLC
      </label>

      <div className="persona-list-results">
        {filteredPersonas.map((persona) => (
          <button
            key={persona.name}
            onClick={() => setSelectedPersona(persona)}
            className={
              selectedPersona.name === persona.name
                ? "persona-list-item selected"
                : "persona-list-item"
            }
          >
            <span>
              {ownedPersonas[persona.name] ? "✓ " : ""}
              {persona.name}
            </span>

            {persona.isDlc && <span className="pill">DLC</span>}
          </button>
        ))}
      </div>
    </aside>
  );
}

export default PersonaList;