import { defaultGame } from "../data/games";
import { getFusionResult } from "./fusionLogic";
import type { GameData, Persona } from "../types";

type SkillInheritanceCategory =
  | "Physical"
  | "Gun"
  | "Slash"
  | "Strike"
  | "Pierce"
  | "Fire"
  | "Ice"
  | "Electric"
  | "Wind"
  | "Psy"
  | "Nuclear"
  | "Bless"
  | "Curse"
  | "Light"
  | "Dark"
  | "Healing"
  | "Ailment"
  | "Almighty"
  | "Passive"
  | "Support"
  | "Unknown";

type PersonaInheritanceType =
  | "Physical"
  | "Slash"
  | "Strike"
  | "Pierce"
  | "Fire"
  | "Ice"
  | "Electric"
  | "Wind"
  | "Psy"
  | "Nuclear"
  | "Bless"
  | "Curse"
  | "Light"
  | "Dark"
  | "LightDark"
  | "Healing"
  | "Ailment"
  | "Almighty";

const inheritanceChart: Record<
  PersonaInheritanceType,
  Partial<Record<SkillInheritanceCategory, boolean>>
> = {
  Physical: {
    Physical: true,
    Gun: true,
    Slash: true,
    Strike: true,
    Pierce: true,
    Fire: false,
    Ice: false,
    Electric: false,
    Wind: false,
    Psy: false,
    Nuclear: false,
    Bless: false,
    Curse: false,
    Light: false,
    Dark: false,
    Healing: true,
    Ailment: true,
    Almighty: false,
  },
  Slash: {
    Physical: true,
    Gun: true,
    Slash: true,
    Strike: true,
    Pierce: true,
    Fire: false,
    Ice: false,
    Electric: false,
    Wind: false,
    Psy: false,
    Nuclear: false,
    Bless: false,
    Curse: false,
    Light: false,
    Dark: false,
    Healing: true,
    Ailment: true,
    Almighty: false,
  },
  Strike: {
    Physical: true,
    Gun: true,
    Slash: true,
    Strike: true,
    Pierce: true,
    Fire: false,
    Ice: false,
    Electric: false,
    Wind: false,
    Psy: false,
    Nuclear: false,
    Bless: false,
    Curse: false,
    Light: false,
    Dark: false,
    Healing: true,
    Ailment: true,
    Almighty: false,
  },
  Pierce: {
    Physical: true,
    Gun: true,
    Slash: true,
    Strike: true,
    Pierce: true,
    Fire: false,
    Ice: false,
    Electric: false,
    Wind: false,
    Psy: false,
    Nuclear: false,
    Bless: false,
    Curse: false,
    Light: false,
    Dark: false,
    Healing: true,
    Ailment: true,
    Almighty: false,
  },
  Fire: {
    Physical: true,
    Gun: true,
    Slash: true,
    Strike: true,
    Pierce: true,
    Fire: true,
    Ice: false,
    Electric: true,
    Wind: true,
    Psy: true,
    Nuclear: true,
    Bless: true,
    Curse: true,
    Light: true,
    Dark: true,
    Healing: true,
    Ailment: true,
    Almighty: false,
  },
  Ice: {
    Physical: true,
    Gun: true,
    Slash: true,
    Strike: true,
    Pierce: true,
    Fire: false,
    Ice: true,
    Electric: true,
    Wind: true,
    Psy: true,
    Nuclear: true,
    Bless: true,
    Curse: true,
    Light: true,
    Dark: true,
    Healing: true,
    Ailment: true,
    Almighty: false,
  },
  Electric: {
    Physical: true,
    Gun: true,
    Slash: true,
    Strike: true,
    Pierce: true,
    Fire: true,
    Ice: true,
    Electric: true,
    Wind: false,
    Psy: true,
    Nuclear: true,
    Bless: true,
    Curse: true,
    Light: true,
    Dark: true,
    Healing: true,
    Ailment: true,
    Almighty: false,
  },
  Wind: {
    Physical: true,
    Gun: true,
    Slash: true,
    Strike: true,
    Pierce: true,
    Fire: true,
    Ice: true,
    Electric: false,
    Wind: true,
    Psy: true,
    Nuclear: true,
    Bless: true,
    Curse: true,
    Light: true,
    Dark: true,
    Healing: true,
    Ailment: true,
    Almighty: false,
  },
  Psy: {
    Physical: true,
    Gun: true,
    Slash: true,
    Strike: true,
    Pierce: true,
    Fire: true,
    Ice: true,
    Electric: true,
    Wind: true,
    Psy: true,
    Nuclear: false,
    Bless: true,
    Curse: true,
    Light: true,
    Dark: true,
    Healing: true,
    Ailment: true,
    Almighty: false,
  },
  Nuclear: {
    Physical: true,
    Gun: true,
    Slash: true,
    Strike: true,
    Pierce: true,
    Fire: true,
    Ice: true,
    Electric: true,
    Wind: true,
    Psy: false,
    Nuclear: true,
    Bless: true,
    Curse: true,
    Light: true,
    Dark: true,
    Healing: true,
    Ailment: true,
    Almighty: false,
  },
  Bless: {
    Physical: false,
    Gun: false,
    Slash: false,
    Strike: false,
    Pierce: false,
    Fire: true,
    Ice: true,
    Electric: true,
    Wind: true,
    Psy: true,
    Nuclear: true,
    Bless: true,
    Curse: false,
    Light: true,
    Dark: false,
    Healing: true,
    Ailment: false,
    Almighty: false,
  },
  Curse: {
    Physical: false,
    Gun: false,
    Slash: false,
    Strike: false,
    Pierce: false,
    Fire: true,
    Ice: true,
    Electric: true,
    Wind: true,
    Psy: true,
    Nuclear: true,
    Bless: false,
    Curse: true,
    Light: false,
    Dark: true,
    Healing: false,
    Ailment: true,
    Almighty: false,
  },
  Light: {
    Physical: false,
    Gun: false,
    Slash: false,
    Strike: false,
    Pierce: false,
    Fire: true,
    Ice: true,
    Electric: true,
    Wind: true,
    Psy: true,
    Nuclear: true,
    Bless: true,
    Curse: false,
    Light: true,
    Dark: false,
    Healing: true,
    Ailment: false,
    Almighty: false,
  },
  Dark: {
    Physical: false,
    Gun: false,
    Slash: false,
    Strike: false,
    Pierce: false,
    Fire: true,
    Ice: true,
    Electric: true,
    Wind: true,
    Psy: true,
    Nuclear: true,
    Bless: false,
    Curse: true,
    Light: false,
    Dark: true,
    Healing: false,
    Ailment: true,
    Almighty: false,
  },
  LightDark: {
    Physical: false,
    Gun: false,
    Slash: false,
    Strike: false,
    Pierce: false,
    Fire: true,
    Ice: true,
    Electric: true,
    Wind: true,
    Psy: true,
    Nuclear: true,
    Bless: true,
    Curse: true,
    Light: true,
    Dark: true,
    Healing: true,
    Ailment: true,
    Almighty: false,
  },
  Healing: {
    Physical: false,
    Gun: false,
    Slash: false,
    Strike: false,
    Pierce: false,
    Fire: true,
    Ice: true,
    Electric: true,
    Wind: true,
    Psy: true,
    Nuclear: true,
    Bless: true,
    Curse: false,
    Light: true,
    Dark: false,
    Healing: true,
    Ailment: true,
    Almighty: false,
  },
  Ailment: {
    Physical: true,
    Gun: true,
    Slash: true,
    Strike: true,
    Pierce: true,
    Fire: true,
    Ice: true,
    Electric: true,
    Wind: true,
    Psy: true,
    Nuclear: true,
    Bless: false,
    Curse: true,
    Light: false,
    Dark: true,
    Healing: false,
    Ailment: true,
    Almighty: false,
  },
  Almighty: {
    Physical: true,
    Gun: true,
    Slash: true,
    Strike: true,
    Pierce: true,
    Fire: true,
    Ice: true,
    Electric: true,
    Wind: true,
    Psy: true,
    Nuclear: true,
    Bless: true,
    Curse: true,
    Light: true,
    Dark: true,
    Healing: true,
    Ailment: true,
    Almighty: true,
  },
};

