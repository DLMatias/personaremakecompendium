# Persona Compendium Toolkit

Persona Compendium Toolkit is a client-side React app for browsing Persona compendium data, skills, fusion routes, and build-planning tools across supported Persona games.

The project began as a Persona 5 Royal compendium and fusion calculator, then expanded into a multi-game toolkit with support for Persona 5 Royal and Persona 3 Reload. It is a personal portfolio project focused on React, TypeScript, data processing, state management, browser-based fusion algorithms, and game-specific UI design.

## Supported Games

* Persona 5 Royal
* Persona 3 Reload

## Features

### Game Library Switcher

* Switch between supported games from the app header
* Keep owned Persona tracking separated per game
* Show only the tools that apply to the selected game
* Apply a distinct visual theme for each game section

### Compendium

* Browse Personas by game
* Search by Persona name
* Filter by Arcana, DLC status, ownership, and learned skill
* View stats, affinities, skills, acquisition notes, and inheritance type
* Open Persona entries from linked names throughout the app

### Skills Database

* Browse skills for the selected game
* Search and filter skills by type
* View skill descriptions, costs, cards, fusion sources, and learned-by lists
* Exclude Persona 3 Reload Theurgy skills from the normal skill database
* Open linked Persona entries from skill source lists

### Traits Database

* Browse Persona traits for games that support traits
* Search and filter traits
* View trait descriptions and associated Personas

### Fusion Explorer

* Select one Persona and view every Persona it can help create
* Include normal and special fusion results
* Filter by DLC and owned Personas
* Open result and component Persona entries directly from the fusion list

### Reverse Fusion Calculator

* Search for a target Persona
* View normal and special fusion recipes
* Filter recipes by DLC, owned Personas, and component Persona name
* Search within recipe components to check whether a specific Persona can help make the selected target

### Build Planner

* Plan fusion routes toward selected skills and traits where supported
* Supports player level restrictions and DLC filtering
* Tracks inherited skill sources through each fusion step
* Validates route legality using each game's inheritance rules
* Supports Persona 5 Royal traits and Persona 3 Reload's traitless build flow

## Technical Highlights

### Data Processing

The app converts public Persona data into structured JSON files consumed directly by the React application. Persona 5 Royal and Persona 3 Reload data live as separate game profiles so shared UI can render the right compendium, skills, fusion chart, special recipes, affinities, and inheritance behavior.

### Fusion Logic

Fusion calculations run entirely in the browser. The fusion engine accepts the active game profile, so forward and reverse fusion use the selected game's Arcana chart, Persona roster, rare fusion rules, and special recipes.

### Build Planning

The build planner searches for valid fusion paths while considering desired skills, requested traits when available, player level restrictions, DLC inclusion, special fusions, and game-specific inheritance legality.

### User Interface

The interface uses React, TypeScript, and CSS, with searchable lists, filters, pagination, icons, scrollable panels, reusable Persona entry popups, and separate visual themes for each supported game.

## Technologies Used

* React
* TypeScript
* Vite
* CSS
* Local Storage
* GitHub Pages

## Data Sources

Persona 5 Royal data was sourced from:

https://github.com/chinhodado/persona5_calculator

Persona 3 Reload data was sourced from:

https://github.com/aqiu384/megaten-fusion-tool

Skill and affinity icons were sourced from:

https://megamitensei.fandom.com/wiki/Category:Persona_5_Icons

https://megatenwiki.com/wiki/Category:Persona_3_Reload_Icons

Data has been transformed for this app and may not perfectly match every in-game edge case.

## Deployment

This application is deployed through GitHub Pages and runs entirely in the browser. It does not require a backend server, database, user accounts, or external APIs.

Owned Persona tracking is stored locally in the user's browser using Local Storage.

## Live Demo

Live Application:

https://dlmatias.github.io/personaremakecompendium/

Source Code:

https://github.com/DLMatias/personaremakecompendium

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Disclaimer

Persona Compendium Toolkit is a personal portfolio project created to practice software development, frontend development, data processing, and algorithm design. Persona, Atlus, and Sega are trademarks and property of their respective owners. This project is not affiliated with or endorsed by Atlus or Sega.
