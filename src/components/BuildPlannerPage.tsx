import { useState } from "react";
import personasData from "../data/personas.json";
import skillsData from "../data/skills.json";
import traitsData from "../data/traits.json";
import {
  canPersonaInheritSkill,
  findShortestBuildPlanToTarget,
  validateBuildPlan,
} from "../utils/buildPlanner";
import type { Persona } from "../types";
import type { SkillLearningSource } from "../utils/buildPlanner";

type SkillInfo = {
  element: string;
  cost: string;
  description: string;
  uniqueTo: string | null;
  skillCard: string | null;
  talk: string | null;
  fuseFrom: string[];
  learnedBy: {
    [personaName: string]: number;
  };
};

type SkillsData = {
  [skillName: string]: SkillInfo;
};

type TraitsData = {
  [traitName: string]: {
    description: string;
  };
};

const personas = personasData as Persona[];
const skills = skillsData as SkillsData;
const traits = traitsData as TraitsData;

function getIconPath(element: string) {
  return `${import.meta.env.BASE_URL}icons/${element.toLowerCase()}.png`;
}

function formatCarriedSkill(
  skillName: string,
  skillSources: SkillLearningSource[]
) {
  const source = skillSources.find((item) => item.skillName === skillName);

  if (!source) {
    return skillName;
  }

  return `${skillName} (${source.personaName} Lv ${source.level})`;
}

