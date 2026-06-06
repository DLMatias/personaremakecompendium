import fs from "fs";
import path from "path";

const outputFolder = path.join("public", "icons");

const icons = [
  { key: "physical", wikiTitle: "File:Melee Icon P5.png" },
  { key: "gun", wikiTitle: "File:Ranged Icon P5.png" },
  { key: "fire", wikiTitle: "File:Fire Icon P5.png" },
  { key: "ice", wikiTitle: "File:Ice Icon P5.png" },
  { key: "electric", wikiTitle: "File:Elec Icon P5.png" },
  { key: "wind", wikiTitle: "File:Wind Icon P5.png" },
  { key: "psy", wikiTitle: "File:Psy Icon P5.png" },
  { key: "nuclear", wikiTitle: "File:Nuclear Icon P5.png" },
  { key: "bless", wikiTitle: "File:Light Icon P5.png" },
  { key: "curse", wikiTitle: "File:Dark Icon P5.png" },
  { key: "almighty", wikiTitle: "File:Almighty Icon P5.png" },
  { key: "ailment", wikiTitle: "File:Ailment Icon P5.png" },
  { key: "healing", wikiTitle: "File:Healing Icon P5.png" },
  { key: "support", wikiTitle: "File:Assist Icon P5.png" },
  { key: "navigation", wikiTitle: "File:Nav Skill Icon P5.png" },
];

async function getImageUrl(wikiTitle) {
  const apiUrl =
    "https://megamitensei.fandom.com/api.php?action=query" +
    `&titles=${encodeURIComponent(wikiTitle)}` +
    "&prop=imageinfo" +
    "&iiprop=url" +
    "&format=json" +
    "&origin=*";

  const response = await fetch(apiUrl, {
    headers: {
      "User-Agent": "Persona5RoyalCompendiumProject/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed API request for ${wikiTitle}: ${response.status}`);
  }

  const data = await response.json();
  const pages = data.query?.pages ?? {};
  const page = Object.values(pages)[0];

  return page?.imageinfo?.[0]?.url ?? null;
}

async function downloadFile(url, outputPath) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Persona5RoyalCompendiumProject/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed download: ${url}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
}

async function main() {
  fs.mkdirSync(outputFolder, { recursive: true });

  for (const icon of icons) {
    console.log(`Finding ${icon.wikiTitle}...`);

    const imageUrl = await getImageUrl(icon.wikiTitle);

    if (!imageUrl) {
      console.log(`Could not find URL for ${icon.wikiTitle}`);
      continue;
    }

    const outputPath = path.join(outputFolder, `${icon.key}.png`);

    console.log(`Downloading ${icon.key}.png...`);
    await downloadFile(imageUrl, outputPath);

    console.log(`Saved ${outputPath}`);
  }

  const navigationPath = path.join(outputFolder, "navigation.png");

  if (fs.existsSync(navigationPath)) {
    fs.copyFileSync(navigationPath, path.join(outputFolder, "passive.png"));
    fs.copyFileSync(navigationPath, path.join(outputFolder, "trait.png"));
    console.log("Created passive.png from navigation.png");
    console.log("Created trait.png from navigation.png");
  }

  console.log("Icon download complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});