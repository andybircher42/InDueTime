/* eslint-disable @typescript-eslint/no-require-imports */
import { ImageSourcePropType } from "react-native";

export interface BirthFlower {
  name: string;
  color: string;
}

interface BirthFlowerData extends BirthFlower {
  image: ImageSourcePropType;
}

const BIRTH_FLOWERS: Record<number, BirthFlowerData> = {
  1: {
    name: "Carnation",
    color: "#E8A0B0",
    image:
      require("../../assets/birthflowers/1-january-carnation.png") as ImageSourcePropType,
  },
  2: {
    name: "Violet",
    color: "#7B68AE",
    image:
      require("../../assets/birthflowers/2-february-violet.png") as ImageSourcePropType,
  },
  3: {
    name: "Daffodil",
    color: "#F5D547",
    image:
      require("../../assets/birthflowers/3-march-daffodil.png") as ImageSourcePropType,
  },
  4: {
    name: "Daisy",
    color: "#F5F5F0",
    image:
      require("../../assets/birthflowers/4-april-daisy.png") as ImageSourcePropType,
  },
  5: {
    name: "Lily of the Valley",
    color: "#F8F0E8",
    image:
      require("../../assets/birthflowers/5-may-lily.png") as ImageSourcePropType,
  },
  6: {
    name: "Rose",
    color: "#C8465C",
    image:
      require("../../assets/birthflowers/6-june-rose.png") as ImageSourcePropType,
  },
  7: {
    name: "Larkspur",
    color: "#6A8EC7",
    image:
      require("../../assets/birthflowers/7-july-larkspur.png") as ImageSourcePropType,
  },
  8: {
    name: "Gladiolus",
    color: "#E06060",
    image:
      require("../../assets/birthflowers/8-august-gladiolus.png") as ImageSourcePropType,
  },
  9: {
    name: "Aster",
    color: "#9B72B0",
    image:
      require("../../assets/birthflowers/9-september-aster.png") as ImageSourcePropType,
  },
  10: {
    name: "Marigold",
    color: "#E8A030",
    image:
      require("../../assets/birthflowers/10-october-marigold.png") as ImageSourcePropType,
  },
  11: {
    name: "Chrysanthemum",
    color: "#D4A040",
    image:
      require("../../assets/birthflowers/11-november-chrysanthemum.png") as ImageSourcePropType,
  },
  12: {
    name: "Narcissus",
    color: "#F0E060",
    image:
      require("../../assets/birthflowers/12-december-narcissus.png") as ImageSourcePropType,
  },
};

export { BIRTH_FLOWERS };

/** Returns the birth flower for a given month (1-12). Falls back to January for invalid input. */
export function getBirthFlower(month: number): BirthFlower {
  const data =
    month < 1 || month > 12 || !Number.isInteger(month)
      ? BIRTH_FLOWERS[1]
      : BIRTH_FLOWERS[month];
  return { name: data.name, color: data.color };
}

/** Returns the birth flower for a given ISO date string based on its month. */
export function getBirthFlowerForDate(isoDate: string): BirthFlower {
  const month = new Date(isoDate).getUTCMonth() + 1;
  return getBirthFlower(month);
}

/** Look up the birth flower image by name (for rendering from stored entry data). */
const IMAGE_BY_NAME = new Map<string, ImageSourcePropType>(
  Object.values(BIRTH_FLOWERS).map((f) => [f.name, f.image]),
);

/** Returns the image source for a birth flower by name. Falls back to Carnation. */
export function getBirthFlowerImage(name: string): ImageSourcePropType {
  return IMAGE_BY_NAME.get(name) ?? BIRTH_FLOWERS[1].image;
}
