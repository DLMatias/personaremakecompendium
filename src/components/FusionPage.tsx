import { useState } from "react";
import personas from "../data/personas.json";
import { getFusionResult } from "../utils/fusionLogic";
import type { Persona } from "../types";

type OwnedPersonas = {
  [personaName: string]: boolean;
};

type FusionPageProps = {
  ownedPersonas: OwnedPersonas;
};

const typedPersonas = personas as Persona[];

function FusionPage({ ownedPersonas }: FusionPageProps) {
  const [personaAName, setPersonaAName] = useState(typedPersonas[0].name);
  const [personaBName, setPersonaBName] = useState(typedPersonas[1].name);
  const [personaASearchText, setPersonaASearchText] = useState("");
  const [personaBSearchText, setPersonaBSearchText] = useState("");
  const [fusionResult, setFusionResult] = useState<Persona | null>(null);
  const [includeDlc, setIncludeDlc] = useState(true);
  const [ownedOnly, setOwnedOnly] = useState(false);

  const selectablePersonas = typedPersonas.filter((persona) => {
    const matchesDlc = includeDlc || !persona.isDlc;
    const matchesOwned = !ownedOnly || ownedPersonas[persona.name];

    return matchesDlc && matchesOwned;
  });

  const personaA = typedPersonas.find(
    (persona) => persona.name === personaAName
  );

  const personaB = typedPersonas.find(
    (persona) => persona.name === personaBName
  );

  const personaAResults = selectablePersonas
    .filter((persona) => persona.name !== personaBName)
    .filter((persona) =>
      persona.name.toLowerCase().includes(personaASearchText.toLowerCase())
    );

  const personaBResults = selectablePersonas
    .filter((persona) => persona.name !== personaAName)
    .filter((persona) =>
      persona.name.toLowerCase().includes(personaBSearchText.toLowerCase())
    );

  function selectPersonaA(personaName: string) {
    setPersonaAName(personaName);
  }

  function selectPersonaB(personaName: string) {
    setPersonaBName(personaName);
  }

  function calculateFusion() {
    if (!personaA || !personaB) {
      setFusionResult(null);
      return;
    }

    if (
      ownedOnly &&
      (!ownedPersonas[personaA.name] || !ownedPersonas[personaB.name])
    ) {
      setFusionResult(null);
      return;
    }

    if (!includeDlc && (personaA.isDlc || personaB.isDlc)) {
      setFusionResult(null);
      return;
    }

    const result = getFusionResult(personaA, personaB, {
      includeDlc,
    });

    setFusionResult(result);
  }

  return (
    <section className="tool-page">
      <div className="library-header">
        <div>
          <h2>Fusion Calculator</h2>
          <p>Select two Personas to calculate their fusion result.</p>
        </div>
      </div>

      <div className="tool-options">
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={includeDlc}
            onChange={(event) => setIncludeDlc(event.target.checked)}
          />
          Include DLC Personas
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={ownedOnly}
            onChange={(event) => setOwnedOnly(event.target.checked)}
          />
          Owned Personas Only
        </label>
      </div>

      <div className="fusion-selector-grid">
        <div className="selector-panel">
          <h3>Persona A</h3>
          <p>Selected: {personaAName}</p>

          <input
            className="form-control"
            type="text"
            placeholder="Search Persona A..."
            value={personaASearchText}
            onChange={(event) => setPersonaASearchText(event.target.value)}
          />

          <div className="scrollable-select-list">
            {personaAResults.map((persona) => (
              <button
                key={persona.name}
                type="button"
                onClick={() => selectPersonaA(persona.name)}
                className={
                  personaAName === persona.name
                    ? "scrollable-select-item selected"
                    : "scrollable-select-item"
                }
              >
                <span>
                  {ownedPersonas[persona.name] ? "✓ " : ""}
                  {persona.name}
                </span>

                <span className="select-item-meta">
                  Lv {persona.level} ; {persona.arcana}
                  {persona.isDlc ? " ; DLC" : ""}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="selector-panel">
          <h3>Persona B</h3>
          <p>Selected: {personaBName}</p>

          <input
            className="form-control"
            type="text"
            placeholder="Search Persona B..."
            value={personaBSearchText}
            onChange={(event) => setPersonaBSearchText(event.target.value)}
          />

          <div className="scrollable-select-list">
            {personaBResults.map((persona) => (
              <button
                key={persona.name}
                type="button"
                onClick={() => selectPersonaB(persona.name)}
                className={
                  personaBName === persona.name
                    ? "scrollable-select-item selected"
                    : "scrollable-select-item"
                }
              >
                <span>
                  {ownedPersonas[persona.name] ? "✓ " : ""}
                  {persona.name}
                </span>

                <span className="select-item-meta">
                  Lv {persona.level} ; {persona.arcana}
                  {persona.isDlc ? " ; DLC" : ""}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button type="button" onClick={calculateFusion} className="primary-action">
        Calculate Fusion
      </button>

      <div className="result-panel">
        <h3>Result</h3>

        {fusionResult ? (
          <>
            <h2>{fusionResult.name}</h2>

            <div className="info-grid">
              <p>Arcana: {fusionResult.arcana}</p>
              <p>Level: {fusionResult.level}</p>
              <p>Trait: {fusionResult.trait}</p>
              <p>DLC: {fusionResult.isDlc ? "Yes" : "No"}</p>
              <p>Special Fusion: {fusionResult.specialFusion ? "Yes" : "No"}</p>
              <p>Treasure Demon: {fusionResult.rare ? "Yes" : "No"}</p>
              <p>Inheritance Type: {fusionResult.inherits}</p>
            </div>

          </>
        ) : (
          <p>No calculation performed yet, or no fusion result was found.</p>
        )}
      </div>
    </section>
  );
}

export default FusionPage;