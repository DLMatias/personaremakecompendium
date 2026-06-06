import personas from "../data/personas.json";
import fusionChart from "../data/fusionChart.json";
import rareFusion from "../data/rareFusion.json";
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

type FusionOptions = {
  includeDlc: boolean;
};

const typedFusionChart = fusionChart as FusionChart;
const typedRareFusion = rareFusion as RareFusionData;
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