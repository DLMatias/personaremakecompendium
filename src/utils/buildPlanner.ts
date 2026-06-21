import personas from "../data/personas.json";
import skillsData from "../data/skills.json";
import specialFusions from "../data/specialFusions.json";
import { getFusionResult } from "./fusionLogic";
import type { Persona } from "../types";

const typedPersonas = personas as Persona[];

type SkillInfo = {
  element?: string;
  type?: string;
  uniqueTo?: string | null;
};

type SkillsObjectData = {
  [skillName: string]: SkillInfo;
};

type SkillArrayData = {
  name: string;
  element?: string;
  type?: string;
  uniqueTo?: string | null;
}[];

type SpecialFusionsData = {
  [personaName: string]: string[];
};

type SkillInheritanceCategory =
  | "Physical"
  | "Gun"
  | "Fire"
  | "Ice"
  | "Electric"
  | "Wind"
  | "Psy"
  | "Nuclear"
  | "Bless"
  | "Curse"
  | "Healing"
  | "Ailment"
  | "Almighty"
  | "Passive"
  | "Support"
  | "Unknown";

type PersonaInheritanceType =
  | "Physical"
  | "Fire"
  | "Ice"
  | "Electric"
  | "Wind"
  | "Psy"
  | "Nuclear"
  | "Bless"
  | "Curse"
  | "Healing"
  | "Ailment"
  | "Almighty";

const typedSkillsData = skillsData as SkillsObjectData | SkillArrayData;
const typedSpecialFusions = specialFusions as SpecialFusionsData;

const inheritanceChart: Record<
  PersonaInheritanceType,
  Partial<Record<SkillInheritanceCategory, boolean>>
> = {
  Physical: {
    Physical: true,
    Gun: true,
    Fire: false,
    Ice: false,
    Electric: false,
    Wind: false,
    Psy: false,
    Nuclear: false,
    Bless: false,
    Curse: false,
    Healing: true,
    Ailment: true,
    Almighty: false,
  },
  Fire: {
    Physical: true,
    Gun: true,
    Fire: true,
    Ice: false,
    Electric: true,
    Wind: true,
    Psy: true,
    Nuclear: true,
    Bless: true,
    Curse: true,
    Healing: true,
    Ailment: true,
    Almighty: false,
  },
  Ice: {
    Physical: true,
    Gun: true,
    Fire: false,
    Ice: true,
    Electric: true,
    Wind: true,
    Psy: true,
    Nuclear: true,
    Bless: true,
    Curse: true,
    Healing: true,
    Ailment: true,
    Almighty: false,
  },
  Electric: {
    Physical: true,
    Gun: true,
    Fire: true,
    Ice: true,
    Electric: true,
    Wind: false,
    Psy: true,
    Nuclear: true,
    Bless: true,
    Curse: true,
    Healing: true,
    Ailment: true,
    Almighty: false,
  },
  Wind: {
    Physical: true,
    Gun: true,
    Fire: true,
    Ice: true,
    Electric: false,
    Wind: true,
    Psy: true,
    Nuclear: true,
    Bless: true,
    Curse: true,
    Healing: true,
    Ailment: true,
    Almighty: false,
  },
  Psy: {
    Physical: true,
    Gun: true,
    Fire: true,
    Ice: true,
    Electric: true,
    Wind: true,
    Psy: true,
    Nuclear: false,
    Bless: true,
    Curse: true,
    Healing: true,
    Ailment: true,
    Almighty: false,
  },
  Nuclear: {
    Physical: true,
    Gun: true,
    Fire: true,
    Ice: true,
    Electric: true,
    Wind: true,
    Psy: false,
    Nuclear: true,
    Bless: true,
    Curse: true,
    Healing: true,
    Ailment: true,
    Almighty: false,
  },
  Bless: {
    Physical: false,
    Gun: false,
    Fire: true,
    Ice: true,
    Electric: true,
    Wind: true,
    Psy: true,
    Nuclear: true,
    Bless: true,
    Curse: false,
    Healing: true,
    Ailment: false,
    Almighty: false,
  },
  Curse: {
    Physical: false,
    Gun: false,
    Fire: true,
    Ice: true,
    Electric: true,
    Wind: true,
    Psy: true,
    Nuclear: true,
    Bless: false,
    Curse: true,
    Healing: false,
    Ailment: true,
    Almighty: false,
  },
  Healing: {
    Physical: false,
    Gun: false,
    Fire: true,
    Ice: true,
    Electric: true,
    Wind: true,
    Psy: true,
    Nuclear: true,
    Bless: true,
    Curse: false,
    Healing: true,
    Ailment: true,
    Almighty: false,
  },
  Ailment: {
    Physical: true,
    Gun: true,
    Fire: true,
    Ice: true,
    Electric: true,
    Wind: true,
    Psy: true,
    Nuclear: true,
    Bless: false,
    Curse: true,
    Healing: false,
    Ailment: true,
    Almighty: false,
  },
  Almighty: {
    Physical: true,
    Gun: true,
    Fire: true,
    Ice: true,
    Electric: true,
    Wind: true,
    Psy: true,
    Nuclear: true,
    Bless: true,
    Curse: true,
    Healing: true,
    Ailment: true,
    Almighty: true,
  },
};

