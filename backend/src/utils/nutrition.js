

const KEYWORD_RULES = [
  { keys: ["fried", "deep fry", "pakora", "bhatura", "butter", "cream", "malai", "cheese"], fat: 2, cal: 120, health: -1.2 },
  { keys: ["sweet", "sugar", "jalebi", "ladoo", "halwa", "dessert", "chocolate"], sugar: 2, cal: 100, health: -1 },
  { keys: ["paneer", "tofu", "egg", "anda", "chicken", "fish", "mutton", "meat", "dal", "lentil", "chana", "rajma"], protein: 1.5, cal: 80, health: 0.4 },
  { keys: ["salad", "steamed", "grilled", "soup", "roti", "rice", "quinoa", "oats"], fiber: 1, cal: 40, health: 0.8 },
  { keys: ["oil", "ghee", "mayo"], fat: 1.5, cal: 90, health: -0.8 },
  { keys: ["veg", "vegetable", "sabzi", "palak", "broccoli"], fiber: 0.8, cal: 35, health: 0.5 },
];

const BASE_CALORIES = 280;
const BASE_HEALTH = 6;

function normalize(text) {
  return String(text || "").toLowerCase();
}

export function deriveTagsFromName(name) {
  const n = normalize(name);
  const tags = new Set();
  if (/\bveg|vegetable|sabzi|palak|salad\b/.test(n)) tags.add("Veg");
  if (/\bchicken|mutton|fish|meat|egg|anda|non.?veg\b/.test(n)) tags.add("Non-Veg");
  if (/\bpaneer|dal|lentil|chana|rajma|tofu|protein\b/.test(n)) tags.add("High Protein");
  if (/\bfried|pakora|bhatura|butter|cream|sweet|jalebi|dessert\b/.test(n)) tags.add("Indulgent");
  if (/\bsteamed|grilled|salad|soup\b/.test(n)) tags.add("Light");
  return [...tags];
}

export function computeNutrition(name) {
  const text = normalize(name);
  let fat = 1;
  let sugar = 0.5;
  let protein = 0.8;
  let fiber = 0.5;
  let calorieBump = 0;
  let healthAdj = 0;

  for (const rule of KEYWORD_RULES) {
    if (rule.keys.some((k) => text.includes(k))) {
      if (rule.fat) fat += rule.fat;
      if (rule.sugar) sugar += rule.sugar;
      if (rule.protein) protein += rule.protein;
      if (rule.fiber) fiber += rule.fiber;
      if (rule.cal) calorieBump += rule.cal;
      if (rule.health) healthAdj += rule.health;
    }
  }

  const calories = Math.round(BASE_CALORIES + calorieBump + fat * 45 + sugar * 35 - fiber * 20);
  let healthScore = BASE_HEALTH + healthAdj + fiber * 0.3 - fat * 0.25 - sugar * 0.2 + protein * 0.15;
  healthScore = Math.max(0, Math.min(10, Math.round(healthScore * 10) / 10));

  return { calories, healthScore };
}
