"use client";

import { useSession } from 'next-auth/react';
import SignIn from '@/components/auth/SignIn';
import { useEffect, useState } from 'react';
import {
    getLeaderboard,
    playFabLoginWithAzureAD,
} from '@/lib/playfab/playfab';
import dynamic from 'next/dynamic';
import LeaderboardChart from '@/components/dashboard/LeaderboardChart';

const Model = dynamic(() => import('@/components/Model'), {
    ssr: false,
});

interface Player {
    name: string;
    trophies: number;
    gamesPlayed: number;
    rank: number;
}

type SortOption = 'Trophies' | 'Games Played';

const sortFieldMap: Record<SortOption, keyof Player> = {
    'Trophies': 'trophies',
    'Games Played': 'gamesPlayed',
};

const statKeyMap: Record<SortOption, string> = {
    'Trophies': 'Trophies',
    'Games Played': 'Games Played',
};

export default function LeaderBoard() {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [leaders, setLeaders] = useState<Player[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>('Trophies');
    const titleId = process.env.NEXT_PUBLIC_PLAYFAB_TITLE_ID!;

    useEffect(() => {
        const fetchLeaderboard = async () => {
            if (!session) return;

            let sessionTicket = null;
            if (typeof window !== 'undefined') {
                sessionTicket = sessionStorage.getItem('playfabSessionTicket');
            }

            if (!sessionTicket) {
                try {
                    const response = await playFabLoginWithAzureAD(titleId, session);
                    if (!response.error && response.data?.SessionTicket) {
                        sessionTicket = response.data.SessionTicket;
                        sessionStorage.setItem('playfabSessionTicket', sessionTicket);
                    } else {
                        console.error('PlayFab login failed', response.error);
                        setLoading(false);
                        return;
                    }
                } catch (err) {
                    console.error('PlayFab login error:', err);
                    setLoading(false);
                    return;
                }
            }

            setLoading(true);
            const result = await getLeaderboard(
                sessionTicket,
                titleId,
                statKeyMap[sortBy]
            );

            if (result?.data?.Leaderboard) {
                const mapped = result.data.Leaderboard.map((entry: any) => ({
                    name: entry.DisplayName ?? entry.PlayFabId,
                    trophies: sortBy === 'Trophies' ? entry.StatValue : 0,
                    gamesPlayed: sortBy === 'Games Played' ? entry.StatValue : 0,
                    rank: entry.Position + 1,
                }));
                setLeaders(mapped);
            } else {
                setLeaders([]);
            }

            setLoading(false);
        };

        fetchLeaderboard();
    }, [session, titleId, sortBy]);

    const sortedLeaders = [...leaders].sort(
        (a, b) =>
            (b[sortFieldMap[sortBy]] as number) - (a[sortFieldMap[sortBy]] as number)
    );


    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
                <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-12 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl"></div>
                    <div className="relative flex items-center space-x-4">
                        <div className="w-8 h-8 border-4 border-gradient-to-r from-blue-500 to-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-white font-medium text-lg">Loading Leaderboard...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!session) {
        return <SignIn />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                                Leaderboard
                            </h1>
                            <p className="text-slate-300 mt-2 text-base">Weekly competition rankings</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full animate-pulse"></div>
                            <span className="inline-block bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-purple-500/30">
                                Top Players
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Champion Showcase */}
                    
                    <div className="lg:col-span-1">
                        <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
                            <div className="relative">
                                
                                {leaders[0] ? (
                                    <div className="text-center">
                                        {/* 3D Model */}
                                        <div className="relative h-96 bg-gradient-to-b from-slate-700/50 to-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-inner">
                                            <div className="relative h-full">
                                                <Model name={leaders[0].name.split(' ')[0]} />
                                            </div>
                                        </div>
                                        
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 bg-gradient-to-r from-slate-700 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                            <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        </div>
                                        <p className="text-slate-400">No champion yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Leaderboard Chart */}
                    <div className="lg:col-span-2">
                        {/* Controls */}
                        <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 mb-6 shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl"></div>
                            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center mb-4 sm:mb-0">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                                        Rankings Visualization
                                    </h2>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <label className="text-sm font-medium text-slate-300">
                                        View by:
                                    </label>
                                    <div className="flex bg-slate-700/50 backdrop-blur-sm rounded-xl p-1">
                                        <button
                                            onClick={() => setSortBy('Trophies')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                                                sortBy === 'Trophies'
                                                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                                                    : 'text-slate-400 hover:text-white hover:bg-slate-600/50'
                                            }`}
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span>Trophies</span>
                                        </button>
                                        <button
                                            onClick={() => setSortBy('Games Played')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                                                sortBy === 'Games Played'
                                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                                                    : 'text-slate-400 hover:text-white hover:bg-slate-600/50'
                                            }`}
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                            </svg>
                                            <span>Games Played</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        {loading ? (
                            <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl"></div>
                                <div className="relative h-96 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-12 h-12 border-4 border-gradient-to-r from-blue-500 to-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-slate-300 text-lg">Loading chart...</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <LeaderboardChart players={sortedLeaders} sortBy={sortBy} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}