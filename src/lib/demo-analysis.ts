import type { CropAnalysis } from "@/src/lib/analysis";

export const demoAnalysis: CropAnalysis = {
  plantSpecies: "Tomato",
  diagnosis: "Early blight with moderate foliar spread",
  confidence: "High",
  symptoms: [
    "Brown circular lesions with concentric rings",
    "Yellowing around infected leaf tissue",
    "Localized tissue collapse on older leaves",
  ],
  causes: [
    "Alternaria solani fungal infection",
    "Leaf wetness persisting after irrigation",
    "Crowded foliage reducing airflow",
  ],
  treatment: {
    immediate: [
      "Remove the two most affected leaves and discard them away from the crop.",
      "Apply a copper-based fungicide or chlorothalonil according to label rate.",
      "Switch watering to the soil line and keep foliage dry for the next 7 days.",
    ],
    prevention: [
      "Space plants wider to improve ventilation.",
      "Mulch soil to reduce splash-back from rain or irrigation.",
      "Rotate tomatoes away from this bed for at least one season.",
    ],
  },
  products: [
    {
      id: "p1",
      name: "Copper Fungicide Spray",
      description: "Protective foliar fungicide for early-stage blight pressure.",
      amazonLink: "https://www.amazon.com/",
    },
    {
      id: "p2",
      name: "Neem Oil Concentrate",
      description: "Useful as a support treatment where fungal and minor pest stress overlap.",
      amazonLink: "https://www.amazon.com/",
    },
    {
      id: "p3",
      name: "Tomato Support Clips",
      description: "Helps open the canopy and keep leaves off damp soil surfaces.",
      amazonLink: "https://www.amazon.com/",
    },
  ],
  urgency: "Moderate",
  detailedReport: `## Field Summary

The uploaded leaf is consistent with a **tomato plant** showing signs of **early blight**.  
Lesions are already visible on mature tissue, but the infection still looks manageable if treated quickly.

## What the markers represent

- The larger central lesion is the most active infection zone.
- The smaller spot near the lower edge appears to be an earlier secondary lesion.
- Both are linked to the copper fungicide recommendation in the care panel.

## Practical recommendation

Treat within the next **24-48 hours**, remove heavily infected foliage, and keep moisture off the leaves. If symptoms continue spreading after one week, escalate to a stronger fungicide program and inspect the rest of the plant canopy.`,
  issueSpots: [
    {
      label: "Primary blight lesion",
      x: 360,
      y: 250,
      width: 220,
      height: 190,
      treatingProductId: "p1",
    },
    {
      label: "Secondary lesion",
      x: 610,
      y: 560,
      width: 120,
      height: 110,
      treatingProductId: "p1",
    },
  ],
};

export const demoImageUrl =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f4f7f4"/>
          <stop offset="100%" stop-color="#d8e7d2"/>
        </linearGradient>
        <radialGradient id="leaf" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#8bb174"/>
          <stop offset="100%" stop-color="#456a39"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#bg)"/>
      <ellipse cx="620" cy="470" rx="270" ry="360" fill="url(#leaf)" transform="rotate(12 620 470)"/>
      <path d="M420 705 C580 530 720 365 810 190" stroke="#d6e7c8" stroke-width="16" fill="none" stroke-linecap="round"/>
      <path d="M510 585 C430 520 385 470 350 405" stroke="#d6e7c8" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M595 470 C535 430 490 390 448 330" stroke="#d6e7c8" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M690 360 C760 315 815 265 860 210" stroke="#d6e7c8" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M725 510 C805 500 870 470 930 420" stroke="#d6e7c8" stroke-width="10" fill="none" stroke-linecap="round"/>
      <circle cx="565" cy="328" r="82" fill="#6d432f"/>
      <circle cx="565" cy="328" r="48" fill="#b98352"/>
      <circle cx="675" cy="612" r="44" fill="#74492f"/>
      <circle cx="675" cy="612" r="24" fill="#b98352"/>
      <circle cx="1080" cy="110" r="60" fill="#ffffff" opacity="0.35"/>
    </svg>
  `);
