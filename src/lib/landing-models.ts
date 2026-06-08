export type LandingModelSlide = {
  id: string;
  name: string;
  alt: string;
  /** First existing file wins (carousel tries in order). */
  imageSources: string[];
};

function modelSlide(index: number, name: string): LandingModelSlide {
  const base = `/models/models-${index}`;
  return {
    id: `model-${index}`,
    name,
    alt: `DeepSky — ${name}`,
    imageSources: [
      `${base}.webp`,
      `${base}.jpg`,
      `${base}.png`,
    ],
  };
}

export const LANDING_MODEL_SLIDES: LandingModelSlide[] = [
  modelSlide(1, "Model 1"),
  modelSlide(2, "Model 2"),
  modelSlide(3, "Model 3"),
  modelSlide(4, "Model 4"),
];

export const MODEL_CAROUSEL_INTERVAL_MS = 2000;

/** Use with Next/Image for banner slides (full viewport width). */
export const MODEL_CAROUSEL_IMAGE_SIZES = "100vw";

export const MODEL_CAROUSEL_IMAGE_QUALITY = 90;
