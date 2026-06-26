import p5ArcanasData from "./arcanas.json";
import p5FusionChartData from "./fusionChart.json";
import p5PersonasData from "./personas.json";
import p5RareFusionData from "./rareFusion.json";
import p5SkillsData from "./skills.json";
import p5SpecialFusionsData from "./specialFusions.json";
import p5TraitsData from "./traits.json";
import p3rArcanasData from "./p3r/arcanas.json";
import p3rFusionChartData from "./p3r/fusionChart.json";
import p3rPersonasData from "./p3r/personas.json";
import p3rRareFusionData from "./p3r/rareFusion.json";
import p3rSkillsData from "./p3r/skills.json";
import p3rSpecialFusionsData from "./p3r/specialFusions.json";
import p3rTraitsData from "./p3r/traits.json";
import type {
  AffinityRow,
  FusionChart,
  GameData,
  Persona,
  RareFusionData,
  SkillsData,
  SpecialFusions,
  TraitsData,
} from "../types";

function iconPath(iconName: string) {
  return `${import.meta.env.BASE_URL}icons/${iconName}.png`;
}

const p5Affinities: AffinityRow[] = [
  { key: "physical", label: "Physical", icon: iconPath("physical") },
  { key: "gun", label: "Gun", icon: iconPath("gun") },
  { key: "fire", label: "Fire", icon: iconPath("fire") },
  { key: "ice", label: "Ice", icon: iconPath("ice") },
  { key: "electric", label: "Electric", icon: iconPath("electric") },
  { key: "wind", label: "Wind", icon: iconPath("wind") },
  { key: "psy", label: "Psy", icon: iconPath("psy") },
  { key: "nuclear", label: "Nuclear", icon: iconPath("nuclear") },
  { key: "bless", label: "Bless", icon: iconPath("bless") },
  { key: "curse", label: "Curse", icon: iconPath("curse") },
];

const p3rAffinities: AffinityRow[] = [
  { key: "slash", label: "Slash", icon: iconPath("p3r-slash") },
  { key: "strike", label: "Strike", icon: iconPath("p3r-strike") },
  { key: "pierce", label: "Pierce", icon: iconPath("p3r-pierce") },
  { key: "fire", label: "Fire", icon: iconPath("fire") },
  { key: "ice", label: "Ice", icon: iconPath("ice") },
  { key: "electric", label: "Electric", icon: iconPath("electric") },
  { key: "wind", label: "Wind", icon: iconPath("wind") },
  { key: "light", label: "Light", icon: iconPath("p3r-light") },
  { key: "dark", label: "Dark", icon: iconPath("p3r-dark") },
  { key: "almighty", label: "Almighty", icon: iconPath("almighty") },
];

export const games: GameData[] = [
  {
    id: "p5r",
    name: "Persona 5 Royal",
    shortName: "P5R",
    personas: p5PersonasData as Persona[],
    arcanas: p5ArcanasData as string[],
    skills: p5SkillsData as SkillsData,
    traits: p5TraitsData as TraitsData,
    fusionChart: p5FusionChartData as FusionChart,
    rareFusion: p5RareFusionData as RareFusionData,
    specialFusions: p5SpecialFusionsData as SpecialFusions,
    affinities: p5Affinities,
    hasTraits: true,
    supportsBuildPlanner: true,
  },
  {
    id: "p3r",
    name: "Persona 3 Reload",
    shortName: "P3R",
    personas: p3rPersonasData as Persona[],
    arcanas: p3rArcanasData as string[],
    skills: p3rSkillsData as SkillsData,
    traits: p3rTraitsData as TraitsData,
    fusionChart: p3rFusionChartData as FusionChart,
    rareFusion: p3rRareFusionData as RareFusionData,
    specialFusions: p3rSpecialFusionsData as SpecialFusions,
    affinities: p3rAffinities,
    hasTraits: false,
    supportsBuildPlanner: true,
  },
];

export const defaultGame = games[0];
