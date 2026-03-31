export interface Product {
  id: string;
  name: string;
  description: string;
  amazonLink: string;
}

export interface IssueSpot {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  treatingProductId: string;
}

export interface CropAnalysis {
  plantSpecies: string;
  diagnosis: string;
  confidence: "High" | "Medium" | "Low";
  symptoms: string[];
  causes: string[];
  treatment: {
    immediate: string[];
    prevention: string[];
  };
  products: Product[];
  urgency: "Low" | "Moderate" | "High";
  detailedReport: string;
  issueSpots: IssueSpot[];
}
