import colorMapJSON from "$src/categoryToColor/colorMap.json";
import { getRandom, getRandomIntInclusive } from "$src/lib/utils/utils";

const colorMap = colorMapJSON as Record<
  string,
  { h: number; s: number; l: number }
>;

export function normalizeCategory(cat: string) {
  return cat.toLowerCase();
}

function extract(categories: string[]): {
  hues: number[];
  saturations: number[];
} {
  const hues: number[] = [];
  const saturations: number[] = [];

  for (const cat of categories) {
    if (!cat) continue;

    const normalizedCat = normalizeCategory(cat);

    const data = colorMap[normalizedCat];
    if (data) {
      hues.push(data.h);
      saturations.push(data.s);
    } else {
      console.warn(`Warn: No vector found for category: ${normalizedCat}`);
      //   throw new Error(`No vector found for category: ${cat}`);
    }
  }

  return { hues, saturations };
}

function averageNumbers(numbers: number[]) {
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return sum / numbers.length;
}

export function categoriesToColor(categories: string[]) {
  const { hues, saturations } = extract(categories);
  const avgHue = averageNumbers(hues);
  const avgSaturation = averageNumbers(saturations);

  if (isNaN(avgHue) || isNaN(avgSaturation)) {
    return {
      h: getRandom(0, 1),
      s: getRandomIntInclusive(50, 100) / 100,
      l: 50,
    };
  }

  return {
    h: avgHue,
    s: avgSaturation,
    l: 50, // Fixed lightness for now
  };
}
