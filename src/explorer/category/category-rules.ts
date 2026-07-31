export type CategoryItem = {
  emoji: string;
  shortName: string;
  subGroup: string;
};

const countryContinents: Record<string, Set<string>> = {
  Africa: new Set(
    "DZ AO BJ BW BF BI CV CM CF TD KM CD CG CI DJ EG GQ ER SZ ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU MA MZ NA NE NG RW ST SN SC SL SO ZA SS SD TZ TG TN UG ZM ZW".split(
      " ",
    ),
  ),
  Asia: new Set(
    "AF AM AZ BH BD BT BN KH CN CY GE IN ID IR IQ IL JP JO KZ KW KG LA LB MY MV MN MM NP KP OM PK PH QA SA SG KR LK SY TW TJ TH TL TR TM AE UZ VN YE".split(
      " ",
    ),
  ),
  Europe: new Set(
    "AL AD AT BY BE BA BG HR CZ DK EE FI FR DE GR HU IS IE IT XK LV LI LT LU MT MD MC ME NL MK NO PL PT RO RU SM RS SK SI ES SE CH UA GB VA".split(
      " ",
    ),
  ),
  "North America": new Set(
    "AG BS BB BZ CA CR CU DM DO SV GD GT HT HN JM MX NI PA KN LC VC TT US".split(
      " ",
    ),
  ),
  "South America": new Set("AR BO BR CL CO EC GY PY PE SR UY VE".split(" ")),
  Oceania: new Set("AU FJ KI MH FM NR NZ PW PG WS SB TO TV VU".split(" ")),
};

export function getExplorerSubGroup(item: CategoryItem) {
  const name = item.shortName.toLowerCase();
  const raw = item.subGroup;

  if (raw === "country-flag") return getFlagContinent(item) ?? "Other Flags";
  if (raw === "animal-bug") return "Bugs";
  if (raw === "animal-bird") return "Birds";
  if (raw === "animal-mammal") return "Mammals";
  if (raw === "animal-marine") return "Marine Animals";
  if (raw === "animal-reptile") return "Reptiles";
  if (raw === "animal-amphibian") return "Amphibians";
  if (raw === "plant-flower") return "Flowers";
  if (raw === "plant-other") return "Other Plants";
  if (raw === "book-paper") return "Books & Paper";
  if (raw === "food-asian") return "Asian";
  if (raw.startsWith("food-")) return titleCase(raw.slice(5));
  if (raw === "clothing") return getClothingType(name);
  if (raw === "geometric") return getGeometricShape(name);
  if (raw === "family") return getFamilyType(name);
  if (raw === "person")
    return /baby|boy|girl|child/.test(name) ? "Children" : "Adults";
  if (raw === "person-role") return getPersonRoleType(name);
  if (raw === "person-activity") return getActivityType(name);
  if (raw === "person-fantasy") return getFantasyType(name);
  if (raw === "person-gesture") return getGestureType(name);
  if (raw === "person-sport") return getSportType(name);

  return titleCase(raw);
}

export function titleCase(value: string) {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getFlagContinent(item: CategoryItem) {
  const code = [...item.emoji]
    .filter((character) => {
      const point = character.codePointAt(0) ?? 0;
      return point >= 0x1f1e6 && point <= 0x1f1ff;
    })
    .map((character) =>
      String.fromCharCode(65 + (character.codePointAt(0) ?? 0) - 0x1f1e6),
    )
    .join("");

  return Object.entries(countryContinents).find(([, countries]) =>
    countries.has(code),
  )?.[0];
}

function getClothingType(name: string) {
  if (/shoe|boot|sandal|slipper/.test(name)) return "Shoes";
  if (/cap|crown|helmet|hat|headscarf|hair pick/.test(name))
    return "Hats & Headwear";
  if (
    /bag|purse|glasses|goggles|gloves|necktie|lipstick|fan|beads|gem/.test(name)
  )
    return "Accessories";
  return "Clothing";
}

function getGeometricShape(name: string) {
  if (name.includes("circle")) return "Circles";
  if (name.includes("square")) return "Squares";
  if (name.includes("diamond")) return "Diamonds";
  if (name.includes("triangle")) return "Triangles";
  return "Other Shapes";
}

function getFamilyType(name: string) {
  if (name.startsWith("family")) return "Families";
  if (name.startsWith("kiss")) return "Kissing Couples";
  if (name.startsWith("couple with heart")) return "Couples with Heart";
  return "Holding Hands";
}

function getPersonRoleType(name: string) {
  if (/health worker|feeding baby|pregnant|breast-feeding/.test(name))
    return "Care & Health";
  if (/artist|singer|scientist|technologist/.test(name))
    return "Creative & Technical";
  if (/student|teacher|office worker/.test(name)) return "Education & Office";
  if (/detective|firefighter|guard|judge|police officer|ninja/.test(name))
    return "Safety & Justice";
  if (/construction|cook|factory|farmer|mechanic/.test(name))
    return "Trades & Service";
  if (/astronaut|pilot/.test(name)) return "Travel & Space";
  if (/prince|princess|crown/.test(name)) return "Royalty";
  return "Cultural & Formal Wear";
}

function getActivityType(name: string) {
  if (/wheelchair|white cane/.test(name)) return "Accessibility & Mobility";
  if (/haircut|massage|steamy room/.test(name)) return "Personal Care & Rest";
  if (/dancing|bunny ears|ballet/.test(name)) return "Dance";
  if (/kneeling|standing|levitating/.test(name)) return "Poses";
  return "Movement";
}

function getFantasyType(name: string) {
  if (/santa|claus|angel/.test(name)) return "Holiday & Angels";
  if (/elf|fairy|genie|mage/.test(name)) return "Magic";
  if (/superhero|supervillain/.test(name)) return "Heroes & Villains";
  if (/mermaid|merman|merperson/.test(name)) return "Merpeople";
  return "Monsters & Undead";
}

function getGestureType(name: string) {
  if (name.startsWith("deaf")) return "Accessibility";
  if (/raising hand|gesturing|tipping hand/.test(name))
    return "Signals & Greetings";
  if (/facepalming|frowning|pouting|shrugging/.test(name)) return "Reactions";
  return "Respect & Apology";
}

function getSportType(name: string) {
  if (/swimming|surfing|rowing|water polo/.test(name)) return "Water Sports";
  if (/biking|mountain biking/.test(name)) return "Cycling";
  if (/bouncing ball|handball|golfing/.test(name)) return "Ball Sports";
  if (/lifting weights|cartwheeling|juggling/.test(name))
    return "Fitness & Skills";
  if (/ski|snowboard/.test(name)) return "Winter Sports";
  if (/wrestling|fencing|horse racing/.test(name)) return "Competition";
  return "Running & Movement";
}
