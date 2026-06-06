import fs from "fs";
import path from "path";

const personasPath = path.join("src", "data", "personas.json");
const traitsPath = path.join("src", "data", "traits.json");
const backupPath = path.join("src", "data", "traits.backup.json");

function main() {
  if (!fs.existsSync(personasPath)) {
    throw new Error("Could not find src/data/personas.json");
  }

  if (fs.existsSync(traitsPath)) {
    fs.copyFileSync(traitsPath, backupPath);
    console.log(`Backup created at ${backupPath}`);
  }

  const personas = JSON.parse(fs.readFileSync(personasPath, "utf8"));

  const traits = {};

  personas.forEach((persona) => {
    if (!persona.trait || persona.trait === "Unknown") {
      return;
    }

    if (!traits[persona.trait]) {
      traits[persona.trait] = {
        description: "Description not added yet.",
      };
    }
  });

  const sortedTraits = Object.keys(traits)
    .sort()
    .reduce((result, traitName) => {
      result[traitName] = traits[traitName];
      return result;
    }, {});

  fs.writeFileSync(traitsPath, JSON.stringify(sortedTraits, null, 2), {
    encoding: "utf8",
  });

  JSON.parse(fs.readFileSync(traitsPath, "utf8"));

  console.log(`Generated ${traitsPath}`);
  console.log(`Trait count: ${Object.keys(sortedTraits).length}`);
  console.log("JSON validation passed.");
}

main();