import personas from "../data/personas.json";
import skillsData from "../data/skills.json";
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

const typedSkillsData = skillsData as SkillsObjectData | SkillArrayData;

export type BuildStep = {
  personaA: Persona;
  personaB: Persona;
  result: Persona;
  inheritedSkills: string[];
  inheritedTrait: string | null;
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

function getSkillInheritanceCategory(skillName: string) {
  const skillInfo = getSkillInfo(skillName);
  const rawCategory = skillInfo?.element ?? skillInfo?.type ?? "";
  const normalizedCategory = normalizeText(rawCategory);

  if (normalizedCategory === "passive") return "Passive";
  if (normalizedCategory === "phys" || normalizedCategory === "physical") return "Physical";
  if (normalizedCategory === "gun") return "Gun";
  if (normalizedCategory === "fire") return "Fire";
  if (normalizedCategory === "ice") return "Ice";
  if (normalizedCategory === "elec" || normalizedCategory === "electric") return "Electric";
  if (normalizedCategory === "wind") return "Wind";
  if (normalizedCategory === "psy") return "Psy";
  if (normalizedCategory === "nuke" || normalizedCategory === "nuclear") return "Nuclear";
  if (normalizedCategory === "bless") return "Bless";
  if (normalizedCategory === "curse") return "Curse";
  if (normalizedCategory === "healing" || normalizedCategory === "recovery") return "Healing";
  if (normalizedCategory === "support") return "Support";
  if (normalizedCategory === "ailment") return "Ailment";
  if (normalizedCategory === "almighty") return "Almighty";

  return rawCategory || "Unknown";
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

  const broadlyInheritableCategories = [
    "Passive",
    "Support",
    "Healing",
    "Ailment",
    "Almighty",
  ];

  if (broadlyInheritableCategories.includes(skillCategory)) {
    return true;
  }

  if (skillCategory === "Unknown" || persona.inherits === "Unknown") {
    return false;
  }

  return normalizeText(skillCategory) === normalizeText(persona.inherits);
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
    if (step.personaA.level > playerLevel) {
      overLevelMessages.push(
        `Step ${index + 1}: ${step.personaA.name} is above player level.`
      );
    }

    if (step.personaB.level > playerLevel) {
      overLevelMessages.push(
        `Step ${index + 1}: ${step.personaB.name} is above player level.`
      );
    }

    if (step.result.level > playerLevel) {
      overLevelMessages.push(
        `Step ${index + 1}: ${step.result.name} is above player level.`
      );
    }
  });

  return overLevelMessages;
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

  const availablePersonas = typedPersonas.filter((persona) => {
    const matchesDlc = includeDlc || !persona.isDlc;
    const matchesLevel = persona.level <= playerLevel;

    return matchesDlc && matchesLevel;
  });

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