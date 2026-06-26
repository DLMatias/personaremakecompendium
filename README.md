# Persona Compendium Toolkit

Persona Compendium Toolkit is a client-side React app for browsing Persona compendium data, skills, and fusion routes across supported Persona games.

The project began as a Persona 5 Royal compendium and fusion calculator, then expanded to include Persona 3 Reload. It is still a personal portfolio project focused on React, TypeScript, data processing, state management, and browser-based fusion algorithms.

DISCLAIMER: None of this information is verified in game. The app uses existing public data sources and transforms them into local JSON files.

## Supported Games

* Persona 5 Royal
* Persona 3 Reload

## Features

### Game Library Switcher

* Switch between supported games from the app header
* Keep owned Persona tracking separated per game
* Show only the tools that make sense for the selected game

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
* Open linked Persona entries from skill source lists

### Traits Database

* Browse Persona traits where the selected game supports traits
* Search and filter traits
* View trait descriptions and associated Personas

### Fusion Calculator

* Calculate fusion results between two Personas
* Filter by DLC and owned Personas
* View the resulting Persona entry

### Reverse Fusion Calculator

* Search for a target Persona
* View normal and special fusion recipes
* Filter recipes by DLC, owned Personas, and component Persona name

### Build Planner

* Plan Persona 5 Royal fusion routes toward selected skills and traits
* Supports player level restrictions and DLC filtering
* Tracks inherited skill sources through each fusion step
* Validates route legality during planning

## Technical Highlights

### Data Processing

The app converts public Persona data into structured JSON files consumed directly by the React application. Persona 5 Royal and Persona 3 Reload data live as separate game profiles so shared UI can render the right compendium, skills, fusion chart, and special recipes.

### Fusion Logic

Fusion calculations run entirely in the browser. The fusion engine accepts the active game profile, so forward and reverse fusion use the selected game's Arcana chart, Persona roster, rare fusion rules, and special recipes.

### Build Planning

The build planner searches for valid Persona 5 Royal fusion paths while considering desired skills, requested traits, player level restrictions, DLC inclusion, and inheritance legality.

### User Interface

The interface uses React, TypeScript, and CSS, with searchable lists, filters, pagination, icons, scrollable panels, and reusable Persona entry popups.

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

All Persona intellectual property belongs to Atlus and Sega.

## Deployment

This application is deployed through GitHub Pages and runs entirely in the browser. It does not require a backend server, database, user accounts, or external APIs.

Owned Persona tracking is stored locally in the user's browser using Local Storage.

## Live Demo

Live Application:

https://dlmatias.github.io/persona5royal-compendiumtool/

Source Code:

https://github.com/DLMatias/persona5royal-compendiumtool

## Disclaimer

Persona Compendium Toolkit is a personal portfolio project created to practice software development, frontend development, data processing, and algorithm design. Persona, Atlus, and Sega are trademarks and property of their respective owners. This project is not affiliated with or endorsed by Atlus or Sega.
