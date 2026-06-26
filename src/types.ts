export type Persona = {
  name: string;
  arcana: string;
  level: number;
  trait: string | null;
  isDlc: boolean;
  dlcPack: string | null;
  specialFusion: boolean;
  rare: boolean;
  inherits: string;
  inheritCode?: string;

  stats: {
    strength: number;
    magic: number;
    endurance: number;
    agility: number;
    luck: number;
  };

  affinities: Record<string, string>;

  skills: {
    name: string;
    level: number;
  }[];

  locations: {
    method: string;
    area: string;
    notes: string;
  }[];
};

export type SkillInfo = {
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

export type SkillsData = {
  [skillName: string]: SkillInfo;
};

export type TraitsData = {
  [traitName: string]: {
    description: string;
  };
};

export type FusionChart = {
  [arcanaA: string]: {
    [arcanaB: string]: string;
  };
};

export type RareFusionData = {
  rarePersonas: string[];
  modifiers: {
    [arcana: string]: number[];
  };
};

export type SpecialFusions = {
  [personaName: string]: string[];
};

export type AffinityRow = {
  key: string;
  label: string;
  icon: string;
};

export type GameData = {
  id: string;
  name: string;
  shortName: string;
  personas: Persona[];
  arcanas: string[];
  skills: SkillsData;
  traits: TraitsData;
  fusionChart: FusionChart;
  rareFusion: RareFusionData;
  specialFusions: SpecialFusions;
  affinities: AffinityRow[];
  hasTraits: boolean;
  supportsBuildPlanner: boolean;
};