export type BuildStep = {
  personaA: Persona;
  personaB: Persona;
  result: Persona;
  inheritedSkills: string[];
  inheritedTrait: string | null;
  isSpecialFusion?: boolean;
  specialIngredients?: Persona[];
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
  carriedTrait: string | null;
  steps: BuildStep[];
};

type FindBuildPlanOptions = {
  targetPersonaName: string;
  desiredSkills: string[];
  desiredTrait?: string;
  includeDlc: boolean;
  playerLevel: number;
  maxStates?: number;
  maxMilliseconds?: number;
  beamWidth?: number;
};

function getSkillInfo(skillName: string) {
  if (Array.isArray(typedSkillsData)) {
    return typedSkillsData.find((skill) => skill.name === skillName) ?? null;
  }

  return typedSkillsData[skillName] ?? null;
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function getPersonaInheritanceType(
  persona: Persona
): PersonaInheritanceType | null {
  const normalizedInheritance = normalizeText(persona.inherits);

  if (normalizedInheritance === "physical") return "Physical";
  if (normalizedInheritance === "fire") return "Fire";
  if (normalizedInheritance === "ice") return "Ice";
  if (normalizedInheritance === "electric") return "Electric";
  if (normalizedInheritance === "wind") return "Wind";
  if (normalizedInheritance === "psy") return "Psy";
  if (normalizedInheritance === "nuclear") return "Nuclear";
  if (normalizedInheritance === "bless") return "Bless";
  if (normalizedInheritance === "curse") return "Curse";
  if (normalizedInheritance === "healing") return "Healing";
  if (normalizedInheritance === "ailment") return "Ailment";
  if (normalizedInheritance === "almighty") return "Almighty";

  return null;
}

function getSkillInheritanceCategory(
  skillName: string
): SkillInheritanceCategory {
  const skillInfo = getSkillInfo(skillName);
  const rawCategory = skillInfo?.element ?? skillInfo?.type ?? "";
  const normalizedCategory = normalizeText(rawCategory);

  if (normalizedCategory === "passive") return "Passive";
  if (normalizedCategory === "phys" || normalizedCategory === "physical") {
    return "Physical";
  }
  if (normalizedCategory === "gun") return "Gun";
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
  if (normalizedCategory === "healing" || normalizedCategory === "recovery") {
    return "Healing";
  }
  if (normalizedCategory === "support") return "Support";
  if (normalizedCategory === "ailment") return "Ailment";
  if (normalizedCategory === "almighty") return "Almighty";

  return "Unknown";
}

function personaNaturallyHasSkill(persona: Persona, skillName: string) {
  return persona.skills.some((skill) => skill.name === skillName);
}

export function canPersonaInheritSkill(persona: Persona, skillName: string) {
  if (personaNaturallyHasSkill(persona, skillName)) {
    return true;
  }

  const skillInfo = getSkillInfo(skillName);

  if (skillInfo?.uniqueTo && skillInfo.uniqueTo !== persona.name) {
    return false;
  }

  const skillCategory = getSkillInheritanceCategory(skillName);

  if (skillCategory === "Passive" || skillCategory === "Support") {
    return true;
  }

  if (skillCategory === "Unknown") {
    return false;
  }

  const personaInheritanceType = getPersonaInheritanceType(persona);

  if (!personaInheritanceType) {
    return false;
  }

  return inheritanceChart[personaInheritanceType][skillCategory] === true;
}

function getLegalCarriedSkillsForResult(
  resultPersona: Persona,
  possibleSkills: string[]
) {
  return possibleSkills.filter((skillName) =>
    canPersonaInheritSkill(resultPersona, skillName)
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

function getIllegalSkillsForPersona(persona: Persona, skillNames: string[]) {
  return skillNames.filter(
    (skillName) => !canPersonaInheritSkill(persona, skillName)
  );
}

function validateEveryStepInheritance(buildPlan: BuildPlan) {
  const illegalStepMessages: string[] = [];

  buildPlan.steps.forEach((step, index) => {
    const illegalSkills = getIllegalSkillsForPersona(
      step.result,
      step.inheritedSkills
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

function getAvailablePersonas(includeDlc: boolean, playerLevel: number) {
  return typedPersonas.filter((persona) => {
    const matchesDlc = includeDlc || !persona.isDlc;
    const matchesLevel = persona.level <= playerLevel;

    return matchesDlc && matchesLevel;
  });
}

function getSpecialFusionIngredients(
  targetPersonaName: string,
  includeDlc: boolean,
  playerLevel: number
) {
  const ingredientNames = typedSpecialFusions[targetPersonaName];

  if (!ingredientNames) {
    return null;
  }

  const ingredients = ingredientNames
    .map((ingredientName) =>
      typedPersonas.find((persona) => persona.name === ingredientName)
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

  return {
    personaA: carrierState.currentPersona,
    personaB: fallbackPersonaB,
    result: targetPersona,
    inheritedSkills: desiredSkills,
    inheritedTrait: carrierState.carriedTrait ?? desiredTrait ?? null,
    isSpecialFusion: true,
    specialIngredients: ingredients,
  };
}

function findNormalBuildPlanToTarget({
  targetPersonaName,
  desiredSkills,
  desiredTrait,
  includeDlc,
  playerLevel,
  maxStates = 300000,
  maxMilliseconds = 10000,
  beamWidth = 5000,
}: FindBuildPlanOptions): BuildPlan | null {
  const targetPersona = typedPersonas.find(
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
    desiredSkills
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

  const availablePersonas = getAvailablePersonas(includeDlc, playerLevel);

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
        });

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

        const possibleNextSkills = mergeSkills(
          mergeSkills(state.carriedSkills, partnerSkills),
          resultSkills
        ).slice(0, 8);

        const nextCarriedSkills = getLegalCarriedSkillsForResult(
          result,
          possibleNextSkills
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
          inheritedTrait: nextCarriedTrait,
        };

        const nextState: BuildState = {
          currentPersona: result,
          carriedSkills: nextCarriedSkills,
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
  targetPersonaName,
  desiredSkills,
  desiredTrait,
  includeDlc,
  playerLevel,
  maxStates = 300000,
  maxMilliseconds = 10000,
  beamWidth = 5000,
}: FindBuildPlanOptions): BuildPlan | null {
  const targetPersona = typedPersonas.find(
    (persona) => persona.name === targetPersonaName
  );

  if (!targetPersona) {
    return null;
  }

  const ingredients = getSpecialFusionIngredients(
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
    desiredSkills
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
      canPersonaInheritSkill(carrierIngredient, skillName)
    );

    if (!carrierCanInheritDesiredSkills) {
      continue;
    }

    const carrierPlan = findNormalBuildPlanToTarget({
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
        canPersonaInheritSkill(ingredient, skillName)
      )
    ) ?? ingredients[0];

  const fallbackCarrierState: BuildState = {
    currentPersona: fallbackCarrier,
    carriedSkills: desiredSkills,
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

export function getPersonasThatLearnSkill(skillName: string) {
  return typedPersonas
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
  playerLevel: number
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
    desiredSkills
  );

  const stepIllegalMessages = validateEveryStepInheritance(buildPlan);
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
  targetPersonaName,
  desiredSkills,
  desiredTrait,
  includeDlc,
  playerLevel,
  maxStates = 300000,
  maxMilliseconds = 10000,
  beamWidth = 5000,
}: FindBuildPlanOptions): BuildPlan | null {
  const targetPersona = typedPersonas.find(
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
    typedSpecialFusions[targetPersonaName] !== undefined;

  const specialPlan = findSpecialBuildPlanToTarget({
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