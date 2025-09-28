'use client';

interface HeroSectionProps {
    tagline: string;
    playFabId: string | null;
    onCopyId: () => void;
    copied: boolean;
}

export default function HeroSection({ tagline, playFabId, onCopyId, copied }: HeroSectionProps) {
    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-slate-800 to-black transition-colors duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-blue-900/10 to-indigo-900/10"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,119,198,0.1)_0%,transparent_70%)]"></div>
            <div className="relative max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
                <div className="text-center">
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-2">
                        Welcome to the Arena
                    </h1>
                    <p className="text-sm text-slate-300 mb-3 max-w-2xl mx-auto leading-relaxed">
                        {tagline || "Where champions are made and legends are born"}
                    </p>
                    <div className="flex items-center justify-center">
                        <div className="flex items-center space-x-2 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-slate-600/30 rounded-lg px-3 py-1 shadow-lg">
                            <span className="text-slate-300 text-xs font-medium">Player ID:</span>
                            <code className="text-white font-mono text-xs bg-slate-900/50 px-1 py-0.5 rounded border border-slate-600/30">{playFabId?.slice(0, 8)}...</code>
                            <button
                                onClick={onCopyId}
                                className="text-slate-400 hover:text-slate-200 transition-colors p-1 hover:bg-slate-700/50 rounded"
                                aria-label="Copy PlayFab ID"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                            {copied && <span className="text-green-400 text-xs font-medium">Copied!</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}