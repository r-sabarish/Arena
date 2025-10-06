'use client';

interface HeroSectionProps {
    tagline: string;
    playFabId: string | null;
    onCopyId: () => void;
    copied: boolean;
}

export default function HeroSection({ tagline, playFabId, onCopyId, copied }: HeroSectionProps) {
    return (
        <div className="relative overflow-hidden">
            <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
                <div className="text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                        Welcome to the Arena
                    </h1>
                    <p className="text-base text-text-secondary mb-6 max-w-2xl mx-auto leading-relaxed">
                        {tagline || "Where champions are made and legends are born"}
                    </p>
                    <div className="flex items-center justify-center">
                        <div className="flex items-center space-x-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg px-4 py-2 shadow-md">
                            <span className="text-text-secondary text-sm font-medium">Player ID:</span>
                            <code className="text-text-primary font-mono text-sm bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 px-2 py-1 rounded">{playFabId?.slice(0, 8)}...</code>
                            <button
                                onClick={onCopyId}
                                className="text-text-muted p-2 rounded hover:text-text-secondary cursor-pointer transition-colors"
                                aria-label="Copy PlayFab ID"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                            {copied && <span className="text-success text-sm font-medium">Copied!</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}