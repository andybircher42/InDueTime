import {
  BIRTH_FLOWERS,
  getBirthFlower,
  getBirthFlowerForDate,
  getBirthFlowerImage,
} from "./birthFlowers";

describe("BIRTH_FLOWERS", () => {
  it("has an entry for every month 1-12", () => {
    for (let m = 1; m <= 12; m++) {
      expect(BIRTH_FLOWERS[m]).toBeDefined();
      expect(BIRTH_FLOWERS[m].name).toBeTruthy();
      expect(BIRTH_FLOWERS[m].color).toMatch(/^#/);
      expect(BIRTH_FLOWERS[m].image).toBeDefined();
    }
  });
});

describe("getBirthFlower", () => {
  it("returns the correct flower for each month", () => {
    expect(getBirthFlower(1).name).toBe("Carnation");
    expect(getBirthFlower(6).name).toBe("Rose");
    expect(getBirthFlower(9).name).toBe("Aster");
    expect(getBirthFlower(12).name).toBe("Narcissus");
  });

  it("falls back to January for invalid months", () => {
    expect(getBirthFlower(0).name).toBe("Carnation");
    expect(getBirthFlower(13).name).toBe("Carnation");
    expect(getBirthFlower(-1).name).toBe("Carnation");
    expect(getBirthFlower(1.5).name).toBe("Carnation");
  });

  it("returns name and color without image", () => {
    const flower = getBirthFlower(3);
    expect(flower).toEqual({ name: "Daffodil", color: "#F5D547" });
    expect(flower).not.toHaveProperty("image");
  });
});

describe("getBirthFlowerForDate", () => {
  it("returns the correct flower for an ISO date", () => {
    expect(getBirthFlowerForDate("2026-06-15").name).toBe("Rose");
    expect(getBirthFlowerForDate("2026-09-01").name).toBe("Aster");
    expect(getBirthFlowerForDate("2026-01-31").name).toBe("Carnation");
  });
});

describe("getBirthFlowerImage", () => {
  it("returns an image for a valid flower name", () => {
    expect(getBirthFlowerImage("Rose")).toBeDefined();
    expect(getBirthFlowerImage("Aster")).toBeDefined();
  });

  it("falls back to Carnation for unknown names", () => {
    expect(getBirthFlowerImage("Sunflower")).toBe(
      getBirthFlowerImage("Carnation"),
    );
  });
});
