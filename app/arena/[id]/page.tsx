'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import SignIn from '@/components/auth/SignIn';
import { usePlayTimeSession } from '@/context/PlayTimeContext';
import Popup from '@/components/popup/Popup';

interface Game {
    id: number;
    buildName: string;
    title: string;
    description: string;
    image: string[];
    video: string | null;
    details: string;
    category: string[];
    publisher: string;
    type: string;
}

export default function GameDetailPage() {
    const { data: session, status } = useSession();
    const { isExpired } = usePlayTimeSession();

    const params = useParams();
    const router = useRouter();
    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [popup, setPopup] = useState(false);

    useEffect(() => {
        const fetchGame = async () => {
            try {
                const res = await fetch(`/api/arena/games/${params?.id}`);
                if (!res.ok) throw new Error('Game not found');
                const data = await res.json();
                setGame(data);
            } catch (err) {
                console.error(err);
                setGame(null);
            } finally {
                setLoading(false);
            }
        };

        if (params?.id) {
            fetchGame();
        }
    }, [params?.id]);

    function handleOnClickPlay() {
        if (isExpired) {
            setPopup(true);
            return;
        }
        router.push(`/arena/play-game?Id=${game?.id}&Name=${game?.buildName}`);
    }

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-background-primary transition-colors duration-300">
                {/* Header Skeleton */}
                <div className="bg-card border-b border-border-light transition-colors duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mt-2 animate-pulse"></div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Media Preview Skeleton */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                                <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mb-4"></div>
                                <div className="flex space-x-2 justify-center">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Details Skeleton */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                                <div className="space-y-4">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!session) return <SignIn />;

    if (!game) {
        return (
            <div className="min-h-screen bg-background-primary flex items-center justify-center transition-colors duration-300">
                <div className="text-center">
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">😞</span>
                    </div>
                    <h2 className="text-2xl font-bold text-primary mb-4">Game Not Found</h2>
                    <p className="text-secondary mb-8">The game you're looking for doesn't exist or may have been removed.</p>
                    <button
                        onClick={() => router.push('/arena')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                    >
                        Back to Arena
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-primary transition-colors duration-300">
            {/* Popup */}
            {popup && (
                <Popup
                    message="Your daily playtime has expired. Please come back tomorrow!"
                    onClose={() => setPopup(false)}
                    type="error"
                />
            )}

            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900/80 to-gray-900/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white">{game.title}</h1>
                            <p className="text-gray-300 mt-2">by {game.publisher}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${game.type === 'unity'
                                ? 'bg-white/20 text-white backdrop-blur-sm'
                                : 'bg-white/20 text-white backdrop-blur-sm'
                                }`}>
                                {game.type === 'unity' ? 'Unity WebGL' : 'HTML Game'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Media Preview */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl shadow-lg p-6 transition-colors duration-300">
                            <div className="aspect-video bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden mb-4">
                                {activeIndex < game.image.length ? (
                                    <img
                                        src={game.image[activeIndex]}
                                        alt={`${game.title} preview ${activeIndex + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : game.video ? (
                                    <video
                                        src={game.video}
                                        className="w-full h-full object-cover"
                                        autoPlay
                                        playsInline
                                        controls
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                                        <div className="text-center">
                                            <span className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2 block">VIDEO</span>
                                            <p>No video available</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Media Navigation Dots */}
                            <div className="flex justify-center space-x-2 mb-6">
                                {game.image.map((_, index) => (
                                    <button
                                        key={`img-${index}`}
                                        className={`w-3 h-3 rounded-full transition-colors duration-200 ${activeIndex === index
                                            ? 'bg-blue-500'
                                            : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                                            }`}
                                        onClick={() => setActiveIndex(index)}
                                    />
                                ))}
                                {game.video && (
                                    <button
                                        key="video"
                                        className={`w-3 h-3 rounded-full transition-colors duration-200 ${activeIndex === game.image.length
                                            ? 'bg-blue-500'
                                            : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                                            }`}
                                        onClick={() => setActiveIndex(game.image.length)}
                                    />
                                )}
                            </div>

                             {/* Game Description */}
                             <div>
                                 <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
                                 <p className="text-gray-300 leading-relaxed">{game.description}</p>
                             </div>
                        </div>
                    </div>

                    {/* Game Details Sidebar */}
                    <div className="space-y-6">

                        {/* Game Details */}
                        <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl shadow-lg p-6 transition-colors duration-300">
                            <h2 className="text-lg font-semibold text-white mb-4">Game Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-1">Details</h3>
                                    <p className="text-gray-300">{game.details}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Categories</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {game.category.map((cat, index) => (
                                            <span
                                                key={index}
                                                className="inline-block bg-gray-700/50 backdrop-blur-sm text-gray-300 px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                                            >
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Play Button */}
                        <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl shadow-lg p-6 transition-colors duration-300">
                            <button
                                onClick={handleOnClickPlay}
                                disabled={isExpired}
                                className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg ${isExpired
                                    ? 'bg-red-600 hover:bg-red-700 text-white cursor-not-allowed opacity-75'
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                    }`}
                            >
                                {isExpired ? 'Playtime Expired' : 'Play ❌ '}
                            </button>

                            <button
                                onClick={() => router.push('/arena')}
                                className="w-full mt-3 py-3 bg-gray-700/50 backdrop-blur-sm hover:bg-gray-600/50 text-gray-300 rounded-lg font-medium transition-all duration-200 shadow-sm"
                            >
                                Back ⭕
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}