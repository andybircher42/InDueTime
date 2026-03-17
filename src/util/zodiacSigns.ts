/* eslint-disable @typescript-eslint/no-require-imports */
import { ImageSourcePropType } from "react-native";

export interface ZodiacSign {
  name: string;
  color: string;
}

interface ZodiacSignData extends ZodiacSign {
  image: ImageSourcePropType;
  /** Start month (1-12). */
  startMonth: number;
  /** Start day of month. */
  startDay: number;
}

const ZODIAC_SIGNS: ZodiacSignData[] = [
  {
    name: "Capricorn",
    color: "#5A6E4E",
    startMonth: 12,
    startDay: 22,
    image: require("../../assets/zodiac/capricorn.png") as ImageSourcePropType,
  },
  {
    name: "Aquarius",
    color: "#4A90D9",
    startMonth: 1,
    startDay: 20,
    image: require("../../assets/zodiac/aquarius.png") as ImageSourcePropType,
  },
  {
    name: "Pisces",
    color: "#7BAED4",
    startMonth: 2,
    startDay: 19,
    image: require("../../assets/zodiac/pisces.png") as ImageSourcePropType,
  },
  {
    name: "Aries",
    color: "#D14B4B",
    startMonth: 3,
    startDay: 21,
    image: require("../../assets/zodiac/aries.png") as ImageSourcePropType,
  },
  {
    name: "Taurus",
    color: "#6B8E5A",
    startMonth: 4,
    startDay: 20,
    image: require("../../assets/zodiac/taurus.png") as ImageSourcePropType,
  },
  {
    name: "Gemini",
    color: "#E8C547",
    startMonth: 5,
    startDay: 21,
    image: require("../../assets/zodiac/gemini.png") as ImageSourcePropType,
  },
  {
    name: "Cancer",
    color: "#B0B8D8",
    startMonth: 6,
    startDay: 21,
    image: require("../../assets/zodiac/cancer.png") as ImageSourcePropType,
  },
  {
    name: "Leo",
    color: "#E8A030",
    startMonth: 7,
    startDay: 23,
    image: require("../../assets/zodiac/leo.png") as ImageSourcePropType,
  },
  {
    name: "Virgo",
    color: "#8B7355",
    startMonth: 8,
    startDay: 23,
    image: require("../../assets/zodiac/virgo.png") as ImageSourcePropType,
  },
  {
    name: "Libra",
    color: "#D4A0C0",
    startMonth: 9,
    startDay: 23,
    image: require("../../assets/zodiac/libra.png") as ImageSourcePropType,
  },
  {
    name: "Scorpio",
    color: "#8B2252",
    startMonth: 10,
    startDay: 23,
    image: require("../../assets/zodiac/scorpio.png") as ImageSourcePropType,
  },
  {
    name: "Sagittarius",
    color: "#7B4DAA",
    startMonth: 11,
    startDay: 22,
    image:
      require("../../assets/zodiac/sagittarius.png") as ImageSourcePropType,
  },
];

/** Returns the zodiac sign for a given month (1-12) and day (1-31). */
export function getZodiacSign(month: number, day: number): ZodiacSign {
  const cap = ZODIAC_SIGNS[0]; // Capricorn spans year boundary (Dec 22 – Jan 19)
  if (
    (month === 12 && day >= cap.startDay) ||
    (month === 1 && day < ZODIAC_SIGNS[1].startDay)
  ) {
    return { name: cap.name, color: cap.color };
  }
  // Walk backwards through the rest (Aquarius..Sagittarius)
  for (let i = ZODIAC_SIGNS.length - 1; i >= 1; i--) {
    const s = ZODIAC_SIGNS[i];
    if (month > s.startMonth || (month === s.startMonth && day >= s.startDay)) {
      return { name: s.name, color: s.color };
    }
  }
  return { name: cap.name, color: cap.color };
}

/** Returns the zodiac sign for a given ISO date string. */
export function getZodiacSignForDate(isoDate: string): ZodiacSign {
  const d = new Date(isoDate + "T00:00:00");
  return getZodiacSign(d.getMonth() + 1, d.getDate());
}

/** Look up the zodiac sign image by name. */
const IMAGE_BY_NAME = new Map<string, ImageSourcePropType>(
  ZODIAC_SIGNS.map((s) => [s.name, s.image]),
);

/** Returns the image source for a zodiac sign by name. Falls back to Capricorn. */
export function getZodiacSignImage(name: string): ImageSourcePropType {
  return IMAGE_BY_NAME.get(name) ?? ZODIAC_SIGNS[0].image;
}
