import { defaultGame } from "../data/games";
import type { GameData, Persona } from "../types";

type FusionOptions = {
  includeDlc: boolean;
};

function getAvailablePersonas(gameData: GameData, options: FusionOptions) {
  return gameData.personas
    .filter((persona) => options.includeDlc || !persona.isDlc)
    .sort((a, b) => a.level - b.level);
}

function getNormalPersonasByArcana(
  gameData: GameData,
  arcana: string,
  options: FusionOptions
) {
  return getAvailablePersonas(gameData, options)
    .filter((persona) => persona.arcana === arcana)
    .filter((persona) => !persona.specialFusion)
    .filter((persona) => !persona.rare)
    .sort((a, b) => a.level - b.level);
}

function getSpecialFusionResult(
  gameData: GameData,
  personaA: Persona,
  personaB: Persona,
  options: FusionOptions
) {
  const selectedIngredients = [personaA.name, personaB.name].sort();

  for (const [resultName, ingredientNames] of Object.entries(
    gameData.specialFusions
  )) {
    if (ingredientNames.length !== 2) {
      continue;
    }

    const sortedIngredientNames = [...ingredientNames].sort();

    const matchesSpecialRecipe =
      selectedIngredients[0] === sortedIngredientNames[0] &&
      selectedIngredients[1] === sortedIngredientNames[1];

    if (!matchesSpecialRecipe) {
      continue;
    }

    const resultPersona = gameData.personas.find(
      (persona) => persona.name === resultName
    );

    if (!resultPersona) {
      return null;
    }

    if (!options.includeDlc && resultPersona.isDlc) {
      return null;
    }

    return resultPersona;
  }

  return null;
}

function getRareFusionResult(
  gameData: GameData,
  rarePersona: Persona,
  normalPersona: Persona,
  options: FusionOptions
) {
  const rarePersonaIndex = gameData.rareFusion.rarePersonas.indexOf(
    rarePersona.name
  );

  if (rarePersonaIndex === -1) {
    return null;
  }

  const modifier =
    gameData.rareFusion.modifiers[normalPersona.arcana]?.[rarePersonaIndex];

  if (modifier === undefined) {
    return null;
  }

  const arcanaPersonas = getNormalPersonasByArcana(
    gameData,
    normalPersona.arcana,
    options
  );

  const normalPersonaIndex = arcanaPersonas.findIndex(
    (persona) => persona.name === normalPersona.name
  );

  if (normalPersonaIndex === -1) {
    return null;
  }

  let resultIndex = normalPersonaIndex + modifier;

  while (resultIndex >= 0 && resultIndex < arcanaPersonas.length) {
    const resultPersona = arcanaPersonas[resultIndex];

    if (
      resultPersona.name !== rarePersona.name &&
      resultPersona.name !== normalPersona.name
    ) {
      return resultPersona;
    }

    resultIndex += modifier > 0 ? 1 : -1;
  }

  return null;
}

function getNormalFusionResult(
  gameData: GameData,
  personaA: Persona,
  personaB: Persona,
  options: FusionOptions
) {
  const resultArcana = gameData.fusionChart[personaA.arcana]?.[personaB.arcana];

  if (!resultArcana) {
    return null;
  }

  const targetLevel = Math.floor((personaA.level + personaB.level) / 2) + 1;

  const possibleResults = getAvailablePersonas(gameData, options)
    .filter((persona) => persona.arcana === resultArcana)
    .filter((persona) => !persona.specialFusion)
    .filter((persona) => !persona.rare)
    .filter(
      (persona) =>
        persona.name !== personaA.name && persona.name !== personaB.name
    )
    .sort((a, b) => a.level - b.level);

  if (personaA.arcana === personaB.arcana) {
    const downRankResults = possibleResults
      .filter((persona) => persona.level <= targetLevel)
      .sort((a, b) => b.level - a.level);

    return downRankResults[0] ?? null;
  }

  const upRankResults = possibleResults
    .filter((persona) => persona.level >= targetLevel)
    .sort((a, b) => a.level - b.level);

  return upRankResults[0] ?? null;
}

export function getFusionResult(
  personaA: Persona,
  personaB: Persona,
  options: FusionOptions = { includeDlc: true },
  gameData: GameData = defaultGame
) {
  if (personaA.name === personaB.name) {
    return null;
  }

  const specialFusionResult = getSpecialFusionResult(
    gameData,
    personaA,
    personaB,
    options
  );

  if (specialFusionResult) {
    return specialFusionResult;
  }

  if (personaA.rare && personaB.rare) {
    return getNormalFusionResult(gameData, personaA, personaB, options);
  }

  if (personaA.rare && !personaB.rare) {
    return getRareFusionResult(gameData, personaA, personaB, options);
  }

  if (!personaA.rare && personaB.rare) {
    return getRareFusionResult(gameData, personaB, personaA, options);
  }

  return getNormalFusionResult(gameData, personaA, personaB, options);
}
