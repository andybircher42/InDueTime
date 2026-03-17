import {
  getZodiacSign,
  getZodiacSignForDate,
  getZodiacSignImage,
} from "./zodiacSigns";

describe("getZodiacSign", () => {
  it("returns correct sign for each zodiac period", () => {
    expect(getZodiacSign(1, 5).name).toBe("Capricorn");
    expect(getZodiacSign(1, 19).name).toBe("Capricorn");
    expect(getZodiacSign(1, 20).name).toBe("Aquarius");
    expect(getZodiacSign(2, 18).name).toBe("Aquarius");
    expect(getZodiacSign(2, 19).name).toBe("Pisces");
    expect(getZodiacSign(3, 20).name).toBe("Pisces");
    expect(getZodiacSign(3, 21).name).toBe("Aries");
    expect(getZodiacSign(4, 19).name).toBe("Aries");
    expect(getZodiacSign(4, 20).name).toBe("Taurus");
    expect(getZodiacSign(5, 20).name).toBe("Taurus");
    expect(getZodiacSign(5, 21).name).toBe("Gemini");
    expect(getZodiacSign(6, 20).name).toBe("Gemini");
    expect(getZodiacSign(6, 21).name).toBe("Cancer");
    expect(getZodiacSign(7, 22).name).toBe("Cancer");
    expect(getZodiacSign(7, 23).name).toBe("Leo");
    expect(getZodiacSign(8, 22).name).toBe("Leo");
    expect(getZodiacSign(8, 23).name).toBe("Virgo");
    expect(getZodiacSign(9, 22).name).toBe("Virgo");
    expect(getZodiacSign(9, 23).name).toBe("Libra");
    expect(getZodiacSign(10, 22).name).toBe("Libra");
    expect(getZodiacSign(10, 23).name).toBe("Scorpio");
    expect(getZodiacSign(11, 21).name).toBe("Scorpio");
    expect(getZodiacSign(11, 22).name).toBe("Sagittarius");
    expect(getZodiacSign(12, 21).name).toBe("Sagittarius");
    expect(getZodiacSign(12, 22).name).toBe("Capricorn");
    expect(getZodiacSign(12, 31).name).toBe("Capricorn");
  });

  it("returns name and color without image", () => {
    const sign = getZodiacSign(7, 25);
    expect(sign).toEqual({ name: "Leo", color: "#E8A030" });
    expect(sign).not.toHaveProperty("image");
  });
});

describe("getZodiacSignForDate", () => {
  it("returns the correct sign for an ISO date", () => {
    expect(getZodiacSignForDate("2026-03-15").name).toBe("Pisces");
    expect(getZodiacSignForDate("2026-07-25").name).toBe("Leo");
    expect(getZodiacSignForDate("2026-01-01").name).toBe("Capricorn");
    expect(getZodiacSignForDate("2026-12-25").name).toBe("Capricorn");
  });
});

describe("getZodiacSignImage", () => {
  it("returns an image for a valid sign name", () => {
    expect(getZodiacSignImage("Leo")).toBeDefined();
    expect(getZodiacSignImage("Pisces")).toBeDefined();
  });

  it("falls back to Capricorn for unknown names", () => {
    expect(getZodiacSignImage("Ophiuchus")).toBe(
      getZodiacSignImage("Capricorn"),
    );
  });
});
