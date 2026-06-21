import personas from "../data/personas.json";
import fusionChart from "../data/fusionChart.json";
import rareFusion from "../data/rareFusion.json";
import specialFusions from "../data/specialFusions.json";
import type { Persona } from "../types";

type FusionChart = {
  [arcanaA: string]: {
    [arcanaB: string]: string;
  };
};

type RareFusionData = {
  rarePersonas: string[];
  modifiers: {
    [arcana: string]: number[];
  };
};

type SpecialFusions = {
  [personaName: string]: string[];
};

type FusionOptions = {
  includeDlc: boolean;
};

const typedFusionChart = fusionChart as FusionChart;
const typedRareFusion = rareFusion as RareFusionData;
const typedSpecialFusions = specialFusions as SpecialFusions;
const typedPersonas = personas as Persona[];

function getAvailablePersonas(options: FusionOptions) {
  return typedPersonas
    .filter((persona) => options.includeDlc || !persona.isDlc)
    .sort((a, b) => a.level - b.level);
}

function getNormalPersonasByArcana(arcana: string, options: FusionOptions) {
  return getAvailablePersonas(options)
    .filter((persona) => persona.arcana === arcana)
    .filter((persona) => !persona.specialFusion)
    .filter((persona) => !persona.rare)
    .sort((a, b) => a.level - b.level);
}

function getSpecialFusionResult(
  personaA: Persona,
  personaB: Persona,
  options: FusionOptions
) {
  const selectedIngredients = [personaA.name, personaB.name].sort();

  for (const [resultName, ingredientNames] of Object.entries(
    typedSpecialFusions
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

    const resultPersona = typedPersonas.find(
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
  rarePersona: Persona,
  normalPersona: Persona,
  options: FusionOptions
) {
  const rarePersonaIndex = typedRareFusion.rarePersonas.indexOf(
    rarePersona.name
  );

  if (rarePersonaIndex === -1) {
    return null;
  }

  const modifier =
    typedRareFusion.modifiers[normalPersona.arcana]?.[rarePersonaIndex];

  if (modifier === undefined) {
    return null;
  }

  const arcanaPersonas = getNormalPersonasByArcana(
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
  personaA: Persona,
  personaB: Persona,
  options: FusionOptions
) {
  const resultArcana = typedFusionChart[personaA.arcana]?.[personaB.arcana];

  if (!resultArcana) {
    return null;
  }

  const targetLevel = Math.floor((personaA.level + personaB.level) / 2) + 1;

  const possibleResults = getAvailablePersonas(options)
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
  options: FusionOptions = { includeDlc: true }
) {
  if (personaA.name === personaB.name) {
    return null;
  }

  const specialFusionResult = getSpecialFusionResult(
    personaA,
    personaB,
    options
  );

  if (specialFusionResult) {
    return specialFusionResult;
  }

  if (personaA.rare && personaB.rare) {
    return getNormalFusionResult(personaA, personaB, options);
  }

  if (personaA.rare && !personaB.rare) {
    return getRareFusionResult(personaA, personaB, options);
  }

  if (!personaA.rare && personaB.rare) {
    return getRareFusionResult(personaB, personaA, options);
  }

  return getNormalFusionResult(personaA, personaB, options);
}