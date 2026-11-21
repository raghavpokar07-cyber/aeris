const { generate } = require("../src/services/recommendations");

test("severe AQI produces critical outdoor recommendation", () => {
  const items = generate(260, null, {});
  expect(items.some((item) => item.priority === "critical")).toBe(true);
  expect(items.some((item) => /outdoor/i.test(item.title))).toBe(true);
});

test("good AQI does not recommend avoiding all outdoor activity", () => {
  const items = generate(35, null, {});
  expect(items.some((item) => item.priority === "critical")).toBe(false);
});

test("vulnerable family profiles receive protection guidance", () => {
  const items = generate(120, null, { familyProfiles: [{ category: "Child" }] });
  expect(items.some((item) => /vulnerable/i.test(item.title))).toBe(true);
});
