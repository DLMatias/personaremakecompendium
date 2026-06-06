import fs from "fs";
import path from "path";
import vm from "vm";

const sourceUrl =
  "https://raw.githubusercontent.com/chinhodado/persona5_calculator/master/data/Data5Royal.js";

const outputPath = path.join("src", "data", "fusionChart.json");
const backupPath = path.join("src", "data", "fusionChart.backup.json");

async function main() {
  console.log("Downloading Persona 5 Royal fusion chart data...");

  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(`Failed to download source data: ${response.status}`);
  }

  const sourceCode = await response.text();

  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(sourceCode, sandbox);

  const arcanaCombos = sandbox.arcana2CombosRoyal;

  if (!arcanaCombos) {
    throw new Error("Could not find arcana2CombosRoyal in source data.");
  }

  if (fs.existsSync(outputPath)) {
    fs.copyFileSync(outputPath, backupPath);
    console.log(`Backup created at ${backupPath}`);
  }

  const fusionChart = {};

  arcanaCombos.forEach((combo) => {
    const arcanaA = combo.source[0];
    const arcanaB = combo.source[1];
    const resultArcana = combo.result;

    if (!fusionChart[arcanaA]) {
      fusionChart[arcanaA] = {};
    }

    if (!fusionChart[arcanaB]) {
      fusionChart[arcanaB] = {};
    }

    fusionChart[arcanaA][arcanaB] = resultArcana;
    fusionChart[arcanaB][arcanaA] = resultArcana;
  });

  const sortedFusionChart = Object.keys(fusionChart)
    .sort()
    .reduce((result, arcana) => {
      result[arcana] = Object.keys(fusionChart[arcana])
        .sort()
        .reduce((innerResult, innerArcana) => {
          innerResult[innerArcana] = fusionChart[arcana][innerArcana];
          return innerResult;
        }, {});

      return result;
    }, {});

  fs.writeFileSync(outputPath, JSON.stringify(sortedFusionChart, null, 2), {
    encoding: "utf8",
  });

  JSON.parse(fs.readFileSync(outputPath, "utf8"));

  console.log(`Generated ${outputPath}`);
  console.log(`Arcana count: ${Object.keys(sortedFusionChart).length}`);
  console.log(`Combo count: ${arcanaCombos.length}`);
  console.log("JSON validation passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});