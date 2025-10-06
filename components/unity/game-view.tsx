'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useUnityContext, Unity } from 'react-unity-webgl';
import { AddArenaCoins, AddGamePlayedCount, AddTrophies } from '@/lib/playfab/playfab';
import { useRouter } from 'next/navigation';
import { useUnitySession } from '@/context/UnitySessionContext';
import { usePlayTimeSession } from '@/context/PlayTimeContext';

interface PlayGameProps {
    Id?: string;
    Name?: string;
}

interface Event {
    eventName?: string;
    rewards?: {
        arenaCoins?: number;
        trophies?: number;
    };
}

const GameView: React.FC<PlayGameProps> = ({ Id, Name }) => {
    const router = useRouter();
    const { setIsUnityLoaded } = useUnitySession();
    const { isExpired } = usePlayTimeSession();

    const {
        unityProvider,
        isLoaded,
        addEventListener,
        removeEventListener,
    } = useUnityContext({
        loaderUrl: `/games/${Id}/Build/${Name}.loader.js`,
        dataUrl: `/games/${Id}/Build/${Name}.data`,
        frameworkUrl: `/games/${Id}/Build/${Name}.framework.js`,
        codeUrl: `/games/${Id}/Build/${Name}.wasm`,
        streamingAssetsUrl: `games/${Id}/StreamingAssets`,
    });

    useEffect(() => {
        const handleMessage = (message: any) => {
            try {
                const event: Event = JSON.parse(message);
                const ticket = sessionStorage.getItem('playfabSessionTicket');
                const titleId = process.env.NEXT_PUBLIC_PLAYFAB_TITLE_ID ?? '';
                if (!ticket || !titleId) return;

                if (event.eventName === 'ended') {
                    AddGamePlayedCount(ticket, titleId);
                    AddTrophies(ticket, titleId, event.rewards?.trophies ?? 0);
                    AddArenaCoins(ticket, titleId, event.rewards?.arenaCoins ?? 0);
                }
            } catch (error) {
                console.error('Failed to parse Unity message:', error);
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

        if (!isLoaded) {
            setIsUnityLoaded(false);
        } else {
            setIsUnityLoaded(true);
            addEventListener('OnMessage', handleMessage);
        }

        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);

        return () => {
            removeEventListener('OnMessage', handleMessage);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            setIsUnityLoaded(false);
        };
    }, [isLoaded, isExpired, router]);

    const handleExit = () => {
        setIsUnityLoaded(false);
        router.push(`/arena/${Id}`);
    };

    return (
        <div className="relative w-full h-screen bg-background-primary">
            <Unity
                unityProvider={unityProvider}
                className="w-full h-full"
            />
            <button 
                className="absolute top-4 right-4 z-10 bg-gradient-to-br from-accent-600 to-accent-700 text-white border-0 py-2 px-5 text-base font-semibold rounded-lg cursor-pointer mb-6 transition-all duration-300 select-none hover:bg-gradient-to-br hover:from-accent-700 hover:to-accent-800 hover:shadow-lg hover:shadow-accent-500/25" 
                onClick={handleExit}
            >
                ← Back
            </button>
        </div>
    );
};

export default dynamic(() => Promise.resolve(GameView), { ssr: false });
