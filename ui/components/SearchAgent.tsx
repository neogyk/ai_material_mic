import React, { useState } from 'react';
import { Search, Globe, Image as ImageIcon, ExternalLink, Loader2, Sparkles, Database, ScanLine } from 'lucide-react';
import { searchSEMPublications, generateReferenceSEM } from '../services/geminiService';
import { SearchResponse } from '../types';

const SearchAgent: React.FC = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'idle' | 'searching' | 'rendering' | 'complete'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  
  const [data, setData] = useState<SearchResponse | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const performAdvancedSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Reset
    setData(null);
    setGeneratedImage(null);
    setStatus('searching');
    
    try {
      // Step 1: Search
      setStatusMessage('Querying scientific repositories (Elsevier, Springer, Nature)...');
      const searchResult = await searchSEMPublications(query);
      setData(searchResult);

      // Step 2: Render
      if (searchResult.visual_context) {
        setStatus('rendering');
        setStatusMessage('Extracting visual data & rendering micrograph...');
        const b64 = await generateReferenceSEM(searchResult.visual_context, query);
        setGeneratedImage(b64);
      } else {
        setStatusMessage('No visual context found to render.');
      }
      
      setStatus('complete');
    } catch (err) {
      console.error(err);
      setStatus('idle');
      alert("Agent failed during the pipeline. Please check API Key or quota.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300 flex items-center justify-center gap-3">
          <Database className="w-8 h-8 text-blue-500" />
          Advanced Repository Search
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Deploy the agent to scour global scientific databases, extract morphological data, 
          and <span className="text-blue-400 font-semibold">synthesize high-fidelity SEM imagery</span> of your target material.
        </p>
      </div>

      <form onSubmit={performAdvancedSearch} className="relative max-w-3xl mx-auto">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Target Material (e.g., 'Anodic Aluminum Oxide Nanopores', 'Pearlitic Steel Microstructure')"
            className="relative w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-14 pr-32 py-5 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-600"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 w-6 h-6" />
          
          <button 
            type="submit" 
            disabled={status !== 'idle' && status !== 'complete'}
            className="absolute right-3 top-3 bottom-3 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white px-6 rounded-md font-medium transition-all shadow-lg shadow-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {status === 'searching' || status === 'rendering' ? (
               <Loader2 className="animate-spin w-5 h-5" />
            ) : (
               <>
                 Find & Render
                 <ScanLine className="w-4 h-4 opacity-70" />
               </>
            )}
          </button>
        </div>
        
        {(status === 'searching' || status === 'rendering') && (
          <div className="text-center mt-4">
            <p className="text-blue-400 font-mono text-sm animate-pulse flex items-center justify-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              {statusMessage}
            </p>
          </div>
        )}
      </form>

      {/* Results Section */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in pb-12">
          
          {/* Left: Rendered Image (The "Screenshot") */}
          <div className="lg:col-span-7 space-y-4">
             <div className="glass-panel rounded-xl overflow-hidden border border-slate-700 shadow-2xl shadow-black relative group">
                {/* Browser-like Header to mimic "Screenshot" vibe */}
                <div className="bg-slate-900/80 border-b border-slate-700 p-3 flex items-center gap-2">
                   <div className="flex gap-1.5">
                     <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                     <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                     <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                   </div>
                   <div className="flex-1 bg-slate-950/50 rounded px-3 py-1 text-xs text-slate-500 font-mono truncate text-center">
                      {data.results[0]?.url || "https://repository.science/micrograph-viewer"}
                   </div>
                </div>

                <div className="relative aspect-[4/3] bg-black flex items-center justify-center">
                  {generatedImage ? (
                    <>
                      <img src={`data:image/png;base64,${generatedImage}`} alt="Rendered SEM" className="w-full h-full object-cover" />
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 font-mono border border-white/20">
                        20 µm
                      </div>
                      <div className="absolute top-4 left-4 bg-blue-600/90 text-white text-xs px-2 py-0.5 font-bold uppercase tracking-wider backdrop-blur-sm shadow-lg">
                        AI RECONSTRUCTION
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <Sparkles className="w-12 h-12 text-slate-700 mx-auto" />
                      <p className="text-slate-500">Awaiting Render...</p>
                    </div>
                  )}
                  
                  {status === 'rendering' && (
                     <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center">
                           <Loader2 className="w-10 h-10 text-teal-400 animate-spin mx-auto mb-3" />
                           <p className="text-teal-400 font-mono text-sm">SYNTHESIZING PIXELS...</p>
                        </div>
                     </div>
                  )}
                </div>
             </div>
             
             {generatedImage && (
               <div className="flex justify-between items-center px-2">
                 <p className="text-xs text-slate-500 font-mono">
                   Render generated based on descriptors from {data.results.length} scientific sources.
                 </p>
                 <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                   <ExternalLink className="w-3 h-3" /> View Source Context
                 </button>
               </div>
             )}
          </div>

          {/* Right: Data & Sources */}
          <div className="lg:col-span-5 space-y-6">
             <div className="glass-panel p-6 rounded-xl border-t-2 border-teal-500">
               <h3 className="text-teal-400 font-bold text-sm uppercase tracking-wider mb-3">Morphological Analysis</h3>
               <p className="text-gray-300 text-sm leading-relaxed">
                 {data.summary}
               </p>
               
               <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <h4 className="text-slate-500 text-xs uppercase mb-2">Visual Descriptors Extracted</h4>
                  <p className="text-xs text-slate-400 italic bg-slate-900/50 p-3 rounded border border-slate-800">
                    "{data.visual_context}"
                  </p>
               </div>
             </div>

             <div>
               <h3 className="text-white font-bold flex items-center gap-2 mb-4">
                 <Globe className="w-4 h-4 text-blue-500" /> 
                 Repository Matches ({data.results.length})
               </h3>
               <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                 {data.results.map((res, idx) => (
                   <div key={idx} className="bg-slate-800/40 p-3 rounded border border-slate-700/50 hover:border-blue-500/30 transition-colors group">
                     <a href={res.url} target="_blank" rel="noreferrer" className="block">
                       <h4 className="text-sm font-semibold text-blue-200 group-hover:text-blue-400 transition-colors line-clamp-1">{res.title}</h4>
                       <div className="flex items-center gap-2 mt-1">
                         <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            {res.source}
                         </span>
                       </div>
                       <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                         {res.snippet}
                       </p>
                     </a>
                   </div>
                 ))}
               </div>
             </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default SearchAgent;