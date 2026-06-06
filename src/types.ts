export type Persona = {
  name: string;
  arcana: string;
  level: number;
  trait: string;
  isDlc: boolean;
  dlcPack: string | null;
  specialFusion: boolean;
  rare: boolean;
  inherits: string;

  stats: {
    strength: number;
    magic: number;
    endurance: number;
    agility: number;
    luck: number;
  };

  affinities: {
    physical: string;
    gun: string;
    fire: string;
    ice: string;
    electric: string;
    wind: string;
    psy: string;
    nuclear: string;
    bless: string;
    curse: string;
  };

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