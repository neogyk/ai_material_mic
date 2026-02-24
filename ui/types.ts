export enum AppMode {
  SEARCH = 'search',
  IDENTIFY = 'identify',
  ANALYZE = 'analyze'
}

export interface User {
  name: string;
  email: string;
}

export interface SearchResult {
  title: string;
  source: string;
  url?: string;
  snippet: string;
  relevance: string;
}

export interface SearchResponse {
  summary: string;
  visual_context: string; // Specific visual descriptors for generation
  results: SearchResult[];
  generatedReferenceImage?: string; // Base64 of a generated approximation
}

export interface QuantitativeData {
  grainSize?: string;
  featureCounts?: { feature: string; count: string }[];
  otherMetrics?: string[];
}

export interface AnalysisResult {
  materialName?: string;
  confidence?: string;
  characteristics: string[];
  morphology: string;
  defects: string[];
  quantitativeData?: QuantitativeData;
  methodologySummary?: string;
  rawAnalysis: string;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
  images?: string[]; // base64
  isError?: boolean;
}