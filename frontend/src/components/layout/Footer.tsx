import React from 'react';
import { Code2, Github, Terminal, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">SCRIPTORIUM</p>
              <p className="text-xs text-slate-500">Developer Community & Coding Practice Platform</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Terminal className="w-3.5 h-3.5" />
              Isolated Judge0 Sandbox
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              MySQL 8 & SQLAlchemy
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              React & Monaco
            </span>
          </div>

          <p className="text-xs text-slate-400">
            &copy; 2026 Scriptorium. Code. Connect. Compete.
          </p>
        </div>
      </div>
    </footer>
  );
};
