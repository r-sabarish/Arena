'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AddArenaCoins, AddGamePlayedCount, AddTrophies } from '@/lib/playfab/playfab';
import { useUnitySession } from '@/context/UnitySessionContext';
import { usePlayTimeSession } from '@/context/PlayTimeContext';

interface HTMLGameProps {
    gameId?: string;
    buildName?: string;
    folderName?: string;
}

interface Event {
    eventName?: string;
    rewards?: {
        arenaCoins?: number;
        trophies?: number;
    };
}

const HTMLGameView: React.FC<HTMLGameProps> = ({ gameId, buildName, folderName }) => {
    const router = useRouter();
    const { setIsUnityLoaded } = useUnitySession();
    const { isExpired } = usePlayTimeSession();

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Only handle messages from our game iframe
            if (event.origin !== window.location.origin) return;
            
            try {
                const data: Event = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                const ticket = sessionStorage.getItem('playfabSessionTicket');
                const titleId = process.env.NEXT_PUBLIC_PLAYFAB_TITLE_ID ?? '';
                if (!ticket || !titleId) return;

                if (data.eventName === 'ended') {
                    AddGamePlayedCount(ticket, titleId);
                    AddTrophies(ticket, titleId, data.rewards?.trophies ?? 0);
                    AddArenaCoins(ticket, titleId, data.rewards?.arenaCoins ?? 0);
                }
            } catch (error) {
                console.error('Failed to parse HTML game message:', error);
            }
        };

        const handleBlur = () => {
            setIsUnityLoaded(false);
        };
        const handleFocus = () => {
            setIsUnityLoaded(true);
        };

        if (isExpired) {
            alert("Your daily playtime has expired. Please come back tomorrow!");
            router.push('/dashboard');
            return;
        }

        setIsUnityLoaded(true);

        window.addEventListener('message', handleMessage);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);

        return () => {
            window.removeEventListener('message', handleMessage);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            setIsUnityLoaded(false);
        };
    }, [isExpired, router, setIsUnityLoaded]);

    const handleExit = () => {
        setIsUnityLoaded(false);
        router.push(`/arena/${gameId}`);
    };

    if (isExpired) {
        return null;
    }

    // Construct the correct path for the HTML game
    const getGameUrl = () => {
        if (folderName) {
            return `/games/${gameId}/${folderName}/index.html`;
        }
        return `/games/${gameId}/index.html`;
    };

    return (
        <div className="relative w-full h-screen bg-background-primary overflow-hidden">
            {/* Game Container */}
            <div className="relative w-full h-full">
                <iframe
                    src={getGameUrl()}
                    className="w-full h-full border-0 outline-none"
                    title={buildName || 'HTML Game'}
                    allow="fullscreen; autoplay; microphone; camera; gamepad; payment"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                />
            </div>

            {/* Modern Control Panel */}
            <div className="absolute top-0 left-0 right-0 z-50">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-background-secondary/95 to-background-tertiary/95 backdrop-blur-sm border-b border-primary-500/20">
                    {/* Game Info */}
                    <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-accent-500 animate-pulse"></div>
                        <div className="text-text-primary font-medium text-sm">
                            {buildName || 'HTML Game'}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center space-x-2">
                        {/* Back Button */}
                        <button 
                            onClick={handleExit}
                            className="group relative px-4 py-2 bg-primary-600 hover:bg-primary-700 text-text-primary font-medium text-sm rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-lg hover:shadow-primary-500/25 border border-primary-500/30"
                        >
                            <div className="flex items-center space-x-2">
                                <svg 
                                    className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                                    />
                                </svg>
                                <span>Exit</span>
                            </div>
                            
                            {/* Hover Effect */}
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary-500/20 to-accent-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            <div className="absolute inset-0 bg-background-primary/50 backdrop-blur-sm flex items-center justify-center z-40 opacity-0 pointer-events-none transition-opacity duration-300" id="loading-overlay">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-text-secondary text-sm font-medium">Loading Game...</div>
                </div>
            </div>
        </div>
    );
};

export default HTMLGameView;