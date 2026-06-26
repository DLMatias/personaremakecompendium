import { Fragment, useState } from "react";
import { PersonaNameButton } from "./PersonaPopup";
import { getIconPath } from "../utils/icons";
import {
  canPersonaInheritSkill,
  findShortestBuildPlanToTarget,
  validateBuildPlan,
} from "../utils/buildPlanner";
import type { GameData } from "../types";
import type { SkillLearningSource } from "../utils/buildPlanner";

type OwnedPersonas = {
  [personaName: string]: boolean;
};

type BuildPlannerPageProps = {
  gameData: GameData;
  ownedPersonas: OwnedPersonas;
  toggleOwned: (personaName: string) => void;
};

function getCarriedSkillSource(
  skillName: string,
  skillSources: SkillLearningSource[]
) {
  return skillSources.find((item) => item.skillName === skillName) ?? null;
}

function BuildPlannerPage({
  gameData,
  ownedPersonas,
  toggleOwned,
}: BuildPlannerPageProps) {
  const personas = gameData.personas;
  const skills = gameData.skills;
  const traits = gameData.traits;
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
          skillName,
          gameData
        );

        return isNotTrait && matchesSearch && targetCanInherit;
      })
    : [];

  const traitSearchResults = targetPersona && gameData.hasTraits
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
    gameData.hasTraits &&
    wantedTrait &&
    availablePersonas.some((persona) => persona.trait === wantedTrait)
      ? wantedTrait
      : "";

  const activeWantedTrait = gameData.hasTraits
    ? selectedWantedTrait || undefined
    : undefined;

  const shortestBuildPlan =
    targetPersona && (wantedSkills.length > 0 || activeWantedTrait)
      ? findShortestBuildPlanToTarget({
          gameData,
          targetPersonaName,
          desiredSkills: wantedSkills,
          desiredTrait: activeWantedTrait,
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
    activeWantedTrait,
    playerLevel,
    gameData
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
    if (
      !targetPersona ||
      !canPersonaInheritSkill(targetPersona, skillName, gameData)
    ) {
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
            Select a target Persona first. The skill list will update to show
            valid options for that Persona.
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
          <p>
            Selected:{" "}
            {targetPersona ? (
              <PersonaNameButton
                personaName={targetPersona.name}
                persona={targetPersona}
                gameData={gameData}
                ownedPersonas={ownedPersonas}
                toggleOwned={toggleOwned}
              />
            ) : (
              "None"
            )}
          </p>

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

        {gameData.hasTraits && (
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
        )}
      </div>

      {targetPersona && (
        <div className="result-panel">
          <h3>
            <PersonaNameButton
              personaName={targetPersona.name}
              persona={targetPersona}
              gameData={gameData}
              ownedPersonas={ownedPersonas}
              toggleOwned={toggleOwned}
            />
          </h3>

          <div className="info-grid">
            <p>Arcana: {targetPersona.arcana}</p>
            <p>Level: {targetPersona.level}</p>
            {gameData.hasTraits && <p>Current Trait: {targetPersona.trait}</p>}
            <p>Inherits: {targetPersona.inherits}</p>
          </div>
        </div>
      )}

      <div className="result-panel">
        <h3>Build Plan</h3>

        {!targetPersona ? (
          <p>Select a target Persona to begin planning.</p>
        ) : wantedSkills.length === 0 && !activeWantedTrait ? (
          <p>
            Select at least one wanted skill
            {gameData.hasTraits ? " or trait" : ""} to begin planning.
          </p>
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

            <p>
              Target:{" "}
              <PersonaNameButton
                personaName={targetPersonaName}
                persona={targetPersona}
                gameData={gameData}
                ownedPersonas={ownedPersonas}
                toggleOwned={toggleOwned}
              />
            </p>

            {wantedSkills.length > 0 && (
              <p>Skills: {wantedSkills.join(", ")}</p>
            )}

            {activeWantedTrait && <p>Trait: {activeWantedTrait}</p>}

            <div className="recipe-list-scroll">
              {shortestBuildPlan.steps.map((step, stepIndex) => (
                <div key={stepIndex} className="recipe-card">
                  <h4>Step {stepIndex + 1}</h4>

                  {step.isSpecialFusion && step.specialIngredients ? (
                    <p>
                      Special Fusion:{" "}
                      {step.specialIngredients.map((persona, index) => (
                        <Fragment key={persona.name}>
                          {index > 0 && " + "}
                          <PersonaNameButton
                            personaName={persona.name}
                            persona={persona}
                            gameData={gameData}
                            ownedPersonas={ownedPersonas}
                            toggleOwned={toggleOwned}
                          />
                        </Fragment>
                      ))}{" "}
                      ={" "}
                      <PersonaNameButton
                        personaName={step.result.name}
                        persona={step.result}
                        gameData={gameData}
                        ownedPersonas={ownedPersonas}
                        toggleOwned={toggleOwned}
                      />
                    </p>
                  ) : (
                    <p>
                      <PersonaNameButton
                        personaName={step.personaA.name}
                        persona={step.personaA}
                        gameData={gameData}
                        ownedPersonas={ownedPersonas}
                        toggleOwned={toggleOwned}
                      />{" "}
                      +{" "}
                      <PersonaNameButton
                        personaName={step.personaB.name}
                        persona={step.personaB}
                        gameData={gameData}
                        ownedPersonas={ownedPersonas}
                        toggleOwned={toggleOwned}
                      />{" "}
                      ={" "}
                      <PersonaNameButton
                        personaName={step.result.name}
                        persona={step.result}
                        gameData={gameData}
                        ownedPersonas={ownedPersonas}
                        toggleOwned={toggleOwned}
                      />
                    </p>
                  )}

                  {step.inheritedSkills.length > 0 && (
                    <p>
                      Skills carried:{" "}
                      {step.inheritedSkills.map((skillName, index) => {
                        const source = getCarriedSkillSource(
                          skillName,
                          step.skillSources
                        );

                        return (
                          <Fragment key={skillName}>
                            {index > 0 && ", "}
                            {skillName}
                            {source && (
                              <>
                                {" ("}
                                <PersonaNameButton
                                  personaName={source.personaName}
                                  gameData={gameData}
                                  ownedPersonas={ownedPersonas}
                                  toggleOwned={toggleOwned}
                                />{" "}
                                Lv {source.level})
                              </>
                            )}
                          </Fragment>
                        );
                      })}
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
