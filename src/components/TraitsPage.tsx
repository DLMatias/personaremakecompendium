import { useMemo, useState } from "react";
import { PersonaNameButton } from "./PersonaPopup";
import type { GameData } from "../types";

type OwnedPersonas = {
  [personaName: string]: boolean;
};

type TraitsPageProps = {
  gameData: GameData;
  ownedPersonas: OwnedPersonas;
  toggleOwned: (personaName: string) => void;
};

const itemsPerPage = 20;

function TraitsPage({ gameData, ownedPersonas, toggleOwned }: TraitsPageProps) {
  const [searchText, setSearchText] = useState("");
  const [sortOption, setSortOption] = useState("Name A-Z");
  const [currentPage, setCurrentPage] = useState(1);
  const typedTraits = gameData.traits;
  const typedPersonas = gameData.personas;

  const filteredTraits = useMemo(() => {
    return Object.entries(typedTraits)
      .filter(([traitName]) =>
        traitName.toLowerCase().includes(searchText.toLowerCase())
      )
      .sort(([traitNameA], [traitNameB]) => {
        if (sortOption === "Name Z-A") {
          return traitNameB.localeCompare(traitNameA);
        }

        return traitNameA.localeCompare(traitNameB);
      });
  }, [searchText, sortOption, typedTraits]);

  const totalPages = Math.max(1, Math.ceil(filteredTraits.length / itemsPerPage));
  const pageStart = (currentPage - 1) * itemsPerPage;
  const visibleTraits = filteredTraits.slice(pageStart, pageStart + itemsPerPage);

  function updateSearchText(value: string) {
    setSearchText(value);
    setCurrentPage(1);
  }

  function updateSortOption(value: string) {
    setSortOption(value);
    setCurrentPage(1);
  }

  function getPersonasWithTrait(traitName: string) {
    return typedPersonas
      .filter((persona) => persona.trait === traitName)
      .sort((a, b) => a.level - b.level);
  }

  return (
    <section className="library-page">
      <div className="library-header">
        <div>
          <h2>Traits</h2>
          <p>{filteredTraits.length} traits found</p>
        </div>
      </div>

      <div className="library-controls">
        <input
          className="form-control"
          type="text"
          placeholder="Search Trait..."
          value={searchText}
          onChange={(event) => updateSearchText(event.target.value)}
        />

        <select
          className="form-control"
          value={sortOption}
          onChange={(event) => updateSortOption(event.target.value)}
        >
          <option>Name A-Z</option>
          <option>Name Z-A</option>
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
        {visibleTraits.map(([traitName, traitInfo]) => {
          const personasWithTrait = getPersonasWithTrait(traitName);

          return (
            <article key={traitName} className="library-card">
              <div className="library-card-header">
                <img
                  src={`${import.meta.env.BASE_URL}icons/trait.png`}
                  alt="Trait"
                  title="Trait"
                  className="skill-type-icon large"
                />

                <div>
                  <h3>{traitName}</h3>
                  <p>Trait</p>
                </div>
              </div>

              <p>{traitInfo.description}</p>

              <h4>Found On</h4>

              <div className="compact-list">
                {personasWithTrait.length > 0 ? (
                  personasWithTrait.slice(0, 12).map((persona) => (
                    <p key={persona.name}>
                      <PersonaNameButton
                        personaName={persona.name}
                        persona={persona}
                        gameData={gameData}
                        ownedPersonas={ownedPersonas}
                        toggleOwned={toggleOwned}
                      />{" "}
                      ; Level {persona.level} ; {persona.arcana}
                      {persona.isDlc ? " ; DLC" : ""}
                    </p>
                  ))
                ) : (
                  <p>No Personas in the current data have this trait.</p>
                )}

                {personasWithTrait.length > 12 && (
                  <p>And {personasWithTrait.length - 12} more...</p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default TraitsPage;
