import { GoogleGenAI, Type } from "@google/genai";
import { SearchResponse, AnalysisResult } from "../types";

// Helper to get AI instance
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * FEATURE 1: Advanced Search SEM images & Publications
 * Uses Grounding (Google Search) to scour scientific repositories.
 */
export const searchSEMPublications = async (query: string): Promise<SearchResponse> => {
  const ai = getAI();
  const model = 'gemini-3-pro-preview';

  const prompt = `
    You are an advanced Material Science Research Agent. 
    MISSION: Perform a deep search for Scanning Electron Microscopy (SEM) images of: "${query}".
    
    SEARCH TARGETS:
    - ScienceDirect (Elsevier)
    - SpringerLink
    - Wiley Online Library
    - Nature Portfolio
    - ACS Publications
    - University Open Access Repositories
    
    INSTRUCTIONS:
    1. Locate specific papers or articles containing SEM micrographs of this material.
    2. Extract a "visual_context": A highly detailed, purely visual description of the microstructure (e.g., "hexagonal grains with 2um average size, distinct grain boundaries, secondary phase precipitates at triple points, smooth surface texture"). This will be used to render the image.
    3. Extract a "summary": A broader technical overview of the material's properties and typical morphology.
    4. List the sources.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Technical summary of properties and morphology." },
            visual_context: { type: Type.STRING, description: "Detailed visual prompt for image generation (morphology, texture, contrast)." },
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  source: { type: Type.STRING },
                  url: { type: Type.STRING },
                  snippet: { type: Type.STRING },
                  relevance: { type: Type.STRING, description: "Why this source is relevant." }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text) as SearchResponse;
      return data;
    }
    throw new Error("No response from agent.");
  } catch (error) {
    console.error("Search Agent Error:", error);
    throw error;
  }
};

/**
 * Renders the "Screenshot" / Visual Reconstruction
 */
export const generateReferenceSEM = async (visualContext: string, originalQuery: string): Promise<string> => {
  const ai = getAI();
  const model = 'gemini-3-pro-image-preview';
  
  const prompt = `Render a scientific SEM (Scanning Electron Microscope) micrograph of ${originalQuery}.
  
  VISUAL SPECIFICATIONS:
  ${visualContext}
  
  STYLE:
  - High magnification, grayscale, secondary electron (SE) mode.
  - Realistic noise, depth of field, and charging effects if applicable.
  - Scientific accuracy is paramount.
  - Add a data bar / scale bar at the bottom (e.g. "10 µm", "2 µm") typical of SEM interfaces.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: "4:3", // Typical monitor/capture aspect ratio
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

/**
 * FEATURE 2: Identify Material from Image
 */
export const identifyMaterialFromImage = async (base64Image: string): Promise<AnalysisResult> => {
  const ai = getAI();
  const model = 'gemini-3-pro-image-preview';

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Identify the material shown in this SEM micrograph. Analyze the phase, morphology, and likely composition. output JSON." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            materialName: { type: Type.STRING },
            confidence: { type: Type.STRING },
            characteristics: { type: Type.ARRAY, items: { type: Type.STRING } },
            morphology: { type: Type.STRING },
            defects: { type: Type.ARRAY, items: { type: Type.STRING } },
            rawAnalysis: { type: Type.STRING, description: "A detailed paragraph explaining the reasoning." }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("Failed to identify material.");
  } catch (error) {
    console.error("Identification Error:", error);
    throw error;
  }
};

/**
 * FEATURE 3: Analyze Process/Morphology
 */
export const analyzeSEMImage = async (base64Image: string, focusPrompt: string): Promise<AnalysisResult> => {
  const ai = getAI();
  const model = 'gemini-3-pro-image-preview';

  const fullPrompt = `Analyze this SEM image. Provide a comprehensive technical report. 
  Focus on: ${focusPrompt || "General morphology and defects"}.
  
  Include:
  1. Detailed morphological description.
  2. Quantitative measurements where possible (average grain size, porosity estimate, particle counts).
  3. A summary of the analysis methodology/reasoning used.
  
  Output JSON.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: fullPrompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            morphology: { type: Type.STRING },
            defects: { type: Type.ARRAY, items: { type: Type.STRING } },
            characteristics: { type: Type.ARRAY, items: { type: Type.STRING } },
            quantitativeData: {
              type: Type.OBJECT,
              properties: {
                grainSize: { type: Type.STRING },
                featureCounts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      feature: { type: Type.STRING },
                      count: { type: Type.STRING }
                    }
                  }
                },
                otherMetrics: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            methodologySummary: { type: Type.STRING },
            rawAnalysis: { type: Type.STRING, description: "Detailed scientific analysis of the features." }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("Failed to analyze image.");
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};