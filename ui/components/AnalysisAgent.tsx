import React, { useState, useRef } from 'react';
import { Upload, Scan, FileText, ChevronRight, AlertCircle, CheckCircle2, Microscope, Ruler, FileSearch } from 'lucide-react';
import { identifyMaterialFromImage, analyzeSEMImage } from '../services/geminiService';
import { AnalysisResult, AppMode } from '../types';

interface Props {
  mode: AppMode.IDENTIFY | AppMode.ANALYZE;
}

const AnalysisAgent: React.FC<Props> = ({ mode }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix
        const base64Data = base64String.split(',')[1];
        setImage(base64Data);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const executeAgent = async () => {
    if (!image) return;
    setLoading(true);
    try {
      let res: AnalysisResult;
      if (mode === AppMode.IDENTIFY) {
        res = await identifyMaterialFromImage(image);
      } else {
        res = await analyzeSEMImage(image, customPrompt);
      }
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Agent failed to process image. Ensure API Key is set.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Input Section */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {mode === AppMode.IDENTIFY ? <Scan className="text-blue-400" /> : <Microscope className="text-teal-400" />}
            {mode === AppMode.IDENTIFY ? 'Material Identification' : 'Microstructure Analysis'}
          </h2>
          <p className="text-gray-400 text-sm">
            {mode === AppMode.IDENTIFY 
              ? "Upload an unknown SEM micrograph to identify the material and phase."
              : "Perform detailed analysis of grain size, defects, and processing history."}
          </p>
        </div>

        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 h-[400px] relative overflow-hidden
            ${image ? 'border-blue-500 bg-slate-900/50' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/30'}`}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          
          {image ? (
            <div className="relative w-full h-full">
              <img src={`data:image/jpeg;base64,${image}`} alt="SEM Input" className="w-full h-full object-contain" />
              {loading && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center">
                  <div className="w-full max-w-xs h-1 bg-slate-700 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-blue-500 animate-progress"></div>
                  </div>
                  <p className="text-blue-300 animate-pulse font-mono text-sm">SCANNING MICROSTRUCTURE...</p>
                </div>
              )}
              {/* Scanline Effect */}
              {!loading && <div className="scan-line"></div>}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <p className="text-white font-medium">Drop SEM image here</p>
                <p className="text-slate-500 text-sm mt-1">or click to browse</p>
              </div>
            </div>
          )}
        </div>

        {mode === AppMode.ANALYZE && (
           <div className="space-y-2">
             <label className="text-sm text-gray-400">Focus Analysis On (Optional):</label>
             <input 
              type="text" 
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., Measure porosity, Detect micro-cracks..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
             />
           </div>
        )}

        <button
          onClick={executeAgent}
          disabled={!image || loading}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-all
            ${!image || loading 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:shadow-lg hover:shadow-blue-500/25'}`}
        >
          {loading ? 'PROCESSING...' : 'RUN AGENT'}
        </button>
      </div>

      {/* Output Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 overflow-y-auto max-h-[700px] custom-scrollbar">
        {!result ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
            <FileText className="w-16 h-16 opacity-20" />
            <p>Analysis results will appear here</p>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in-up">
            {/* Header / ID Section */}
            {mode === AppMode.IDENTIFY && result.materialName && (
               <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg flex items-start gap-4">
                 <CheckCircle2 className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                 <div>
                   <h3 className="text-sm text-blue-400 uppercase tracking-wide font-bold">Identified Material</h3>
                   <p className="text-2xl text-white font-bold mt-1">{result.materialName}</p>
                   <p className="text-sm text-blue-300 mt-1">Confidence: {result.confidence || 'High'}</p>
                 </div>
               </div>
            )}

            {/* General Morphology & Characteristics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-slate-800/50 p-4 rounded-lg">
                 <h4 className="text-gray-400 text-xs uppercase mb-2 font-semibold">Morphology</h4>
                 <p className="text-white text-sm leading-relaxed">{result.morphology || 'N/A'}</p>
               </div>
               <div className="bg-slate-800/50 p-4 rounded-lg">
                 <h4 className="text-gray-400 text-xs uppercase mb-2 font-semibold">Defects Detected</h4>
                 {result.defects && result.defects.length > 0 ? (
                   <ul className="list-disc list-inside text-white text-sm space-y-1">
                     {result.defects.map((d, i) => <li key={i}>{d}</li>)}
                   </ul>
                 ) : (
                   <p className="text-white text-sm">None detected</p>
                 )}
               </div>
            </div>

            {/* NEW: Quantitative Report Section */}
            {result.quantitativeData && (
              <div className="border border-teal-500/30 bg-teal-900/10 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
                <h3 className="text-teal-300 font-bold flex items-center gap-2 mb-4">
                  <Ruler className="w-5 h-5" /> Quantitative Report
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                  {result.quantitativeData.grainSize && (
                    <div className="col-span-1">
                      <p className="text-xs text-teal-500/80 uppercase mb-1">Avg. Grain Size</p>
                      <p className="text-xl text-white font-mono">{result.quantitativeData.grainSize}</p>
                    </div>
                  )}
                  
                  {result.quantitativeData.featureCounts && result.quantitativeData.featureCounts.length > 0 && (
                     <div className="col-span-1 sm:col-span-2">
                       <p className="text-xs text-teal-500/80 uppercase mb-2">Feature Counts</p>
                       <div className="grid grid-cols-2 gap-2">
                         {result.quantitativeData.featureCounts.map((item, idx) => (
                           <div key={idx} className="bg-black/30 px-3 py-2 rounded flex justify-between items-center">
                             <span className="text-sm text-gray-300">{item.feature}</span>
                             <span className="text-sm font-bold text-teal-200">{item.count}</span>
                           </div>
                         ))}
                       </div>
                     </div>
                  )}

                  {result.quantitativeData.otherMetrics && (
                     <div className="col-span-1 sm:col-span-2">
                        <p className="text-xs text-teal-500/80 uppercase mb-1">Other Metrics</p>
                        <div className="flex flex-wrap gap-2">
                          {result.quantitativeData.otherMetrics.map((m, i) => (
                            <span key={i} className="text-xs bg-teal-900/40 text-teal-100 px-2 py-1 rounded border border-teal-500/20">{m}</span>
                          ))}
                        </div>
                     </div>
                  )}
                </div>
              </div>
            )}

            {/* NEW: Methodology Summary */}
            {result.methodologySummary && (
              <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                <h4 className="text-purple-400 text-xs uppercase mb-2 flex items-center gap-2 font-bold">
                  <FileSearch className="w-3 h-3" /> Analysis Methodology
                </h4>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {result.methodologySummary}
                </p>
              </div>
            )}

            {/* Detailed Text Analysis */}
            <div>
              <h3 className="text-white font-semibold mb-3 border-b border-slate-800 pb-2">Full Scientific Analysis</h3>
              <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {result.rawAnalysis}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisAgent;