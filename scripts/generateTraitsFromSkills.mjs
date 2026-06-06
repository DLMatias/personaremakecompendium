import fs from "fs";
import path from "path";

const skillsPath = path.join("src", "data", "skills.json");
const traitsPath = path.join("src", "data", "traits.json");
const backupPath = path.join("src", "data", "traits.backup.json");

function main() {
  const skills = JSON.parse(fs.readFileSync(skillsPath, "utf8"));

  if (fs.existsSync(traitsPath)) {
    fs.copyFileSync(traitsPath, backupPath);
    console.log(`Backup created at ${backupPath}`);
  }

  const traits = {};

  Object.entries(skills).forEach(([skillName, skillData]) => {
    if (skillData.element === "Trait") {
      traits[skillName] = {
        description: skillData.description,
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