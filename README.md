# Persona 5 Royal Compendium

This project began as a way to combine several Persona 5 Royal resources into a single application while giving me an opportunity to practice React, TypeScript, data processing, state management, and algorithm design.

The application provides a complete Persona 5 Royal compendium, fusion calculator, reverse fusion calculator, and build planner. While there are several Persona calculators available online, I wanted to create my own implementation and gain experience working with large datasets, search and filtering systems, custom algorithms, and frontend application development.

The project is built entirely as a client side web application and is deployed through GitHub Pages. No backend services, databases, or external APIs are required.

## Features

### Compendium

* Browse all Personas in Persona 5 Royal
* Search by Persona name
* Filter by Arcana
* Toggle DLC Personas
* Track owned Personas
* View stats, affinities, traits, skills, and acquisition information

### Skills Database

* Browse all Persona 5 Royal skills
* Search and filter skills
* View skill descriptions, costs, and acquisition information
* View Personas that learn each skill
* Pagination support for easier navigation

### Traits Database

* Browse all Persona traits
* Search and filter traits
* View trait descriptions
* View Personas associated with each trait
* Pagination support for easier navigation

### Fusion Calculator

* Calculate fusion results between two Personas
* DLC filtering support
* Owned Persona filtering support
* Displays resulting Persona information

### Reverse Fusion Calculator

* Search for a target Persona
* View valid fusion recipes
* Displays special fusion recipes
* DLC filtering support
* Owned Persona filtering support

### Build Planner

* Select a target Persona
* Select desired skills
* Select a desired trait
* Supports player level restrictions
* Supports DLC filtering
* Generates fusion paths toward a desired build
* Validates inheritance legality during planning

## Technical Highlights

### Data Processing

The project uses publicly available Persona 5 Royal data and converts it into structured JSON files that can be consumed by the React application. Custom scripts were created to download, validate, and transform the source data.

### Fusion Logic

Fusion calculations are performed entirely within the browser using Persona 5 Royal fusion formulas and Arcana relationships. The application supports both standard and special fusion recipes.

### Build Planning

The build planner was the most challenging component of the project. The planner searches for valid fusion paths while considering:

* Desired target Persona
* Desired inherited skills
* Desired traits
* Player level restrictions
* DLC inclusion settings
* Skill inheritance legality

The planner attempts to generate practical fusion routes while avoiding impossible inheritance combinations.

### User Interface

The interface was built using React, TypeScript, and CSS. The design focuses on navigating large amounts of data through searchable lists, filters, pagination, icons, and scrollable selection panels.

## Technologies Used

* React
* TypeScript
* Vite
* CSS
* Local Storage
* GitHub Pages

## Data Sources

Persona, Arcana, fusion, inheritance, and skill data were sourced from:

https://github.com/chinhodado/persona5_calculator

Skill data was generated from:

https://github.com/chinhodado/persona5_calculator/blob/master/data/SkillDataRoyal.js

Skill and affinity icons were sourced from:

https://megamitensei.fandom.com/wiki/Category:Persona_5_Icons

All Persona 5 Royal intellectual property belongs to Atlus and Sega.

## Deployment

This application is deployed through GitHub Pages and runs entirely in the browser. All calculations, filtering, searches, and build planning are performed client side.

The project does not require a backend server, database, user accounts, or external APIs. Owned Persona tracking is stored locally within the user's browser using Local Storage.

## Live Demo

Live Application:

https://dlmatias.github.io/persona5royal-compendiumtool/

Source Code:

https://github.com/DLMatias/persona5royal-compendiumtool

## Disclaimer

This is a personal portfolio project created to practice software development, frontend development, data processing, and algorithm design. Persona 5 Royal, Persona, Atlus, and Sega are trademarks and property of their respective owners. This project is not affiliated with or endorsed by Atlus or Sega.
