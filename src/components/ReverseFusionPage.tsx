import { useState } from "react";
import personas from "../data/personas.json";
import specialFusions from "../data/specialFusions.json";
import { getFusionResult } from "../utils/fusionLogic";
import type { Persona } from "../types";

type OwnedPersonas = {
  [personaName: string]: boolean;
};

type ReverseFusionPageProps = {
  ownedPersonas: OwnedPersonas;
};

type FusionRecipe = {
  ingredientA: Persona;
  ingredientB: Persona;
};

type SpecialFusions = {
  [personaName: string]: string[];
};

const typedPersonas = personas as Persona[];
const typedSpecialFusions = specialFusions as SpecialFusions;

function ReverseFusionPage({ ownedPersonas }: ReverseFusionPageProps) {
  const [targetPersonaName, setTargetPersonaName] = useState(
    typedPersonas[0].name
  );
  const [targetSearchText, setTargetSearchText] = useState("");
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [includeDlc, setIncludeDlc] = useState(true);

  const selectableTargets = typedPersonas.filter((persona) => {
    return includeDlc || !persona.isDlc;
  });

  const targetSearchResults = selectableTargets.filter((persona) =>
    persona.name.toLowerCase().includes(targetSearchText.toLowerCase())
  );

  const targetPersona = typedPersonas.find(
    (persona) => persona.name === targetPersonaName
  );

  const specialFusionIngredients =
    typedSpecialFusions[targetPersonaName] ?? null;

  function selectTargetPersona(personaName: string) {
    setTargetPersonaName(personaName);
  }

  function getReverseFusionRecipes(targetName: string) {
    const recipes: FusionRecipe[] = [];

    const availablePersonas = typedPersonas.filter((persona) => {
      const matchesDlc = includeDlc || !persona.isDlc;
      return matchesDlc;
    });

    for (let i = 0; i < availablePersonas.length; i++) {
      for (let j = i + 1; j < availablePersonas.length; j++) {
        const personaA = availablePersonas[i];
        const personaB = availablePersonas[j];

        const result = getFusionResult(personaA, personaB, { includeDlc });

        if (result && result.name === targetName) {
          recipes.push({
            ingredientA: personaA,
            ingredientB: personaB,
          });
        }
      }
    }

    return recipes;
  }

  function handleIncludeDlcChange(checked: boolean) {
    setIncludeDlc(checked);

    if (!checked) {
      const currentTarget = typedPersonas.find(
        (persona) => persona.name === targetPersonaName
      );

      if (currentTarget?.isDlc) {
        const firstNonDlcPersona = typedPersonas.find(
          (persona) => !persona.isDlc
        );

        if (firstNonDlcPersona) {
          setTargetPersonaName(firstNonDlcPersona.name);
        }
      }
    }
  }

  const possibleRecipes = specialFusionIngredients
    ? []
    : getReverseFusionRecipes(targetPersonaName);

  const filteredRecipes = possibleRecipes.filter((recipe) => {
    const matchesOwned =
      !ownedOnly ||
      (ownedPersonas[recipe.ingredientA.name] &&
        ownedPersonas[recipe.ingredientB.name]);

    return matchesOwned;
  });

  const filteredSpecialFusionIngredients =
    specialFusionIngredients?.filter((ingredientName) => {
      return !ownedOnly || ownedPersonas[ingredientName];
    }) ?? [];

  return (
    <section className="tool-page">
      <div className="library-header">
        <div>
          <h2>Reverse Fusion</h2>
          <p>Select a target Persona to see possible recipes.</p>
        </div>
      </div>

      <div className="tool-options">
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={includeDlc}
            onChange={(event) => handleIncludeDlcChange(event.target.checked)}
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

      <div className="reverse-fusion-layout">
        <div className="selector-panel">
          <h3>Target Persona</h3>
          <p>Selected: {targetPersonaName}</p>

          <input
            className="form-control"
            type="text"
            placeholder="Search Target Persona..."
            value={targetSearchText}
            onChange={(event) => setTargetSearchText(event.target.value)}
          />

          <div className="scrollable-select-list">
            {targetSearchResults.map((persona) => (
              <button
                key={persona.name}
                type="button"
                onClick={() => selectTargetPersona(persona.name)}
                className={
                  targetPersonaName === persona.name
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

        <div className="result-panel">
          {targetPersona && (
            <>
              <h3>{targetPersona.name}</h3>

              <div className="info-grid">
                <p>Arcana: {targetPersona.arcana}</p>
                <p>Level: {targetPersona.level}</p>
                <p>Trait: {targetPersona.trait}</p>
                <p>DLC: {targetPersona.isDlc ? "Yes" : "No"}</p>
                <p>
                  Special Fusion:{" "}
                  {targetPersona.specialFusion ? "Yes" : "No"}
                </p>
                <p>Treasure Demon: {targetPersona.rare ? "Yes" : "No"}</p>
              </div>
            </>
          )}

          {specialFusionIngredients ? (
            <div className="details-section">
              <h3>Special Fusion Recipe</h3>

              {filteredSpecialFusionIngredients.length > 0 ? (
                <div className="recipe-list-scroll">
                  {filteredSpecialFusionIngredients.map((ingredientName) => (
                    <div key={ingredientName} className="recipe-card">
                      <p>{ingredientName}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No special fusion ingredients match the current filters.</p>
              )}
            </div>
          ) : (
            <div className="details-section">
              <h3>Possible Recipes</h3>
              <p>{filteredRecipes.length} recipes found</p>

              {filteredRecipes.length > 0 ? (
                <div className="recipe-list-scroll">
                  {filteredRecipes.map((recipe) => (
                    <div
                      key={`${recipe.ingredientA.name}-${recipe.ingredientB.name}`}
                      className="recipe-card"
                    >
                      <p>
                        {recipe.ingredientA.name}
                        {" + "}
                        {recipe.ingredientB.name}
                      </p>

                      <p>
                        Levels: {recipe.ingredientA.level} +{" "}
                        {recipe.ingredientB.level}
                      </p>

                      <p>
                        Arcana: {recipe.ingredientA.arcana} +{" "}
                        {recipe.ingredientB.arcana}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No recipes found with the current filters.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ReverseFusionPage;