function BuildPlannerPage() {
  const [targetPersonaName, setTargetPersonaName] = useState("");
  const [targetSearchText, setTargetSearchText] = useState("");
  const [skillSearchText, setSkillSearchText] = useState("");
  const [traitSearchText, setTraitSearchText] = useState("");
  const [wantedSkills, setWantedSkills] = useState<string[]>([]);
  const [wantedTrait, setWantedTrait] = useState<string>("");
  const [includeDlc, setIncludeDlc] = useState(true);
  const [playerLevel, setPlayerLevel] = useState(99);

  const targetPersona = targetPersonaName
    ? personas.find((persona) => persona.name === targetPersonaName) ?? null
    : null;

  const availablePersonas = personas.filter((persona) => {
    const matchesDlc = includeDlc || !persona.isDlc;
    const matchesLevel = persona.level <= playerLevel;

    return matchesDlc && matchesLevel;
  });

  const targetSearchResults = availablePersonas.filter((persona) =>
    persona.name.toLowerCase().includes(targetSearchText.toLowerCase())
  );

  const skillSearchResults = targetPersona
    ? Object.entries(skills).filter(([skillName, skill]) => {
        const matchesSearch = skillName
          .toLowerCase()
          .includes(skillSearchText.toLowerCase());

        const isNotTrait = skill.element !== "Trait";
        const targetCanInherit = canPersonaInheritSkill(
          targetPersona,
          skillName
        );

        return isNotTrait && matchesSearch && targetCanInherit;
      })
    : [];

  const traitSearchResults = targetPersona
    ? Object.entries(traits).filter(([traitName]) => {
        const matchesSearch = traitName
          .toLowerCase()
          .includes(traitSearchText.toLowerCase());

        const hasAvailableSource = availablePersonas.some(
          (persona) => persona.trait === traitName
        );

        return matchesSearch && hasAvailableSource;
      })
    : [];

  const selectedWantedTrait =
    wantedTrait &&
    availablePersonas.some((persona) => persona.trait === wantedTrait)
      ? wantedTrait
      : "";

  const shortestBuildPlan =
    targetPersona && (wantedSkills.length > 0 || selectedWantedTrait)
      ? findShortestBuildPlanToTarget({
          targetPersonaName,
          desiredSkills: wantedSkills,
          desiredTrait: selectedWantedTrait || undefined,
          includeDlc,
          playerLevel,
          maxStates: 300000,
          maxMilliseconds: 10000,
          beamWidth: 5000,
        })
      : null;

  const buildValidation = validateBuildPlan(
    shortestBuildPlan,
    targetPersonaName,
    wantedSkills,
    selectedWantedTrait || undefined,
    playerLevel
  );

  const hasBuildProblem =
    shortestBuildPlan &&
    shortestBuildPlan.steps.length > 0 &&
    (!buildValidation.targetReached ||
      !buildValidation.hasAllSkills ||
      !buildValidation.hasRequestedTrait ||
      !buildValidation.skillCountValid ||
      !buildValidation.inheritanceLegal ||
      !buildValidation.levelLegal);

  function selectTargetPersona(personaName: string) {
    setTargetPersonaName(personaName);
    setWantedSkills([]);
    setWantedTrait("");
    setSkillSearchText("");
    setTraitSearchText("");
  }

  function addWantedSkill(skillName: string) {
    if (!targetPersona || !canPersonaInheritSkill(targetPersona, skillName)) {
      return;
    }

    if (wantedSkills.includes(skillName)) {
      return;
    }

    if (wantedSkills.length >= 8) {
      return;
    }

    setWantedSkills([...wantedSkills, skillName]);
  }

  function removeWantedSkill(skillName: string) {
    setWantedSkills(wantedSkills.filter((skill) => skill !== skillName));
  }

  function selectWantedTrait(traitName: string) {
    setWantedTrait(traitName);
  }

  function clearWantedTrait() {
    setWantedTrait("");
  }

  return (
    <section className="tool-page">
      <div className="library-header">
        <div>
          <h2>Build Planner</h2>
          <p>
            Select a target Persona first. The skill and trait lists will update
            to show valid options for that Persona.
          </p>
        </div>
      </div>

      <div className="tool-options">
        <label>
          Player Level:
          <input
            type="number"
            min={1}
            max={99}
            value={playerLevel}
            onChange={(event) => setPlayerLevel(Number(event.target.value))}
            className="small-number-input"
          />
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={includeDlc}
            onChange={(event) => setIncludeDlc(event.target.checked)}
          />
          Include DLC Personas
        </label>
      </div>

      <div className="build-planner-grid">
        <div className="selector-panel">
          <h3>Target Persona</h3>
          <p>Selected: {targetPersonaName || "None"}</p>

          <input
            className="form-control"
            type="text"
            placeholder="Search Target Persona..."
            value={targetSearchText}
            onChange={(event) => setTargetSearchText(event.target.value)}
          />

          <div className="scrollable-select-list">
            {targetSearchResults.map((persona) => (
              <button
                key={persona.name}
                type="button"
                onClick={() => selectTargetPersona(persona.name)}
                className={
                  targetPersonaName === persona.name
                    ? "scrollable-select-item selected"
                    : "scrollable-select-item"
                }
              >
                <span>{persona.name}</span>

                <span className="select-item-meta">
                  Lv {persona.level} ; {persona.arcana}
                  {persona.isDlc ? " ; DLC" : ""}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="selector-panel">
          <h3>Wanted Skills</h3>
          <p>Selected Skills: {wantedSkills.length} / 8</p>

          <input
            className="form-control"
            type="text"
            placeholder={
              targetPersona
                ? "Search Valid Skill..."
                : "Select a target Persona first"
            }
            value={skillSearchText}
            onChange={(event) => setSkillSearchText(event.target.value)}
            disabled={!targetPersona}
          />

          <div className="scrollable-select-list">
            {targetPersona ? (
              skillSearchResults.map(([skillName, skill]) => (
                <button
                  key={skillName}
                  type="button"
                  onClick={() => addWantedSkill(skillName)}
                  disabled={
                    wantedSkills.length >= 8 &&
                    !wantedSkills.includes(skillName)
                  }
                  className={
                    wantedSkills.includes(skillName)
                      ? "scrollable-select-item selected"
                      : "scrollable-select-item"
                  }
                >
                  <span className="select-item-main">
                    <img
                      src={getIconPath(skill.element)}
                      alt={skill.element}
                      title={skill.element}
                      className="skill-type-icon"
                    />
                    {skillName}
                  </span>

                  <span className="select-item-meta">{skill.cost}</span>
                </button>
              ))
            ) : (
              <p>Select a target Persona to see valid skills.</p>
            )}
          </div>

          {wantedSkills.length > 0 && (
            <div className="selected-build-list">
              <h4>Selected Skills</h4>

              {wantedSkills.map((skillName) => (
                <button
                  key={skillName}
                  type="button"
                  onClick={() => removeWantedSkill(skillName)}
                  className="skill-chip skill-chip-button"
                >
                  {skillName} ×
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="selector-panel">
          <h3>Wanted Trait</h3>
          <p>Selected Trait: {selectedWantedTrait || "None"}</p>

          <input
            className="form-control"
            type="text"
            placeholder={
              targetPersona
                ? "Search Available Trait..."
                : "Select a target Persona first"
            }
            value={traitSearchText}
            onChange={(event) => setTraitSearchText(event.target.value)}
            disabled={!targetPersona}
          />

          <div className="scrollable-select-list">
            {targetPersona ? (
              traitSearchResults.map(([traitName, trait]) => (
                <button
                  key={traitName}
                  type="button"
                  onClick={() => selectWantedTrait(traitName)}
                  className={
                    selectedWantedTrait === traitName
                      ? "scrollable-select-item selected"
                      : "scrollable-select-item"
                  }
                >
                  <span className="select-item-main">
                    <img
                      src={getIconPath("trait")}
                      alt="Trait"
                      title="Trait"
                      className="skill-type-icon"
                    />
                    {traitName}
                  </span>

                  <span className="select-item-meta">
                    {trait.description}
                  </span>
                </button>
              ))
            ) : (
              <p>Select a target Persona to see available traits.</p>
            )}
          </div>

          {selectedWantedTrait && (
            <button
              type="button"
              onClick={clearWantedTrait}
              className="primary-action"
            >
              Clear Trait
            </button>
          )}
        </div>
      </div>

      {targetPersona && (
        <div className="result-panel">
          <h3>{targetPersona.name}</h3>

          <div className="info-grid">
            <p>Arcana: {targetPersona.arcana}</p>
            <p>Level: {targetPersona.level}</p>
            <p>Current Trait: {targetPersona.trait}</p>
            <p>Inherits: {targetPersona.inherits}</p>
          </div>
        </div>
      )}

      <div className="result-panel">
        <h3>Build Plan</h3>

        {!targetPersona ? (
          <p>Select a target Persona to begin planning.</p>
        ) : wantedSkills.length === 0 && !selectedWantedTrait ? (
          <p>Select at least one wanted skill or trait to begin planning.</p>
        ) : !shortestBuildPlan ? (
          <p>No legal route found.</p>
        ) : shortestBuildPlan.stoppedEarly ? (
          <p>{shortestBuildPlan.failureReason ?? "No legal route found."}</p>
        ) : shortestBuildPlan.steps.length === 0 ? (
          <p>No legal route found.</p>
        ) : (
          <>
            <h4>
              Recipe Found ({shortestBuildPlan.steps.length}{" "}
              {shortestBuildPlan.steps.length === 1 ? "step" : "steps"})
            </h4>

            <p>Target: {targetPersonaName}</p>

            {wantedSkills.length > 0 && (
              <p>Skills: {wantedSkills.join(", ")}</p>
            )}

            {selectedWantedTrait && <p>Trait: {selectedWantedTrait}</p>}

            <div className="recipe-list-scroll">
              {shortestBuildPlan.steps.map((step, stepIndex) => (
                <div key={stepIndex} className="recipe-card">
                  <h4>Step {stepIndex + 1}</h4>

                  {step.isSpecialFusion && step.specialIngredients ? (
                    <p>
                      Special Fusion:{" "}
                      {step.specialIngredients
                        .map((persona) => persona.name)
                        .join(" + ")}{" "}
                      = {step.result.name}
                    </p>
                  ) : (
                    <p>
                      {step.personaA.name} + {step.personaB.name} ={" "}
                      {step.result.name}
                    </p>
                  )}

                  {step.inheritedSkills.length > 0 && (
                    <p>
                      Skills carried:{" "}
                      {step.inheritedSkills
                        .map((skillName) =>
                          formatCarriedSkill(skillName, step.skillSources)
                        )
                        .join(", ")}
                    </p>
                  )}

                  {step.inheritedTrait && (
                    <p>Trait carried: {step.inheritedTrait}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {hasBuildProblem && (
          <div className="build-issue-card">
            <h3>Build Issue</h3>

            {buildValidation.warnings.map((warning, index) => (
              <p key={index}>{warning}</p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default BuildPlannerPage;