const p3rInheritanceCategoryOrder: SkillInheritanceCategory[] = [
  "Slash",
  "Strike",
  "Pierce",
  "Fire",
  "Ice",
  "Electric",
  "Wind",
  "Light",
  "Dark",
  "Ailment",
  "Healing",
  "Support",
];

const p3rInheritanceTypeBits: Record<string, string> = {
  none: "000000000000",
  strikeA: "011111111111",
  pierceA: "101111111111",
  slashA: "110111111111",
  iceA: "111011111111",
  fireA: "111101111111",
  windA: "111110111111",
  elecA: "111111011111",
  darkA: "111111101101",
  lightA: "111111110011",
  iceD: "111011101101",
  fireD: "111101101101",
  windD: "111110101101",
  elecD: "111111001101",
  iceL: "111011110011",
  fireL: "111101110011",
  windL: "111110110011",
  elecL: "111111010011",
  strikeB: "111000011111",
  pierceB: "111111100001",
  fireB: "111100000011",
  iceB: "111010000011",
  elecB: "111001000011",
  windB: "111000100011",
  lightB: "111000010011",
  darkB: "111000001101",
  slashB: "111000000001",
  lidarkA: "000111111111",
  lidarkB: "111111111000",
  ailment: "000111101101",
  recovery: "000111110011",
  almighty: "111111111111",
};

export type BuildStep = {
  personaA: Persona;
  personaB: Persona;
  result: Persona;
  inheritedSkills: string[];
  skillSources: SkillLearningSource[];
  inheritedTrait: string | null;
  isSpecialFusion?: boolean;
  specialIngredients?: Persona[];
};

