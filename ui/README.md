# SEM Material Agent

An agentic AI application for material science professionals to search, identify, and analyze Scanning Electron Microscopy (SEM) imagery using advanced generative models.

![App Screenshot](https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1000)

## Features

### 1. Advanced Repository Search & Visualization
- **Deep Search**: Scours scientific repositories (ScienceDirect, Springer, Nature, etc.) for material morphology.
- **Visual Reconstruction**: "Screenshots" and renders high-fidelity synthetic SEM images based on visual descriptors extracted from literature using the `gemini-3-pro-image-preview` model.

### 2. Material Identification
- **Image Recognition**: Upload unidentified SEM micrographs.
- **Analysis**: Identifies material phase, likely composition, and morphology with high confidence.

### 3. Quantitative Microstructure Analysis
- **Detailed Reporting**: Generates scientific reports including grain size estimation, feature counts, and defect detection.
- **Methodology**: Explains the reasoning behind the analysis.

### 4. Secure Research Environment
- **Authentication**: Simulated secure login for researchers.
- **Session Management**: Persists user sessions.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **AI**: Google GenAI SDK (`@google/genai`)
  - `gemini-3-pro-preview` for reasoning and search.
  - `gemini-3-pro-image-preview` for vision analysis and image generation.
- **Icons**: Lucide React

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/neogyk/ai_material_mic.git
   ```
2. Set your Google Gemini API Key in the environment variables (`API_KEY`).
3. Run the development server.

## License

MIT
