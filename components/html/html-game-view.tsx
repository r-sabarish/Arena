'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AddArenaCoins, AddGamePlayedCount, AddTrophies } from '@/lib/playfab/playfab';
import styles from './html-game.module.css';
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
        <div style={{ width: '100%', height: '100vh', position: 'relative', backgroundColor: '#001f3f' }}>
            <iframe
                src={getGameUrl()}
                className={styles.gameIframe}
                title={buildName || 'HTML Game'}
                allow="fullscreen; autoplay; microphone; camera; gamepad; payment"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
            <button className={styles.backButton} onClick={handleExit}>
                ← Back
            </button>
        </div>
    );
};

export default HTMLGameView;