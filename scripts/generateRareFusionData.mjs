import fs from "fs";
import path from "path";
import vm from "vm";

const sourceUrl =
  "https://raw.githubusercontent.com/chinhodado/persona5_calculator/master/data/Data5Royal.js";

const outputPath = path.join("src", "data", "rareFusion.json");
const backupPath = path.join("src", "data", "rareFusion.backup.json");

async function main() {
  console.log("Downloading Persona 5 Royal rare fusion data...");

  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(`Failed to download source data: ${response.status}`);
  }

  const sourceCode = await response.text();

  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(sourceCode, sandbox);

  const rarePersonas = sandbox.rarePersonaeRoyal;
  const modifiers = sandbox.rareCombosRoyal;

  if (!rarePersonas || !modifiers) {
    throw new Error("Could not find rare fusion data.");
  }

  if (fs.existsSync(outputPath)) {
    fs.copyFileSync(outputPath, backupPath);
    console.log(`Backup created at ${backupPath}`);
  }

  const rareFusionData = {
    rarePersonas,
    modifiers,
  };

  fs.writeFileSync(outputPath, JSON.stringify(rareFusionData, null, 2), {
    encoding: "utf8",
  });

  JSON.parse(fs.readFileSync(outputPath, "utf8"));

  console.log(`Generated ${outputPath}`);
  console.log(`Rare Persona count: ${rarePersonas.length}`);
  console.log("JSON validation passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});