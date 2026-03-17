import { makeEntry } from "@/test/mockData";

import { resolveSymbol } from "./resolveSymbol";

describe("resolveSymbol", () => {
  it("resolves gem from entry.birthstone", () => {
    const entry = makeEntry({
      id: "1",
      name: "A",
      symbolType: "gem",
      birthstone: { name: "Ruby", color: "#E53935" },
    });
    const s = resolveSymbol(entry);
    expect(s.name).toBe("Ruby");
    expect(s.color).toBe("#E53935");
    expect(s.type).toBe("gem");
    expect(s.label).toBe("Birthstone");
    expect(s.image).toBeDefined();
  });

  it("resolves flower from entry.birthFlower", () => {
    const entry = makeEntry({
      id: "2",
      name: "B",
      symbolType: "flower",
      birthFlower: { name: "Rose", color: "#C8465C" },
    });
    const s = resolveSymbol(entry);
    expect(s.name).toBe("Rose");
    expect(s.color).toBe("#C8465C");
    expect(s.type).toBe("flower");
    expect(s.label).toBe("Flower");
  });

  it("resolves zodiac from entry.zodiacSign", () => {
    const entry = makeEntry({
      id: "3",
      name: "C",
      symbolType: "zodiac",
      zodiacSign: { name: "Leo", color: "#E8A030" },
    });
    const s = resolveSymbol(entry);
    expect(s.name).toBe("Leo");
    expect(s.color).toBe("#E8A030");
    expect(s.type).toBe("zodiac");
    expect(s.label).toBe("Zodiac");
  });

  it("falls back to computed birthstone when entry.birthstone is missing", () => {
    const entry = makeEntry({
      id: "4",
      name: "D",
      dueDate: "2026-06-15",
      symbolType: "gem",
      birthstone: undefined,
    });
    const s = resolveSymbol(entry);
    expect(s.name).toBe("Pearl"); // June = Pearl
    expect(s.type).toBe("gem");
  });

  it("falls back to computed flower when entry.birthFlower is missing", () => {
    const entry = makeEntry({
      id: "5",
      name: "E",
      dueDate: "2026-06-15",
      symbolType: "flower",
      birthFlower: undefined,
    });
    const s = resolveSymbol(entry);
    expect(s.name).toBe("Rose"); // June = Rose
  });

  it("falls back to computed zodiac when entry.zodiacSign is missing", () => {
    const entry = makeEntry({
      id: "6",
      name: "F",
      dueDate: "2026-07-25",
      symbolType: "zodiac",
      zodiacSign: undefined,
    });
    const s = resolveSymbol(entry);
    expect(s.name).toBe("Leo"); // July 25 = Leo
  });

  it("defaults to gem when symbolType is undefined", () => {
    const entry = makeEntry({
      id: "7",
      name: "G",
      symbolType: undefined,
    });
    const s = resolveSymbol(entry);
    expect(s.type).toBe("gem");
  });
});
