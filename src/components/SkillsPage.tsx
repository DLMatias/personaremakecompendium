import { useMemo, useState } from "react";
import skillsData from "../data/skills.json";
import personasData from "../data/personas.json";
import type { Persona } from "../types";

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

const skills = skillsData as SkillsData;
const personas = personasData as Persona[];

const itemsPerPage = 20;

function getIconPath(element: string) {
  return `${import.meta.env.BASE_URL}icons/${element.toLowerCase()}.png`;
}

function SkillsPage() {
  const [searchText, setSearchText] = useState("");
  const [selectedElement, setSelectedElement] = useState("All");
  const [sortOption, setSortOption] = useState("Name A-Z");
  const [currentPage, setCurrentPage] = useState(1);

  const elementOptions = useMemo(() => {
    const elements = Object.values(skills)
      .map((skill) => skill.element)
      .filter((element) => element !== "Trait");

    return ["All", ...Array.from(new Set(elements)).sort()];
  }, []);

  const filteredSkills = useMemo(() => {
    const results = Object.entries(skills)
      .filter(([skillName, skill]) => {
        const matchesSearch = skillName
          .toLowerCase()
          .includes(searchText.toLowerCase());

        const matchesElement =
          selectedElement === "All" || skill.element === selectedElement;

        return skill.element !== "Trait" && matchesSearch && matchesElement;
      })
      .sort(([skillNameA, skillA], [skillNameB, skillB]) => {
        if (sortOption === "Name Z-A") {
          return skillNameB.localeCompare(skillNameA);
        }

        if (sortOption === "Type A-Z") {
          return skillA.element.localeCompare(skillB.element);
        }

        if (sortOption === "Type Z-A") {
          return skillB.element.localeCompare(skillA.element);
        }

        return skillNameA.localeCompare(skillNameB);
      });

    return results;
  }, [searchText, selectedElement, sortOption]);

  const totalPages = Math.max(1, Math.ceil(filteredSkills.length / itemsPerPage));
  const pageStart = (currentPage - 1) * itemsPerPage;
  const visibleSkills = filteredSkills.slice(pageStart, pageStart + itemsPerPage);

  function updateSearchText(value: string) {
    setSearchText(value);
    setCurrentPage(1);
  }

  function updateSelectedElement(value: string) {
    setSelectedElement(value);
    setCurrentPage(1);
  }

  function updateSortOption(value: string) {
    setSortOption(value);
    setCurrentPage(1);
  }

  function getPersonasThatLearnSkill(skillName: string) {
    return personas
      .map((persona) => {
        const learnedSkill = persona.skills.find(
          (skill) => skill.name === skillName
        );

        if (!learnedSkill) {
          return null;
        }

        return {
          personaName: persona.name,
          level: learnedSkill.level,
        };
      })
      .filter(
        (
          result
        ): result is {
          personaName: string;
          level: number;
        } => result !== null
      )
      .sort((a, b) => a.level - b.level);
  }

  return (
    <section className="library-page">
      <div className="library-header">
        <div>
          <h2>Skills</h2>
          <p>{filteredSkills.length} skills found</p>
        </div>
      </div>

      <div className="library-controls">
        <input
          className="form-control"
          type="text"
          placeholder="Search Skill..."
          value={searchText}
          onChange={(event) => updateSearchText(event.target.value)}
        />

        <select
          className="form-control"
          value={selectedElement}
          onChange={(event) => updateSelectedElement(event.target.value)}
        >
          {elementOptions.map((element) => (
            <option key={element} value={element}>
              {element}
            </option>
          ))}
        </select>

        <select
          className="form-control"
          value={sortOption}
          onChange={(event) => updateSortOption(event.target.value)}
        >
          <option>Name A-Z</option>
          <option>Name Z-A</option>
          <option>Type A-Z</option>
          <option>Type Z-A</option>
        </select>
      </div>

      <div className="pagination-row">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>

      <div className="library-grid">
        {visibleSkills.map(([skillName, skill]) => {
          const learnedBy = getPersonasThatLearnSkill(skillName);

          return (
            <article key={skillName} className="library-card">
              <div className="library-card-header">
                <img
                  src={getIconPath(skill.element)}
                  alt={skill.element}
                  title={skill.element}
                  className="skill-type-icon large"
                />

                <div>
                  <h3>{skillName}</h3>
                  <p>{skill.cost}</p>
                </div>
              </div>

              <p>{skill.description}</p>

              {skill.uniqueTo && <p>Unique To: {skill.uniqueTo}</p>}
              {skill.skillCard && <p>Skill Card: {skill.skillCard}</p>}
              {skill.talk && <p>Negotiation: {skill.talk}</p>}

              {skill.fuseFrom.length > 0 && (
                <p>Skill Card Fusion: {skill.fuseFrom.join(", ")}</p>
              )}

              <h4>Learned By</h4>

              <div className="compact-list">
                {learnedBy.length > 0 ? (
                  learnedBy.slice(0, 12).map((result) => (
                    <p key={`${skillName}-${result.personaName}`}>
                      {result.personaName} ; Level {result.level}
                    </p>
                  ))
                ) : (
                  <p>No Personas in the current data learn this skill.</p>
                )}

                {learnedBy.length > 12 && (
                  <p>And {learnedBy.length - 12} more...</p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default SkillsPage;