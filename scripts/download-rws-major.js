import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { pipeline } from "node:stream/promises";

const overwrite = process.argv.includes("--overwrite");
const rootDir = join(process.cwd(), "public", "cards", "rws");

const major = [
  ["major/00-fool.jpg", "RWS_Tarot_00_Fool.jpg"],
  ["major/01-magician.jpg", "RWS_Tarot_01_Magician.jpg"],
  ["major/02-high-priestess.jpg", "RWS_Tarot_02_High_Priestess.jpg"],
  ["major/03-empress.jpg", "RWS_Tarot_03_Empress.jpg"],
  ["major/04-emperor.jpg", "RWS_Tarot_04_Emperor.jpg"],
  ["major/05-hierophant.jpg", "RWS_Tarot_05_Hierophant.jpg"],
  ["major/06-lovers.jpg", "RWS_Tarot_06_Lovers.jpg"],
  ["major/07-chariot.jpg", "RWS_Tarot_07_Chariot.jpg"],
  ["major/08-strength.jpg", "RWS_Tarot_08_Strength.jpg"],
  ["major/09-hermit.jpg", "RWS_Tarot_09_Hermit.jpg"],
  ["major/10-wheel-of-fortune.jpg", "RWS_Tarot_10_Wheel_of_Fortune.jpg"],
  ["major/11-justice.jpg", "RWS_Tarot_11_Justice.jpg"],
  ["major/12-hanged-man.jpg", "RWS_Tarot_12_Hanged_Man.jpg"],
  ["major/13-death.jpg", "RWS_Tarot_13_Death.jpg"],
  ["major/14-temperance.jpg", "RWS_Tarot_14_Temperance.jpg"],
  ["major/15-devil.jpg", "RWS_Tarot_15_Devil.jpg"],
  ["major/16-tower.jpg", "RWS_Tarot_16_Tower.jpg"],
  ["major/17-star.jpg", "RWS_Tarot_17_Star.jpg"],
  ["major/18-moon.jpg", "RWS_Tarot_18_Moon.jpg"],
  ["major/19-sun.jpg", "RWS_Tarot_19_Sun.jpg"],
  ["major/20-judgement.jpg", "RWS_Tarot_20_Judgement.jpg"],
  ["major/21-world.jpg", "RWS_Tarot_21_World.jpg"]
];

const minor = [
  ...minorSuit("cups", "cups", "Cups"),
  ...minorSuit("wands", "wands", "Wands"),
  ...minorSuit("swords", "swords", "Swords"),
  ...minorSuit("pentacles", "pentacles", "Pents")
];

const cards = [...major, ...minor];
mkdirSync(rootDir, { recursive: true });

const downloaded = [];
const skipped = [];
const failed = [];

for (const [relativePath, commonsFileName] of cards) {
  const target = join(rootDir, relativePath);
  if (existsSync(target) && !overwrite) {
    skipped.push(relativePath);
    continue;
  }

  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(commonsFileName)}`;
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent": "Card-Mediated-Reflection-Demo/0.1 (public-domain image setup)"
      }
    });
    if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);
    mkdirSync(dirname(target), { recursive: true });
    await pipeline(response.body, createWriteStream(target));
    downloaded.push(relativePath);
  } catch (error) {
    failed.push(`${relativePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
  await wait(900);
}

console.log("Downloaded:");
console.log(downloaded.length ? downloaded.map((item) => `- ${item}`).join("\n") : "- none");
console.log("Skipped:");
console.log(skipped.length ? skipped.map((item) => `- ${item}`).join("\n") : "- none");
console.log("Failed:");
console.log(failed.length ? failed.map((item) => `- ${item}`).join("\n") : "- none");

function minorSuit(folder, suitId, commonsPrefix) {
  return Array.from({ length: 14 }, (_, index) => {
    const number = index + 1;
    const rank = rankSlug(number);
    const fileName = `${String(number).padStart(2, "0")}-${rank}-of-${suitId}.jpg`;
    return [`minor/${folder}/${fileName}`, `${commonsPrefix}${String(number).padStart(2, "0")}.jpg`];
  });
}

function rankSlug(number) {
  if (number === 1) return "ace";
  if (number === 11) return "page";
  if (number === 12) return "knight";
  if (number === 13) return "queen";
  if (number === 14) return "king";
  return String(number);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
