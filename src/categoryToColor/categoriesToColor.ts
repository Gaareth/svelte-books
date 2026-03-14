import categoryVectorsJson from "$src/categoryToColor/categoryVectors.json";

const categoryVectors: Record<
  string,
  { vector: number[]; hue: number; saturation: number }
> = categoryVectorsJson;

export function normalizeCategory(cat: string) {
  return cat.toLowerCase().replaceAll(" ", "-");
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
    const data = categoryVectors[normalizedCat];
    if (data) {
      hues.push(data.hue);
      saturations.push(data.saturation);
    } else {
      console.warn(`No vector found for category: ${cat} ${normalizedCat}`);
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

  console.log(categories[0], avgHue, avgSaturation);

  return { hue: avgHue * 360, saturation: avgSaturation * 100 };
}
