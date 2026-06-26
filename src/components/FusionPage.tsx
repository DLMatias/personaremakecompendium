import { useState } from "react";
import { PersonaNameButton } from "./PersonaPopup";
import { getFusionResult } from "../utils/fusionLogic";
import type { GameData, Persona } from "../types";

type OwnedPersonas = {
  [personaName: string]: boolean;
};

type FusionPageProps = {
  gameData: GameData;
  ownedPersonas: OwnedPersonas;
  toggleOwned: (personaName: string) => void;
};

type ComponentFusionRecipe =
  | {
      type: "normal";
      result: Persona;
      partner: Persona;
    }
  | {
      type: "special";
      result: Persona;
      otherIngredients: Persona[];
    };

function sortPersonaByLevelThenName(personaA: Persona, personaB: Persona) {
  return personaA.level - personaB.level || personaA.name.localeCompare(personaB.name);
}

function sortRecipes(recipeA: ComponentFusionRecipe, recipeB: ComponentFusionRecipe) {
  return (
    recipeA.result.level - recipeB.result.level ||
    recipeA.result.name.localeCompare(recipeB.result.name) ||
    recipeA.type.localeCompare(recipeB.type)
  );
}

function FusionPage({ gameData, ownedPersonas, toggleOwned }: FusionPageProps) {
  const typedPersonas = gameData.personas;
  const [componentPersonaName, setComponentPersonaName] = useState(
    typedPersonas[0].name
  );
  const [componentSearchText, setComponentSearchText] = useState("");
  const [includeDlc, setIncludeDlc] = useState(true);
  const [ownedOnly, setOwnedOnly] = useState(false);
  const showTreasureDemon = gameData.rareFusion.rarePersonas.length > 0;

  const selectablePersonas = typedPersonas
    .filter((persona) => includeDlc || !persona.isDlc)
    .filter((persona) => !ownedOnly || ownedPersonas[persona.name])
    .sort(sortPersonaByLevelThenName);

  const componentPersona =
    selectablePersonas.find((persona) => persona.name === componentPersonaName) ??
    selectablePersonas[0] ??
    null;

  const componentSearchResults = selectablePersonas.filter((persona) =>
    persona.name.toLowerCase().includes(componentSearchText.toLowerCase())
  );

  function selectComponentPersona(personaName: string) {
    setComponentPersonaName(personaName);
  }

  function getComponentFusionRecipes(component: Persona) {
    const normalRecipes: ComponentFusionRecipe[] = typedPersonas
      .filter((persona) => persona.name !== component.name)
      .filter((persona) => includeDlc || !persona.isDlc)
      .filter((persona) => !ownedOnly || ownedPersonas[persona.name])
      .sort(sortPersonaByLevelThenName)
      .reduce<ComponentFusionRecipe[]>((recipes, partner) => {
        const result = getFusionResult(
          component,
          partner,
          { includeDlc },
          gameData
        );

        if (!result || gameData.specialFusions[result.name]) {
          return recipes;
        }

        recipes.push({
          type: "normal",
          result,
          partner,
        });

        return recipes;
      }, []);

    const specialRecipes: ComponentFusionRecipe[] = Object.entries(
      gameData.specialFusions
    ).reduce<ComponentFusionRecipe[]>((recipes, [resultName, ingredientNames]) => {
      if (!ingredientNames.includes(component.name)) {
        return recipes;
      }

      const result = typedPersonas.find((persona) => persona.name === resultName);
      const ingredients = ingredientNames
        .map((ingredientName) =>
          typedPersonas.find((persona) => persona.name === ingredientName)
        )
        .filter((persona): persona is Persona => Boolean(persona));

      if (!result || ingredients.length !== ingredientNames.length) {
        return recipes;
      }

      const hasDlcPersona =
        result.isDlc || ingredients.some((ingredient) => ingredient.isDlc);

      if (!includeDlc && hasDlcPersona) {
        return recipes;
      }

      const ownsAllIngredients = ingredients.every(
        (ingredient) => ownedPersonas[ingredient.name]
      );

      if (ownedOnly && !ownsAllIngredients) {
        return recipes;
      }

      recipes.push({
        type: "special",
        result,
        otherIngredients: ingredients
          .filter((ingredient) => ingredient.name !== component.name)
          .sort(sortPersonaByLevelThenName),
      });

      return recipes;
    }, []);

    return [...normalRecipes, ...specialRecipes].sort(sortRecipes);
  }

  const fusionRecipes = componentPersona
    ? getComponentFusionRecipes(componentPersona)
    : [];

  return (
    <section className="tool-page">
      <div className="library-header">
        <div>
          <h2>Fusion Explorer</h2>
          <p>
            Select one Persona to see every fusion result it can help create.
          </p>
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

      <div className="reverse-fusion-layout">
        <div className="selector-panel">
          <h3>Component Persona</h3>

          {componentPersona ? (
            <p>
              Selected:{" "}
              <PersonaNameButton
                personaName={componentPersona.name}
                persona={componentPersona}
                gameData={gameData}
                ownedPersonas={ownedPersonas}
                toggleOwned={toggleOwned}
              />
            </p>
          ) : (
            <p>No Personas match the current filters.</p>
          )}

          <input
            className="form-control"
            type="text"
            placeholder="Search component Persona..."
            value={componentSearchText}
            onChange={(event) => setComponentSearchText(event.target.value)}
          />

          <div className="scrollable-select-list">
            {componentSearchResults.map((persona) => (
              <button
                key={persona.name}
                type="button"
                onClick={() => selectComponentPersona(persona.name)}
                className={
                  componentPersona?.name === persona.name
                    ? "scrollable-select-item selected"
                    : "scrollable-select-item"
                }
              >
                <span>
                  {ownedPersonas[persona.name] ? "Owned: " : ""}
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
          {componentPersona && (
            <>
              <h3>
                <PersonaNameButton
                  personaName={componentPersona.name}
                  persona={componentPersona}
                  gameData={gameData}
                  ownedPersonas={ownedPersonas}
                  toggleOwned={toggleOwned}
                />
              </h3>

              <div className="info-grid">
                <p>Arcana: {componentPersona.arcana}</p>
                <p>Level: {componentPersona.level}</p>
                {componentPersona.trait && <p>Trait: {componentPersona.trait}</p>}
                <p>DLC: {componentPersona.isDlc ? "Yes" : "No"}</p>
                <p>
                  Special Fusion:{" "}
                  {componentPersona.specialFusion ? "Yes" : "No"}
                </p>
                {showTreasureDemon && (
                  <p>Treasure Demon: {componentPersona.rare ? "Yes" : "No"}</p>
                )}
              </div>
            </>
          )}

          <div className="details-section">
            <h3>Fusion Results</h3>

            <p>{fusionRecipes.length} results found</p>

            {fusionRecipes.length > 0 ? (
              <div className="recipe-list-scroll">
                {fusionRecipes.map((recipe) => (
                  <div
                    key={
                      recipe.type === "normal"
                        ? `${recipe.result.name}-${recipe.partner.name}`
                        : `${recipe.result.name}-special`
                    }
                    className="recipe-card"
                  >
                    <h4>
                      <PersonaNameButton
                        personaName={recipe.result.name}
                        persona={recipe.result}
                        gameData={gameData}
                        ownedPersonas={ownedPersonas}
                        toggleOwned={toggleOwned}
                      />
                    </h4>

                    <p>
                      Result: Lv {recipe.result.level} ; {recipe.result.arcana}
                      {recipe.result.isDlc ? " ; DLC" : ""}
                    </p>

                    {recipe.type === "normal" ? (
                      <>
                        <p>
                          With:{" "}
                          <PersonaNameButton
                            personaName={recipe.partner.name}
                            persona={recipe.partner}
                            gameData={gameData}
                            ownedPersonas={ownedPersonas}
                            toggleOwned={toggleOwned}
                          />
                        </p>

                        <p>
                          Partner: Lv {recipe.partner.level} ;{" "}
                          {recipe.partner.arcana}
                          {recipe.partner.isDlc ? " ; DLC" : ""}
                        </p>
                      </>
                    ) : (
                      <>
                        <p>Special Fusion</p>
                        <p>
                          Other components:{" "}
                          {recipe.otherIngredients.map((ingredient, index) => (
                            <span key={ingredient.name}>
                              {index > 0 ? " + " : ""}
                              <PersonaNameButton
                                personaName={ingredient.name}
                                persona={ingredient}
                                gameData={gameData}
                                ownedPersonas={ownedPersonas}
                                toggleOwned={toggleOwned}
                              />
                            </span>
                          ))}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No fusion results found with the current filters.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FusionPage;
