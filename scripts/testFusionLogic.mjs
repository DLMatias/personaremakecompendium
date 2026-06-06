import fs from "fs";
import path from "path";

const personasPath = path.join("src", "data", "personas.json");
const fusionChartPath = path.join("src", "data", "fusionChart.json");
const rareFusionPath = path.join("src", "data", "rareFusion.json");

const personas = JSON.parse(fs.readFileSync(personasPath, "utf8"));
const fusionChart = JSON.parse(fs.readFileSync(fusionChartPath, "utf8"));
const rareFusion = JSON.parse(fs.readFileSync(rareFusionPath, "utf8"));

function getAvailablePersonas(options) {
  return personas
    .filter((persona) => options.includeDlc || !persona.isDlc)
    .sort((a, b) => a.level - b.level);
}

function getNormalPersonasByArcana(arcana, options) {
  return getAvailablePersonas(options)
    .filter((persona) => persona.arcana === arcana)
    .filter((persona) => !persona.specialFusion)
    .filter((persona) => !persona.rare)
    .sort((a, b) => a.level - b.level);
}

function getRareFusionResult(rarePersona, normalPersona, options) {
  const rarePersonaIndex = rareFusion.rarePersonas.indexOf(rarePersona.name);

  if (rarePersonaIndex === -1) {
    return null;
  }

  const modifier = rareFusion.modifiers[normalPersona.arcana]?.[rarePersonaIndex];

  if (modifier === undefined) {
    return null;
  }

  const arcanaPersonas = getNormalPersonasByArcana(normalPersona.arcana, options);

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

function getNormalFusionResult(personaA, personaB, options) {
  const resultArcana = fusionChart[personaA.arcana]?.[personaB.arcana];

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

function getFusionResult(personaA, personaB, options = { includeDlc: true }) {
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

function runTest(options) {
  let totalPairsChecked = 0;
  let pairsWithResult = 0;
  let pairsWithoutResult = 0;
  let rareFusionPairs = 0;
  let skippedSamePersona = 0;
  let skippedSpecialFusionInputs = 0;

  const resultCounts = {};

  const availablePersonas = personas.filter((persona) => {
    return options.includeDlc || !persona.isDlc;
  });

  for (let i = 0; i < availablePersonas.length; i++) {
    for (let j = i; j < availablePersonas.length; j++) {
      const personaA = availablePersonas[i];
      const personaB = availablePersonas[j];

      if (personaA.name === personaB.name) {
        skippedSamePersona++;
        continue;
      }

      if (personaA.specialFusion || personaB.specialFusion) {
        skippedSpecialFusionInputs++;
        continue;
      }

      totalPairsChecked++;

      if (personaA.rare || personaB.rare) {
        rareFusionPairs++;
      }

      const result = getFusionResult(personaA, personaB, options);

      if (!result) {
        pairsWithoutResult++;
        continue;
      }

      pairsWithResult++;

      if (!resultCounts[result.name]) {
        resultCounts[result.name] = 0;
      }

      resultCounts[result.name]++;
    }
  }

  const uniqueResults = Object.keys(resultCounts).length;

  const topResults = Object.entries(resultCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  console.log("");
  console.log(`Fusion Test Results: includeDlc = ${options.includeDlc}`);
  console.log("----------------------------------------");
  console.log(`Available Personas: ${availablePersonas.length}`);
  console.log(`Total pairs checked: ${totalPairsChecked}`);
  console.log(`Pairs with result: ${pairsWithResult}`);
  console.log(`Pairs without result: ${pairsWithoutResult}`);
  console.log(`Rare fusion pairs checked: ${rareFusionPairs}`);
  console.log(`Unique fusion results: ${uniqueResults}`);
  console.log(`Skipped same Persona pairs: ${skippedSamePersona}`);
  console.log(`Skipped special fusion inputs: ${skippedSpecialFusionInputs}`);

  console.log("");
  console.log("Most common results:");
  topResults.forEach(([personaName, count]) => {
    console.log(`${personaName}: ${count}`);
  });
}

runTest({ includeDlc: true });
runTest({ includeDlc: false });