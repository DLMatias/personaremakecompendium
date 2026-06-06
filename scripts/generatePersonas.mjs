import fs from "fs";
import path from "path";
import vm from "vm";

const sourceUrl =
  "https://raw.githubusercontent.com/chinhodado/persona5_calculator/master/data/PersonaDataRoyal.js";

const outputPath = path.join("src", "data", "personas.json");
const backupPath = path.join("src", "data", "personas.backup.json");

const arcanaOrder = [
  "Fool",
  "Magician",
  "Priestess",
  "Empress",
  "Emperor",
  "Hierophant",
  "Lovers",
  "Chariot",
  "Justice",
  "Hermit",
  "Fortune",
  "Strength",
  "Hanged",
  "Death",
  "Temperance",
  "Devil",
  "Tower",
  "Star",
  "Moon",
  "Sun",
  "Judgement",
  "Faith",
  "Councillor",
  "World",
];

const affinityMap = {
  "-": "-",
  wk: "Weak",
  rs: "Resist",
  nu: "Null",
  rp: "Repel",
  ab: "Drain",
};

const affinityNames = [
  "physical",
  "gun",
  "fire",
  "ice",
  "electric",
  "wind",
  "psy",
  "nuclear",
  "bless",
  "curse",
];

function normalizeName(name) {
  if (name === "Arsène") {
    return "Arsene";
  }

  return name;
}

function getDlcPack(name) {
  if (
    name.includes("Orpheus") ||
    name.includes("Thanatos") ||
    name.includes("Messiah")
  ) {
    return "Persona 3";
  }

  if (
    name.includes("Izanagi") ||
    name.includes("Kaguya") ||
    name.includes("Magatsu-Izanagi")
  ) {
    return "Persona 4";
  }

  if (
    name.includes("Ariadne") ||
    name.includes("Asterius") ||
    name.includes("Athena") ||
    name.includes("Tsukiyomi")
  ) {
    return "Persona 4 Arena";
  }

  if (name.includes("Raoul") || name.includes("Izanagi-no-Okami")) {
    return "Persona 5 Royal";
  }

  return "DLC";
}

function convertAffinities(elems) {
  const affinities = {};

  affinityNames.forEach((name, index) => {
    affinities[name] = affinityMap[elems[index]] ?? elems[index] ?? "-";
  });

  return affinities;
}

function convertSkills(skills, personaLevel) {
  return Object.entries(skills ?? {}).map(([skillName, learnedLevel]) => ({
    name: skillName,
    level: learnedLevel === 0 ? personaLevel : learnedLevel,
  }));
}

function convertLocations(personaData) {
  if (personaData.area || personaData.floor) {
    return [
      {
        method: personaData.rare ? "Treasure Demon" : "Negotiation",
        area: personaData.area ?? "Unknown",
        notes: personaData.floor ? `Floor ${personaData.floor}` : "",
      },
    ];
  }

  if (personaData.dlc) {
    return [
      {
        method: "DLC Compendium",
        area: "Velvet Room",
        notes: "DLC Persona",
      },
    ];
  }

  if (personaData.special) {
    return [
      {
        method: "Special Fusion",
        area: "Velvet Room",
        notes: personaData.note ?? "Special fusion Persona",
      },
    ];
  }

  if (personaData.note) {
    return [
      {
        method: "Fusion",
        area: "Velvet Room",
        notes: personaData.note,
      },
    ];
  }

  return [
    {
      method: "Fusion",
      area: "Velvet Room",
      notes: "Fusion-only Persona or location not listed in source data",
    },
  ];
}

async function main() {
  console.log("Downloading Persona 5 Royal data...");

  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(`Failed to download source data: ${response.status}`);
  }

  const sourceCode = await response.text();

  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(sourceCode, sandbox);

  const personaMapRoyal = sandbox.personaMapRoyal;

  if (!personaMapRoyal) {
    throw new Error("Could not find personaMapRoyal in source data.");
  }

  if (fs.existsSync(outputPath)) {
    fs.copyFileSync(outputPath, backupPath);
    console.log(`Backup created at ${backupPath}`);
  }

  const personas = Object.entries(personaMapRoyal).map(([name, data]) => {
    const normalizedName = normalizeName(name);

    return {
      name: normalizedName,
      arcana: data.arcana,
      level: data.level,
      trait: data.trait ?? "Unknown",
      isDlc: !!data.dlc,
      dlcPack: data.dlc ? getDlcPack(name) : null,
      specialFusion: !!data.special,
      rare: !!data.rare,
      inherits: data.inherits ?? "Unknown",
      

      stats: {
        strength: data.stats?.[0] ?? 0,
        magic: data.stats?.[1] ?? 0,
        endurance: data.stats?.[2] ?? 0,
        agility: data.stats?.[3] ?? 0,
        luck: data.stats?.[4] ?? 0,
      },

      affinities: convertAffinities(data.elems ?? []),

      skills: convertSkills(data.skills, data.level),

      locations: convertLocations(data),
    };
  });

  personas.sort((a, b) => {
    const arcanaDifference =
      arcanaOrder.indexOf(a.arcana) - arcanaOrder.indexOf(b.arcana);

    if (arcanaDifference !== 0) {
      return arcanaDifference;
    }

    if (a.level !== b.level) {
      return a.level - b.level;
    }

    return a.name.localeCompare(b.name);
  });

  fs.writeFileSync(outputPath, JSON.stringify(personas, null, 2), {
    encoding: "utf8",
  });

  JSON.parse(fs.readFileSync(outputPath, "utf8"));

  console.log(`Generated ${outputPath}`);
  console.log(`Persona count: ${personas.length}`);
  console.log("JSON validation passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});