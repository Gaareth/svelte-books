import * as druid from "@saehrimnir/druidjs";
import { writeFile } from "fs/promises";
import word2vec from "word2vec";
import { loadBisacCategories } from "./findCategories";

const VECTOR_CACHE: Record<string, number[] | null> = {};

function loadModel() {
  return new Promise((resolve, reject) => {
    word2vec.loadModel(
      "embeddings/glove.6B/glove.6B.50d.txt",
      (err: any, model: any) => {
        if (err) {
          reject(err);
          return;
        }

        console.log("Model loaded");
        resolve(model);
      }
    );
  });
}

function getVectorCached(model: any, category: string): number[] | null {
  if (category in VECTOR_CACHE) {
    return VECTOR_CACHE[category];
  }

  const vector = model.getVector(category)?.values || null;
  VECTOR_CACHE[category] = vector;
  return vector;
}

function tryGetVector(model: any, category: string): number[] | null {
  // console.log("trying to get vector for category: ", category);

  let vector = getVectorCached(model, category);

  category = category.trim().toLowerCase();

  if (!vector) {
    // console.log("trying normalized: ", category);
    vector = getVectorCached(model, category);
  }

  if (!vector && category.includes(" ")) {
    let spaceMergedCategory = category.replaceAll(" ", "");
    // console.log("trying: ", spaceMergedCategory);
    vector = getVectorCached(model, spaceMergedCategory);
  }

  if (!vector && category.includes(" ")) {
    let dashMergedCategory = category.replaceAll(" ", "-");
    // console.log("trying: ", dashMergedCategory);
    vector = getVectorCached(model, dashMergedCategory);
  }

  if (!vector && category.includes("'s")) {
    vector = getVectorCached(model, category.replace(/'s/g, "s"));
  }

  // bisac , dont normalize first, try as is
  if (!vector && category.includes("/")) {
    vector = getAvgVectorForWords(
      category.split("/").map((part) => part.trim()),
      model
    );
  }

  if (!vector && category.includes("-")) {
    vector = getAvgVectorForWords(
      category.split("-").map((part) => part.trim()),
      model
    );
  }

  if (!vector && category.includes("&")) {
    vector = getAvgVectorForWords(
      category.split("&").map((part) => part.trim()),
      model
    );
  }

  if (!vector && category.includes(" ")) {
    vector = getAvgVectorForWords(
      category.split(" ").map((part) => part.trim()),
      model
    );
  }

  // console.log(
  //   `Vector for category "${category}":`,
  //   vector ? "found" : "not found"
  // );
  return vector;
}

function getAvgVectorForWords(words: string[], model: any): number[] | null {
  const vectors = words
    .map((cat) => tryGetVector(model, cat))
    .filter((vec): vec is number[] => vec != null);

  if (vectors.length === 0) {
    return null;
  }

  const avgVector = new Array(vectors[0].length).fill(0);
  for (const vec of vectors) {
    for (let i = 0; i < avgVector.length; i++) {
      avgVector[i] += vec[i];
    }
  }
  for (let i = 0; i < avgVector.length; i++) {
    avgVector[i] /= vectors.length;
  }

  return avgVector;
}

export async function precomputeCategoryVectors(
  categories: string[],
  throwOnMissing = true
): Promise<Record<string, number[]>> {
  const model: any = await loadModel();

  const categoryVectors: Record<string, number[]> = {};
  let i = 0;
  for (const category of categories) {
    const vector = tryGetVector(model, category);

    if (vector) {
      categoryVectors[category] = Array.from(vector);
    } else {
      if (throwOnMissing) {
        throw new Error(`No embedding found for category: ${category}`);
      }
    }

    i++;
    if (i % 200 === 0) {
      console.log(
        `Processed ${i}/${categories.length} categories [${(
          (i / categories.length) *
          100
        ).toFixed(2)}%]`
      );
    }
  }

  return categoryVectors;
}

export async function exportCategoryVectors() {
  // const categories: string[] = (await loadOrCreateCategories()).map(
  //   normalizeCategory
  // );
  // const categories = [
  //   "fantasy",
  //   "romance",
  //   "mystery",
  //   "thriller",
  //   "young-adult",
  //   "historical",
  //   "science-fiction",
  //   "art",
  //   "social-science",
  //   "biography",
  //   "self-help",
  //   "health",
  //   "travel",
  //   "comics",
  //   "graphic-novels",
  //   "poetry",
  //   "religion",
  //   "spirituality",
  //   "science",
  //   "technology",
  //   "business",
  //   "economics",
  //   "philosophy",
  // ];

  // const bisac_categories = [
  //   "History / Social History",
  //   "Juvenile Fiction / Art",
  //   "Juvenile Fiction / Science Fiction / Alien Contact",
  //   "Fiction / Science Fiction / Alien Contact",
  //   "Fiction / Science Fiction / Crime & Mystery",
  //   "Juvenile Fiction / Law & Crime",
  //   "Fiction / Fantasy / General",
  //   "Comics & Graphic Novels / Manga / Fantasy",
  // ];

  // const categoriesWithBisac = [...categories, ...bisac_categories];
  const categories = (await loadBisacCategories()).map((c) =>
    c.trim().toLowerCase()
  );

  console.log(`Categories found: ${categories.length}`);

  const categoryVectors = await precomputeCategoryVectors(categories, true);

  // console.log(categoryVectors);

  console.log(
    `Missing vectors for ${
      categories.length - Object.keys(categoryVectors).length
    } categories.`
  );

  // const pca = new druid.PCA(Object.values(categoryVectors), { d: 2 });
  // const projection = pca.transform();

  const umap = new druid.UMAP(Object.values(categoryVectors), {
    d: 2,
    n_neighbors: 20,
  });

  const projection = umap.transform();

  // collect ranges
  const xs = projection.map((v) => v[0]);
  const ys = projection.map((v) => v[1]);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const hueAndSaturation = projection.map(([x, y]) => {
    // normalize to [-1, 1]
    const nx = ((x - minX) / (maxX - minX)) * 2 - 1;
    const ny = ((y - minY) / (maxY - minY)) * 2 - 1;

    const hue = (Math.atan2(ny, nx) / (2 * Math.PI) + 1) % 1;
    const saturation = Math.min(1, Math.sqrt(nx * nx + ny * ny));

    return { hue, saturation, nx, ny };
  });

  let vectors: Record<
    string,
    { vector: number[]; hue: number; saturation: number; x: number; y: number }
  > = {};
  let i = 0;
  for (const [category, vector] of Object.entries(categoryVectors)) {
    vectors[category] = {
      vector: vector,
      hue: hueAndSaturation[i].hue,
      saturation: hueAndSaturation[i].saturation,
      x: hueAndSaturation[i].nx,
      y: hueAndSaturation[i].ny,
    };
    i++;
  }

  try {
    await writeFile(
      "src/categoryToColor/categoryVectors.json",
      JSON.stringify(vectors)
    );
  } catch (err) {
    console.error("Error writing category vectors to file:", err);
  }

  console.log("Category vectors successfully written to file.");
}

exportCategoryVectors();
