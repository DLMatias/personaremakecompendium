import { useState } from "react";
import personasData from "./data/personas.json";
import PersonaList from "./components/PersonaList";
import PersonaDetails from "./components/PersonaDetails";
import SkillsPage from "./components/SkillsPage";
import TraitsPage from "./components/TraitsPage";
import FusionPage from "./components/FusionPage";
import ReverseFusionPage from "./components/ReverseFusionPage";
import BuildPlannerPage from "./components/BuildPlannerPage";
import type { Persona } from "./types";
import "./App.css";

const personas = personasData as Persona[];

type OwnedPersonas = {
  [personaName: string]: boolean;
};

type AppTab =
  | "Compendium"
  | "Skills"
  | "Traits"
  | "Fusion"
  | "Reverse Fusion"
  | "Build Planner";

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("Compendium");
  const [selectedPersona, setSelectedPersona] = useState<Persona>(personas[0]);
  const [searchText, setSearchText] = useState("");

  const [ownedPersonas, setOwnedPersonas] = useState<OwnedPersonas>(() => {
    const savedData = localStorage.getItem("ownedPersonas");

    if (savedData) {
      return JSON.parse(savedData);
    }

    return {};
  });

  function toggleOwned(personaName: string) {
    const updatedOwnedPersonas = {
      ...ownedPersonas,
      [personaName]: !ownedPersonas[personaName],
    };

    setOwnedPersonas(updatedOwnedPersonas);

    localStorage.setItem(
      "ownedPersonas",
      JSON.stringify(updatedOwnedPersonas)
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Persona 5 Royal Compendium</h1>

        <nav className="tab-bar">
          {[
            "Compendium",
            "Skills",
            "Traits",
            "Fusion",
            "Reverse Fusion",
            "Build Planner",
          ].map((tab) => (
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
            personas={personas}
            selectedPersona={selectedPersona}
            ownedPersonas={ownedPersonas}
            searchText={searchText}
            setSearchText={setSearchText}
            setSelectedPersona={setSelectedPersona}
          />

          <PersonaDetails
            selectedPersona={selectedPersona}
            ownedPersonas={ownedPersonas}
            toggleOwned={toggleOwned}
          />
        </div>
      )}

      {activeTab === "Skills" && <SkillsPage />}

      {activeTab === "Traits" && <TraitsPage />}

      {activeTab === "Fusion" && <FusionPage ownedPersonas={ownedPersonas} />}

      {activeTab === "Reverse Fusion" && (
        <ReverseFusionPage ownedPersonas={ownedPersonas} />
      )}

      {activeTab === "Build Planner" && <BuildPlannerPage />}
    </div>
  );
}

export default App;