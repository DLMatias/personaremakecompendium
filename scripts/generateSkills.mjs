import fs from "fs";
import path from "path";
import vm from "vm";

const sourceUrl =
  "https://raw.githubusercontent.com/chinhodado/persona5_calculator/master/data/SkillDataRoyal.js";

const outputPath = path.join("src", "data", "skills.json");
const backupPath = path.join("src", "data", "skills.backup.json");

function formatCost(cost) {
  if (cost === undefined || cost === null) {
    return "Passive";
  }

  if (cost >= 100) {
    return `${cost / 100} SP`;
  }

  return `${cost}% HP`;
}

function formatElement(element) {
  const elementMap = {
    phys: "Physical",
    gun: "Gun",
    fire: "Fire",
    ice: "Ice",
    elec: "Electric",
    wind: "Wind",
    psy: "Psy",
    nuke: "Nuclear",
    bless: "Bless",
    curse: "Curse",
    almighty: "Almighty",
    ailment: "Ailment",
    healing: "Healing",
    support: "Support",
    passive: "Passive",
    trait: "Trait",
    nav: "Navigation",
  };

  return elementMap[element] ?? element ?? "Unknown";
}

async function main() {
  console.log("Downloading Persona 5 Royal skill data...");

  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(`Failed to download source data: ${response.status}`);
  }

  const sourceCode = await response.text();

  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(sourceCode, sandbox);

  const skillMapRoyal = sandbox.skillMapRoyal;

  if (!skillMapRoyal) {
    throw new Error("Could not find skillMapRoyal in source data.");
  }

  if (fs.existsSync(outputPath)) {
    fs.copyFileSync(outputPath, backupPath);
    console.log(`Backup created at ${backupPath}`);
  }

  const skills = Object.entries(skillMapRoyal)
    .sort(([skillNameA], [skillNameB]) => skillNameA.localeCompare(skillNameB))
    .reduce((result, [skillName, skillData]) => {
      result[skillName] = {
        element: formatElement(skillData.element),
        cost: formatCost(skillData.cost),
        description: skillData.effect ?? "No description available.",
        uniqueTo: skillData.unique ?? null,
        skillCard: skillData.card ?? null,
        talk: skillData.talk ?? null,
        fuseFrom: skillData.fuse ?? [],
        learnedBy: skillData.personas ?? {},
      };

      return result;
    }, {});

  fs.writeFileSync(outputPath, JSON.stringify(skills, null, 2), {
    encoding: "utf8",
  });

  JSON.parse(fs.readFileSync(outputPath, "utf8"));

  console.log(`Generated ${outputPath}`);
  console.log(`Skill count: ${Object.keys(skills).length}`);
  console.log("JSON validation passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});