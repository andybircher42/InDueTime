import { ImageSourcePropType } from "react-native";

import { Entry, SymbolType } from "@/storage";

import { getBirthFlower, getBirthFlowerImage } from "./birthFlowers";
import { getBirthstone, getBirthstoneImage } from "./birthstones";
import { getZodiacSign, getZodiacSignImage } from "./zodiacSigns";

export interface ResolvedSymbol {
  /** Display name (e.g., "Pearl", "Rose", "Leo"). */
  name: string;
  /** Hex color for backgrounds. */
  color: string;
  /** Image source for the icon. */
  image: ImageSourcePropType;
  /** The symbol type. */
  type: SymbolType;
  /** Human-readable label (e.g., "Birthstone", "Flower", "Zodiac"). */
  label: string;
}

/** Resolves the display symbol (name, color, image, label) for an entry. */
export function resolveSymbol(entry: Entry): ResolvedSymbol {
  const month = new Date(entry.dueDate + "T00:00:00").getMonth() + 1;
  const day = new Date(entry.dueDate + "T00:00:00").getDate();
  const type = entry.symbolType ?? "gem";

  if (type === "zodiac") {
    const sign = entry.zodiacSign ?? getZodiacSign(month, day);
    return {
      name: sign.name,
      color: sign.color,
      image: getZodiacSignImage(sign.name),
      type: "zodiac",
      label: "Zodiac",
    };
  }

  if (type === "flower") {
    const flower = entry.birthFlower ?? getBirthFlower(month);
    return {
      name: flower.name,
      color: flower.color,
      image: getBirthFlowerImage(flower.name),
      type: "flower",
      label: "Flower",
    };
  }

  const stone = entry.birthstone ?? getBirthstone(month);
  return {
    name: stone.name,
    color: stone.color,
    image: getBirthstoneImage(stone.name),
    type: "gem",
    label: "Birthstone",
  };
}
