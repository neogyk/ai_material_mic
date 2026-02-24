import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Search, Scan, Microscope, Info, LogOut, User as UserIcon, Github } from 'lucide-react';
import { AppMode, User } from './types';
import SearchAgent from './components/SearchAgent';
import AnalysisAgent from './components/AnalysisAgent';
import AuthScreen from './components/AuthScreen';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppMode>(AppMode.SEARCH);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
    }
    
    // Check for existing session
    const storedSession = localStorage.getItem('sem_session');
    if (storedSession) {
      try {
        setUser(JSON.parse(storedSession));
      } catch (e) {
        localStorage.removeItem('sem_session');
      }
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('sem_session');
    setUser(null);
  };

  if (apiKeyMissing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
        <div className="max-w-md text-center space-y-4">
          <Info className="w-12 h-12 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold">API Key Missing</h1>
          <p className="text-gray-400">
            Please configure the <code>API_KEY</code> in your environment variables to use the Gemini API.
          </p>
        </div>
      </div>
    );
  }

  // Auth Guard
  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-teal-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <LayoutDashboard className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                SEM<span className="font-light text-blue-400">Agent</span>
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex gap-1 bg-slate-900/50 p-1 rounded-lg border border-white/5">
                <NavButton 
                  active={activeTab === AppMode.SEARCH} 
                  onClick={() => setActiveTab(AppMode.SEARCH)}
                  icon={<Search className="w-4 h-4" />}
                  label="Search"
                />
                <NavButton 
                  active={activeTab === AppMode.IDENTIFY} 
                  onClick={() => setActiveTab(AppMode.IDENTIFY)}
                  icon={<Scan className="w-4 h-4" />}
                  label="Identify"
                />
                <NavButton 
                  active={activeTab === AppMode.ANALYZE} 
                  onClick={() => setActiveTab(AppMode.ANALYZE)}
                  icon={<Microscope className="w-4 h-4" />}
                  label="Analyze"
                />
              </div>

              <div className="h-6 w-px bg-slate-700 mx-2 hidden md:block"></div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-400">Researcher</p>
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8 animate-fade-in">
        {activeTab === AppMode.SEARCH && <SearchAgent />}
        {activeTab === AppMode.IDENTIFY && <AnalysisAgent mode={AppMode.IDENTIFY} />}
        {activeTab === AppMode.ANALYZE && <AnalysisAgent mode={AppMode.ANALYZE} />}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full glass-panel border-t border-white/5 py-2 px-6 text-center z-40">
        <p className="text-xs text-slate-500 font-mono flex items-center justify-center gap-2">
          POWERED BY GEMINI 2.5/3.0 • MATERIALS SCIENCE AGENT • V1.0.0
          <span className="text-slate-700">|</span>
          <a href="https://github.com/neogyk/ai_material_mic" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-blue-400 transition-colors">
            <Github className="w-3 h-3" /> GITHUB
          </a>
        </p>
      </footer>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
      ${active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
        : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
  >
    {icon}
    {label}
  </button>
);

export default App;