export type SkillLearningSource = {
  skillName: string;
  personaName: string;
  level: number;
};

export type BuildPlan = {
  targetPersona: Persona;
  desiredSkills: string[];
  desiredTrait?: string;
  steps: BuildStep[];
  stoppedEarly?: boolean;
  failureReason?: string;
};

export type BuildValidation = {
  targetReached: boolean;
  hasAllSkills: boolean;
  hasRequestedTrait: boolean;
  skillCountValid: boolean;
  inheritanceLegal: boolean;
  levelLegal: boolean;
  illegalSkills: string[];
  warnings: string[];
};

type BuildState = {
  currentPersona: Persona;
  carriedSkills: string[];
  carriedSkillSources: SkillSourceMap;
  carriedTrait: string | null;
  steps: BuildStep[];
};

type SkillSourceMap = Record<string, SkillLearningSource>;

type FindBuildPlanOptions = {
  gameData: GameData;
  targetPersonaName: string;
  desiredSkills: string[];
  desiredTrait?: string;
  includeDlc: boolean;
  playerLevel: number;
  maxStates?: number;
  maxMilliseconds?: number;
  beamWidth?: number;
};

function getSkillInfo(skillName: string, gameData: GameData = defaultGame) {
  return gameData.skills[skillName] ?? null;
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function getPersonaInheritanceType(
  persona: Persona
): PersonaInheritanceType | null {
  const normalizedInheritance = normalizeText(persona.inherits);

  if (normalizedInheritance === "physical") return "Physical";
  if (normalizedInheritance === "slash") return "Slash";
  if (normalizedInheritance === "strike") return "Strike";
  if (normalizedInheritance === "pierce") return "Pierce";
  if (normalizedInheritance === "fire") return "Fire";
  if (normalizedInheritance === "ice") return "Ice";
  if (normalizedInheritance === "electric") return "Electric";
  if (normalizedInheritance === "wind") return "Wind";
  if (normalizedInheritance === "psy") return "Psy";
  if (normalizedInheritance === "nuclear") return "Nuclear";
  if (normalizedInheritance === "bless") return "Bless";
  if (normalizedInheritance === "curse") return "Curse";
  if (normalizedInheritance === "light") return "Light";
  if (normalizedInheritance === "dark") return "Dark";
  if (normalizedInheritance === "light/dark" || normalizedInheritance === "lightdark") {
    return "LightDark";
  }
  if (normalizedInheritance === "healing") return "Healing";
  if (normalizedInheritance === "ailment") return "Ailment";
  if (normalizedInheritance === "almighty") return "Almighty";

  return null;
}

function getSkillInheritanceCategory(
  skillName: string,
  gameData: GameData = defaultGame
): SkillInheritanceCategory {
  const skillInfo = getSkillInfo(skillName, gameData);
  const rawCategory = skillInfo?.element ?? "";
  const normalizedCategory = normalizeText(rawCategory);

  if (normalizedCategory === "passive") return "Passive";
  if (normalizedCategory === "phys" || normalizedCategory === "physical") {
    return "Physical";
  }
  if (normalizedCategory === "gun") return "Gun";
  if (normalizedCategory === "slash") return "Slash";
  if (normalizedCategory === "strike") return "Strike";
  if (normalizedCategory === "pierce") return "Pierce";
  if (normalizedCategory === "fire") return "Fire";
  if (normalizedCategory === "ice") return "Ice";
  if (normalizedCategory === "elec" || normalizedCategory === "electric") {
    return "Electric";
  }
  if (normalizedCategory === "wind") return "Wind";
  if (normalizedCategory === "psy" || normalizedCategory === "psychic") {
    return "Psy";
  }
  if (normalizedCategory === "nuke" || normalizedCategory === "nuclear") {
    return "Nuclear";
  }
  if (normalizedCategory === "bless") return "Bless";
  if (normalizedCategory === "curse") return "Curse";
  if (normalizedCategory === "light") return "Light";
  if (normalizedCategory === "dark") return "Dark";
  if (normalizedCategory === "healing" || normalizedCategory === "recovery") {
    return "Healing";
  }
  if (normalizedCategory === "support") return "Support";
  if (normalizedCategory === "ailment") return "Ailment";
  if (normalizedCategory === "almighty") return "Almighty";

  return "Unknown";
}

function getP3rInheritanceResult(
  persona: Persona,
  skillCategory: SkillInheritanceCategory
) {
  const inheritanceCode = persona.inheritCode;

  if (!inheritanceCode) {
    return null;
  }

  const inheritanceBits = p3rInheritanceTypeBits[inheritanceCode];

  if (!inheritanceBits) {
    return null;
  }

  const categoryIndex = p3rInheritanceCategoryOrder.indexOf(skillCategory);

  if (categoryIndex === -1) {
    return false;
  }

  return inheritanceBits[categoryIndex] === "1";
}

function personaNaturallyHasSkill(persona: Persona, skillName: string) {
  return persona.skills.some((skill) => skill.name === skillName);
}

export function canPersonaInheritSkill(
  persona: Persona,
  skillName: string,
  gameData: GameData = defaultGame
) {
  if (personaNaturallyHasSkill(persona, skillName)) {
    return true;
  }

  const skillInfo = getSkillInfo(skillName, gameData);

  if (skillInfo?.uniqueTo && skillInfo.uniqueTo !== persona.name) {
    return false;
  }

  const skillCategory = getSkillInheritanceCategory(skillName, gameData);

  if (skillCategory === "Passive") {
    return true;
  }

  if (skillCategory === "Unknown") {
    return false;
  }

  if (gameData.id === "p3r") {
    const p3rInheritanceResult = getP3rInheritanceResult(
      persona,
      skillCategory
    );

    if (p3rInheritanceResult !== null) {
      return p3rInheritanceResult;
    }
  }

  if (skillCategory === "Support") {
    return true;
  }

  const personaInheritanceType = getPersonaInheritanceType(persona);

  if (!personaInheritanceType) {
    return false;
  }

  return inheritanceChart[personaInheritanceType][skillCategory] === true;
}

function getLegalCarriedSkillsForResult(
  resultPersona: Persona,
  possibleSkills: string[],
  gameData: GameData
) {
  return possibleSkills.filter((skillName) =>
    canPersonaInheritSkill(resultPersona, skillName, gameData)
  );
}

function sortSkills(skills: string[]) {
  return [...skills].sort();
}

function mergeSkills(skillListA: string[], skillListB: string[]) {
  return Array.from(new Set([...skillListA, ...skillListB])).sort();
}

function hasAllDesiredSkills(carriedSkills: string[], desiredSkills: string[]) {
  return desiredSkills.every((skillName) => carriedSkills.includes(skillName));
}

function getPersonaNaturalSelectedSkills(
  persona: Persona,
  desiredSkills: string[]
) {
  return desiredSkills.filter((skillName) =>
    personaNaturallyHasSkill(persona, skillName)
  );
}

function getPersonaNaturalSelectedSkillSources(
  persona: Persona,
  desiredSkills: string[]
) {
  return desiredSkills
    .map((skillName) => {
      const learnedSkill = persona.skills.find(
        (skill) => skill.name === skillName
      );

      if (!learnedSkill) {
        return null;
      }

      return {
        skillName,
        personaName: persona.name,
        level: learnedSkill.level,
      };
    })
    .filter(
      (source): source is SkillLearningSource => source !== null
    );
}

function getPersonaNaturalSelectedSkillSourceMap(
  persona: Persona,
  desiredSkills: string[]
) {
  return createSkillSourceMap(
    getPersonaNaturalSelectedSkillSources(persona, desiredSkills)
  );
}

function createSkillSourceMap(sources: SkillLearningSource[]) {
  return sources.reduce<SkillSourceMap>((result, source) => {
    result[source.skillName] = source;
    return result;
  }, {});
}

function mergeSkillSourceMaps(...sourceMaps: SkillSourceMap[]) {
  return sourceMaps.reduce<SkillSourceMap>((result, sourceMap) => {
    Object.entries(sourceMap).forEach(([skillName, source]) => {
      const existingSource = result[skillName];

      if (
        !existingSource ||
        source.level < existingSource.level ||
        (source.level === existingSource.level &&
          source.personaName.localeCompare(existingSource.personaName) < 0)
      ) {
        result[skillName] = source;
      }
    });

    return result;
  }, {});
}

function pickSkillSources(
  sourceMap: SkillSourceMap,
  skillNames: string[]
): SkillSourceMap {
  return skillNames.reduce<SkillSourceMap>((result, skillName) => {
    const source = sourceMap[skillName];

    if (source) {
      result[skillName] = source;
    }

    return result;
  }, {});
}

function skillSourceMapToList(
  sourceMap: SkillSourceMap,
  skillNames: string[]
) {
  return skillNames
    .map((skillName) => sourceMap[skillName])
    .filter(
      (source): source is SkillLearningSource => source !== undefined
    );
}

function getPersonaSelectedTrait(persona: Persona, desiredTrait?: string) {
  if (!desiredTrait) {
    return null;
  }

  return persona.trait === desiredTrait ? desiredTrait : null;
}

function hasDesiredTrait(carriedTrait: string | null, desiredTrait?: string) {
  if (!desiredTrait) {
    return true;
  }

  return carriedTrait === desiredTrait;
}

function getVisitedKey(state: BuildState) {
  return `${state.currentPersona.name}|${sortSkills(state.carriedSkills).join(
    ","
  )}|${state.carriedTrait ?? "None"}`;
}

function scoreState(state: BuildState, desiredTrait?: string) {
  const skillScore = state.carriedSkills.length * 100;
  const traitScore = hasDesiredTrait(state.carriedTrait, desiredTrait) ? 50 : 0;
  const levelPenalty = state.currentPersona.level;
  const stepPenalty = state.steps.length * 2;

  return skillScore + traitScore - levelPenalty - stepPenalty;
}

function isCompleteBuild(
  state: BuildState,
  targetPersonaName: string,
  desiredSkills: string[],
  desiredTrait?: string
) {
  return (
    state.currentPersona.name === targetPersonaName &&
    hasAllDesiredSkills(state.carriedSkills, desiredSkills) &&
    hasDesiredTrait(state.carriedTrait, desiredTrait) &&
    state.steps.length > 0
  );
}

function getIllegalSkillsForPersona(
  persona: Persona,
  skillNames: string[],
  gameData: GameData
) {
  return skillNames.filter(
    (skillName) => !canPersonaInheritSkill(persona, skillName, gameData)
  );
}

function validateEveryStepInheritance(buildPlan: BuildPlan, gameData: GameData) {
  const illegalStepMessages: string[] = [];

  buildPlan.steps.forEach((step, index) => {
    const illegalSkills = getIllegalSkillsForPersona(
      step.result,
      step.inheritedSkills,
      gameData
    );

    if (illegalSkills.length > 0) {
      illegalStepMessages.push(
        `Step ${index + 1}: ${step.result.name} cannot inherit ${illegalSkills.join(
          ", "
        )}.`
      );
    }
  });

  return illegalStepMessages;
}

function validateEveryStepLevel(buildPlan: BuildPlan, playerLevel: number) {
  const overLevelMessages: string[] = [];

  buildPlan.steps.forEach((step, index) => {
    const stepPersonas = step.specialIngredients ?? [
      step.personaA,
      step.personaB,
    ];

    stepPersonas.forEach((persona) => {
      if (persona.level > playerLevel) {
        overLevelMessages.push(
          `Step ${index + 1}: ${persona.name} is above player level.`
        );
      }
    });

    if (step.result.level > playerLevel) {
      overLevelMessages.push(
        `Step ${index + 1}: ${step.result.name} is above player level.`
      );
    }
  });

  return overLevelMessages;
}

function getAvailablePersonas(
  gameData: GameData,
  includeDlc: boolean,
  playerLevel: number
) {
  return gameData.personas.filter((persona) => {
    const matchesDlc = includeDlc || !persona.isDlc;
    const matchesLevel = persona.level <= playerLevel;

    return matchesDlc && matchesLevel;
  });
}

function getSpecialFusionIngredients(
  gameData: GameData,
  targetPersonaName: string,
  includeDlc: boolean,
  playerLevel: number
) {
  const ingredientNames = gameData.specialFusions[targetPersonaName];

  if (!ingredientNames) {
    return null;
  }

  const ingredients = ingredientNames
    .map((ingredientName) =>
      gameData.personas.find((persona) => persona.name === ingredientName)
    )
    .filter((persona): persona is Persona => persona !== undefined)
    .filter((persona) => includeDlc || !persona.isDlc)
    .filter((persona) => persona.level <= playerLevel);

  if (ingredients.length !== ingredientNames.length) {
    return [];
  }

  return ingredients;
}

function createSpecialFusionStep(
  ingredients: Persona[],
  carrierState: BuildState,
  targetPersona: Persona,
  desiredSkills: string[],
  desiredTrait?: string
): BuildStep {
  const fallbackPersonaB =
    ingredients.find(
      (ingredient) => ingredient.name !== carrierState.currentPersona.name
    ) ?? ingredients[0];
  const targetSkillSources = getPersonaNaturalSelectedSkillSourceMap(
    targetPersona,
    desiredSkills
  );
  const finalSkillSources = mergeSkillSourceMaps(
    carrierState.carriedSkillSources,
    targetSkillSources
  );

  return {
    personaA: carrierState.currentPersona,
    personaB: fallbackPersonaB,
    result: targetPersona,
    inheritedSkills: desiredSkills,
    skillSources: skillSourceMapToList(finalSkillSources, desiredSkills),
    inheritedTrait: carrierState.carriedTrait ?? desiredTrait ?? null,
    isSpecialFusion: true,
    specialIngredients: ingredients,
  };
}

function findNormalBuildPlanToTarget({
  gameData,
  targetPersonaName,
  desiredSkills,
  desiredTrait,
  includeDlc,
  playerLevel,
  maxStates = 300000,
  maxMilliseconds = 10000,
  beamWidth = 5000,
}: FindBuildPlanOptions): BuildPlan | null {
  const targetPersona = gameData.personas.find(
    (persona) => persona.name === targetPersonaName
  );

  if (!targetPersona) {
    return null;
  }

  if (targetPersona.level > playerLevel) {
    return {
      targetPersona,
      desiredSkills,
      desiredTrait,
      steps: [],
      stoppedEarly: true,
      failureReason: `${targetPersona.name} is above the selected player level.`,
    };
  }

  if (desiredSkills.length === 0 && !desiredTrait) {
    return null;
  }

  if (desiredSkills.length > 8) {
    return {
      targetPersona,
      desiredSkills,
      desiredTrait,
      steps: [],
      stoppedEarly: true,
      failureReason: "A Persona can only carry up to 8 selected skills.",
    };
  }

  const illegalTargetSkills = getIllegalSkillsForPersona(
    targetPersona,
    desiredSkills,
    gameData
  );

  if (illegalTargetSkills.length > 0) {
    return {
      targetPersona,
      desiredSkills,
      desiredTrait,
      steps: [],
      stoppedEarly: true,
      failureReason: `${targetPersona.name} cannot inherit: ${illegalTargetSkills.join(
        ", "
      )}.`,
    };
  }

  const availablePersonas = getAvailablePersonas(
    gameData,
    includeDlc,
    playerLevel
  );

  let frontier: BuildState[] = [];

  availablePersonas.forEach((persona) => {
    const naturalSkills = getPersonaNaturalSelectedSkills(
      persona,
      desiredSkills
    );

    const naturalTrait = getPersonaSelectedTrait(persona, desiredTrait);

    if (naturalSkills.length === 0 && !naturalTrait) {
      return;
    }

    frontier.push({
      currentPersona: persona,
      carriedSkills: naturalSkills,
      carriedSkillSources: getPersonaNaturalSelectedSkillSourceMap(
        persona,
        desiredSkills
      ),
      carriedTrait: naturalTrait,
      steps: [],
    });
  });

  frontier = frontier.sort(
    (a, b) => scoreState(b, desiredTrait) - scoreState(a, desiredTrait)
  );

  const visited = new Set<string>();
  const startTime = performance.now();
  let checkedStates = 0;

  while (frontier.length > 0) {
    const nextFrontier: BuildState[] = [];

    for (const state of frontier) {
      if (
        checkedStates >= maxStates ||
        performance.now() - startTime >= maxMilliseconds
      ) {
        return {
          targetPersona,
          desiredSkills,
          desiredTrait,
          steps: [],
          stoppedEarly: true,
          failureReason:
            "No complete route was found within the current search limit.",
        };
      }

      const visitedKey = getVisitedKey(state);

      if (visited.has(visitedKey)) {
        continue;
      }

      visited.add(visitedKey);
      checkedStates++;

      if (
        isCompleteBuild(
          state,
          targetPersonaName,
          desiredSkills,
          desiredTrait
        )
      ) {
        return {
          targetPersona,
          desiredSkills,
          desiredTrait,
          steps: state.steps,
        };
      }

      for (const fusionPartner of availablePersonas) {
        if (state.currentPersona.name === fusionPartner.name) {
          continue;
        }

        const result = getFusionResult(state.currentPersona, fusionPartner, {
          includeDlc,
        }, gameData);

        if (!result || result.level > playerLevel) {
          continue;
        }

        const partnerSkills = getPersonaNaturalSelectedSkills(
          fusionPartner,
          desiredSkills
        );

        const resultSkills = getPersonaNaturalSelectedSkills(
          result,
          desiredSkills
        );
        const possibleNextSkillSources = mergeSkillSourceMaps(
          state.carriedSkillSources,
          getPersonaNaturalSelectedSkillSourceMap(fusionPartner, desiredSkills),
          getPersonaNaturalSelectedSkillSourceMap(result, desiredSkills)
        );

        const possibleNextSkills = mergeSkills(
          mergeSkills(state.carriedSkills, partnerSkills),
          resultSkills
        ).slice(0, 8);

        const nextCarriedSkills = getLegalCarriedSkillsForResult(
          result,
          possibleNextSkills,
          gameData
        );
        const nextCarriedSkillSources = pickSkillSources(
          possibleNextSkillSources,
          nextCarriedSkills
        );

        const lostCarriedSkill = state.carriedSkills.some(
          (skillName) => !nextCarriedSkills.includes(skillName)
        );

        if (lostCarriedSkill) {
          continue;
        }

        const partnerTrait = getPersonaSelectedTrait(
          fusionPartner,
          desiredTrait
        );

        const resultTrait = getPersonaSelectedTrait(result, desiredTrait);

        const nextCarriedTrait =
          state.carriedTrait ?? partnerTrait ?? resultTrait ?? null;

        const nextStep: BuildStep = {
          personaA: state.currentPersona,
          personaB: fusionPartner,
          result,
          inheritedSkills: nextCarriedSkills,
          skillSources: skillSourceMapToList(
            nextCarriedSkillSources,
            nextCarriedSkills
          ),
          inheritedTrait: nextCarriedTrait,
        };

        const nextState: BuildState = {
          currentPersona: result,
          carriedSkills: nextCarriedSkills,
          carriedSkillSources: nextCarriedSkillSources,
          carriedTrait: nextCarriedTrait,
          steps: [...state.steps, nextStep],
        };

        if (
          isCompleteBuild(
            nextState,
            targetPersonaName,
            desiredSkills,
            desiredTrait
          )
        ) {
          return {
            targetPersona,
            desiredSkills,
            desiredTrait,
            steps: nextState.steps,
          };
        }

        const nextVisitedKey = getVisitedKey(nextState);

        if (!visited.has(nextVisitedKey)) {
          nextFrontier.push(nextState);
        }
      }
    }

    frontier = nextFrontier
      .sort((a, b) => scoreState(b, desiredTrait) - scoreState(a, desiredTrait))
      .slice(0, beamWidth);
  }

  return null;
}

function findSpecialBuildPlanToTarget({
  gameData,
  targetPersonaName,
  desiredSkills,
  desiredTrait,
  includeDlc,
  playerLevel,
  maxStates = 300000,
  maxMilliseconds = 10000,
  beamWidth = 5000,
}: FindBuildPlanOptions): BuildPlan | null {
  const targetPersona = gameData.personas.find(
    (persona) => persona.name === targetPersonaName
  );

  if (!targetPersona) {
    return null;
  }

  const ingredients = getSpecialFusionIngredients(
    gameData,
    targetPersonaName,
    includeDlc,
    playerLevel
  );

  if (!ingredients) {
    return null;
  }

  if (ingredients.length === 0) {
    return {
      targetPersona,
      desiredSkills,
      desiredTrait,
      steps: [],
      stoppedEarly: true,
      failureReason:
        "One or more special fusion ingredients are unavailable with the current filters.",
    };
  }

  const illegalTargetSkills = getIllegalSkillsForPersona(
    targetPersona,
    desiredSkills,
    gameData
  );

  if (illegalTargetSkills.length > 0) {
    return {
      targetPersona,
      desiredSkills,
      desiredTrait,
      steps: [],
      stoppedEarly: true,
      failureReason: `${targetPersona.name} cannot inherit: ${illegalTargetSkills.join(
        ", "
      )}.`,
    };
  }

  let bestPlan: BuildPlan | null = null;

  for (const carrierIngredient of ingredients) {
    const naturalSkills = getPersonaNaturalSelectedSkills(
      carrierIngredient,
      desiredSkills
    );

    const naturalTrait = getPersonaSelectedTrait(
      carrierIngredient,
      desiredTrait
    );

    const carrierAlreadyWorks =
      hasAllDesiredSkills(naturalSkills, desiredSkills) &&
      hasDesiredTrait(naturalTrait, desiredTrait);

    if (carrierAlreadyWorks) {
      const carrierState: BuildState = {
        currentPersona: carrierIngredient,
        carriedSkills: naturalSkills,
        carriedSkillSources: getPersonaNaturalSelectedSkillSourceMap(
          carrierIngredient,
          desiredSkills
        ),
        carriedTrait: naturalTrait,
        steps: [],
      };

      const finalStep = createSpecialFusionStep(
        ingredients,
        carrierState,
        targetPersona,
        desiredSkills,
        desiredTrait
      );

      const plan: BuildPlan = {
        targetPersona,
        desiredSkills,
        desiredTrait,
        steps: [finalStep],
      };

      if (!bestPlan || plan.steps.length < bestPlan.steps.length) {
        bestPlan = plan;
      }

      continue;
    }

    const carrierCanInheritDesiredSkills = desiredSkills.every((skillName) =>
      canPersonaInheritSkill(carrierIngredient, skillName, gameData)
    );

    if (!carrierCanInheritDesiredSkills) {
      continue;
    }

    const carrierPlan = findNormalBuildPlanToTarget({
      gameData,
      targetPersonaName: carrierIngredient.name,
      desiredSkills,
      desiredTrait,
      includeDlc,
      playerLevel,
      maxStates,
      maxMilliseconds,
      beamWidth,
    });

    if (
      !carrierPlan ||
      carrierPlan.stoppedEarly ||
      carrierPlan.steps.length === 0
    ) {
      continue;
    }

    const finalCarrierStep = carrierPlan.steps[carrierPlan.steps.length - 1];

    const carrierState: BuildState = {
      currentPersona: carrierIngredient,
      carriedSkills: finalCarrierStep.inheritedSkills,
      carriedSkillSources: createSkillSourceMap(finalCarrierStep.skillSources),
      carriedTrait: finalCarrierStep.inheritedTrait,
      steps: carrierPlan.steps,
    };

    if (
      !hasAllDesiredSkills(carrierState.carriedSkills, desiredSkills) ||
      !hasDesiredTrait(carrierState.carriedTrait, desiredTrait)
    ) {
      continue;
    }

    const finalStep = createSpecialFusionStep(
      ingredients,
      carrierState,
      targetPersona,
      desiredSkills,
      desiredTrait
    );

    const plan: BuildPlan = {
      targetPersona,
      desiredSkills,
      desiredTrait,
      steps: [...carrierPlan.steps, finalStep],
    };

    if (!bestPlan || plan.steps.length < bestPlan.steps.length) {
      bestPlan = plan;
    }
  }

  if (bestPlan) {
    return bestPlan;
  }

  const fallbackCarrier =
    ingredients.find((ingredient) =>
      desiredSkills.every((skillName) =>
        canPersonaInheritSkill(ingredient, skillName, gameData)
      )
    ) ?? ingredients[0];

  const fallbackCarrierState: BuildState = {
    currentPersona: fallbackCarrier,
    carriedSkills: desiredSkills,
    carriedSkillSources: getPersonaNaturalSelectedSkillSourceMap(
      fallbackCarrier,
      desiredSkills
    ),
    carriedTrait: desiredTrait ?? null,
    steps: [],
  };

  const finalStep = createSpecialFusionStep(
    ingredients,
    fallbackCarrierState,
    targetPersona,
    desiredSkills,
    desiredTrait
  );

  return {
    targetPersona,
    desiredSkills,
    desiredTrait,
    steps: [finalStep],
  };
}

export function getPersonasThatLearnSkill(
  skillName: string,
  gameData: GameData = defaultGame
) {
  return gameData.personas
    .map((persona) => {
      const learnedSkill = persona.skills.find(
        (skill) => skill.name === skillName
      );

      if (!learnedSkill) {
        return null;
      }

      return {
        persona,
        level: learnedSkill.level,
      };
    })
    .filter(
      (
        result
      ): result is {
        persona: Persona;
        level: number;
      } => result !== null
    )
    .sort((a, b) => a.level - b.level);
}

export function validateBuildPlan(
  buildPlan: BuildPlan | null,
  targetPersonaName: string,
  desiredSkills: string[],
  desiredTrait: string | undefined,
  playerLevel: number,
  gameData: GameData = defaultGame
): BuildValidation {
  if (!buildPlan || buildPlan.steps.length === 0) {
    return {
      targetReached: false,
      hasAllSkills: false,
      hasRequestedTrait: !desiredTrait,
      skillCountValid: desiredSkills.length <= 8,
      inheritanceLegal: false,
      levelLegal: false,
      illegalSkills: desiredSkills,
      warnings: ["No completed build plan was found."],
    };
  }

  const finalStep = buildPlan.steps[buildPlan.steps.length - 1];
  const finalPersona = finalStep.result;
  const finalSkills = finalStep.inheritedSkills;
  const finalTrait = finalStep.inheritedTrait;

  const finalIllegalSkills = getIllegalSkillsForPersona(
    finalPersona,
    desiredSkills,
    gameData
  );

  const stepIllegalMessages = validateEveryStepInheritance(buildPlan, gameData);
  const overLevelMessages = validateEveryStepLevel(buildPlan, playerLevel);

  return {
    targetReached: finalPersona.name === targetPersonaName,
    hasAllSkills: hasAllDesiredSkills(finalSkills, desiredSkills),
    hasRequestedTrait: hasDesiredTrait(finalTrait, desiredTrait),
    skillCountValid: desiredSkills.length <= 8,
    inheritanceLegal:
      finalIllegalSkills.length === 0 && stepIllegalMessages.length === 0,
    levelLegal: overLevelMessages.length === 0,
    illegalSkills: finalIllegalSkills,
    warnings: [...stepIllegalMessages, ...overLevelMessages],
  };
}

export function findShortestBuildPlanToTarget({
  gameData,
  targetPersonaName,
  desiredSkills,
  desiredTrait,
  includeDlc,
  playerLevel,
  maxStates = 300000,
  maxMilliseconds = 10000,
  beamWidth = 5000,
}: FindBuildPlanOptions): BuildPlan | null {
  const targetPersona = gameData.personas.find(
    (persona) => persona.name === targetPersonaName
  );

  if (!targetPersona) {
    return null;
  }

  if (desiredSkills.length === 0 && !desiredTrait) {
    return null;
  }

  if (desiredSkills.length > 8) {
    return {
      targetPersona,
      desiredSkills,
      desiredTrait,
      steps: [],
      stoppedEarly: true,
      failureReason: "A Persona can only carry up to 8 selected skills.",
    };
  }

  const isSpecialFusionTarget =
    gameData.specialFusions[targetPersonaName] !== undefined;

  const specialPlan = findSpecialBuildPlanToTarget({
    gameData,
    targetPersonaName,
    desiredSkills,
    desiredTrait,
    includeDlc,
    playerLevel,
    maxStates,
    maxMilliseconds,
    beamWidth,
  });

  if (isSpecialFusionTarget) {
    return (
      specialPlan ?? {
        targetPersona,
        desiredSkills,
        desiredTrait,
        steps: [],
        stoppedEarly: true,
        failureReason: "No legal special fusion route found.",
      }
    );
  }

  if (specialPlan) {
    return specialPlan;
  }

  return findNormalBuildPlanToTarget({
    gameData,
    targetPersonaName,
    desiredSkills,
    desiredTrait,
    includeDlc,
    playerLevel,
    maxStates,
    maxMilliseconds,
    beamWidth,
  });
}
