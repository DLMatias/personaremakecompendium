const iconAliases: Record<string, string> = {
  slash: "p3r-slash",
  strike: "p3r-strike",
  pierce: "p3r-pierce",
  physical: "physical",
  gun: "gun",
  fire: "fire",
  ice: "ice",
  electric: "electric",
  elec: "electric",
  wind: "wind",
  light: "p3r-light",
  bless: "bless",
  dark: "p3r-dark",
  curse: "curse",
  psy: "psy",
  nuclear: "nuclear",
  nuke: "nuclear",
  almighty: "almighty",
  ailment: "ailment",
  healing: "healing",
  recovery: "healing",
  support: "support",
  passive: "passive",
  trait: "trait",
};

export function getIconPath(element: string) {
  const iconName = iconAliases[element.toLowerCase()] ?? "passive";
  return `${import.meta.env.BASE_URL}icons/${iconName}.png`;
}
