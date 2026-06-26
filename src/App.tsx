import { useState } from "react";
import { defaultGame, games } from "./data/games";
import PersonaList from "./components/PersonaList";
import PersonaDetails from "./components/PersonaDetails";
import SkillsPage from "./components/SkillsPage";
import TraitsPage from "./components/TraitsPage";
import FusionPage from "./components/FusionPage";
import ReverseFusionPage from "./components/ReverseFusionPage";
import BuildPlannerPage from "./components/BuildPlannerPage";
import type { GameData, Persona } from "./types";
import "./App.css";

type OwnedPersonas = {
  [personaName: string]: boolean;
};

type OwnedPersonasByGame = {
  [gameId: string]: OwnedPersonas;
};

type AppTab =
  | "Compendium"
  | "Skills"
  | "Traits"
  | "Fusion"
  | "Reverse Fusion"
  | "Build Planner";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOwnedPersonas(value: unknown): value is OwnedPersonas {
  return (
    isObject(value) &&
    Object.values(value).every((owned) => typeof owned === "boolean")
  );
}

function isOwnedPersonasByGame(value: unknown): value is OwnedPersonasByGame {
  return (
    isObject(value) &&
    Object.values(value).every((ownedPersonas) => isOwnedPersonas(ownedPersonas))
  );
}

function loadOwnedPersonasByGame() {
  const savedData = localStorage.getItem("ownedPersonas");

  if (!savedData) {
    return {};
  }

  try {
    const parsedData: unknown = JSON.parse(savedData);

    if (isOwnedPersonasByGame(parsedData)) {
      return parsedData;
    }

    if (isOwnedPersonas(parsedData)) {
      return {
        [defaultGame.id]: parsedData,
      };
    }
  } catch {
    localStorage.removeItem("ownedPersonas");
  }

  return {};
}

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("Compendium");
  const [activeGameId, setActiveGameId] = useState(defaultGame.id);
  const activeGame =
    games.find((game) => game.id === activeGameId) ?? defaultGame;
  const [selectedPersonaName, setSelectedPersonaName] = useState(
    activeGame.personas[0].name
  );
  const [searchText, setSearchText] = useState("");

  const [ownedPersonasByGame, setOwnedPersonasByGame] =
    useState<OwnedPersonasByGame>(loadOwnedPersonasByGame);

  const availableTabs = getAvailableTabs(activeGame);
  const selectedPersona =
    activeGame.personas.find((persona) => persona.name === selectedPersonaName) ??
    activeGame.personas[0];
  const ownedPersonas = ownedPersonasByGame[activeGame.id] ?? {};

  function selectGame(gameId: string) {
    const nextGame = games.find((game) => game.id === gameId) ?? defaultGame;

    setActiveGameId(nextGame.id);
    setSelectedPersonaName(nextGame.personas[0].name);
    setSearchText("");

    if (!getAvailableTabs(nextGame).includes(activeTab)) {
      setActiveTab("Compendium");
    }
  }

  function selectPersona(persona: Persona) {
    setSelectedPersonaName(persona.name);
  }

  function toggleOwned(personaName: string) {
    const updatedOwnedPersonasForGame = {
      ...ownedPersonas,
      [personaName]: !ownedPersonas[personaName],
    };

    const updatedOwnedPersonasByGame = {
      ...ownedPersonasByGame,
      [activeGame.id]: updatedOwnedPersonasForGame,
    };

    setOwnedPersonasByGame(updatedOwnedPersonasByGame);

    localStorage.setItem(
      "ownedPersonas",
      JSON.stringify(updatedOwnedPersonasByGame)
    );
  }

  return (
    <div className={`app game-theme-${activeGame.id}`}>
      <header className="app-header">
        <div className="app-title-row">
          <div>
            <p className="game-kicker">{activeGame.shortName}</p>
            <h1 className="app-title">Persona Compendium Toolkit</h1>
          </div>

          <select
            className="game-select"
            value={activeGame.id}
            onChange={(event) => selectGame(event.target.value)}
          >
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </div>

        <nav className="tab-bar">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as AppTab)}
              className={
                activeTab === tab ? "tab-button active" : "tab-button"
              }
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      {activeTab === "Compendium" && (
        <div className="content-grid">
          <PersonaList
            personas={activeGame.personas}
            arcanas={activeGame.arcanas}
            selectedPersona={selectedPersona}
            ownedPersonas={ownedPersonas}
            searchText={searchText}
            setSearchText={setSearchText}
            setSelectedPersona={selectPersona}
          />

          <PersonaDetails
            selectedPersona={selectedPersona}
            skills={activeGame.skills}
            affinities={activeGame.affinities}
            showTreasureDemon={activeGame.rareFusion.rarePersonas.length > 0}
            ownedPersonas={ownedPersonas}
            toggleOwned={toggleOwned}
          />
        </div>
      )}

      {activeTab === "Skills" && (
        <SkillsPage
          key={activeGame.id}
          gameData={activeGame}
          ownedPersonas={ownedPersonas}
          toggleOwned={toggleOwned}
        />
      )}

      {activeTab === "Traits" && activeGame.hasTraits && (
        <TraitsPage
          key={activeGame.id}
          gameData={activeGame}
          ownedPersonas={ownedPersonas}
          toggleOwned={toggleOwned}
        />
      )}

      {activeTab === "Fusion" && (
        <FusionPage
          key={activeGame.id}
          gameData={activeGame}
          ownedPersonas={ownedPersonas}
          toggleOwned={toggleOwned}
        />
      )}

      {activeTab === "Reverse Fusion" && (
        <ReverseFusionPage
          key={activeGame.id}
          gameData={activeGame}
          ownedPersonas={ownedPersonas}
          toggleOwned={toggleOwned}
        />
      )}

      {activeTab === "Build Planner" && activeGame.supportsBuildPlanner && (
        <BuildPlannerPage
          key={activeGame.id}
          gameData={activeGame}
          ownedPersonas={ownedPersonas}
          toggleOwned={toggleOwned}
        />
      )}
    </div>
  );
}

function getAvailableTabs(gameData: GameData): AppTab[] {
  return [
    "Compendium",
    "Skills",
    ...(gameData.hasTraits ? (["Traits"] as AppTab[]) : []),
    "Fusion",
    "Reverse Fusion",
    ...(gameData.supportsBuildPlanner ? (["Build Planner"] as AppTab[]) : []),
  ];
}

export default App;
