"use client";

import { useSession } from 'next-auth/react';
import SignIn from '@/components/auth/SignIn';
import { useEffect, useState } from 'react';
import {
    getLeaderboard,
    playFabLoginWithAzureAD,
} from '@/lib/playfab/playfab';
import dynamic from 'next/dynamic';

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

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return '1st';
            case 2: return '2nd';
            case 3: return '3rd';
            default: return `#${rank}`;
        }
    };

    const getRankStyle = (rank: number) => {
        switch (rank) {
            case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
            case 2: return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
            case 3: return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
            default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center transition-colors duration-300">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">Loading Leaderboard...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!session) {
        return <SignIn />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Leaderboard</h1>
                            <p className="text-slate-600 dark:text-slate-400 mt-2">Weekly competition rankings</p>
                        </div>
                        <div>
                            <span className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
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
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 text-center">
                                Current Champion
                            </h2>
                            
                            {leaders[0] ? (
                                <div className="text-center">
                                    {/* 3D Model */}
                                    <div className="h-64 mb-4 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-lg overflow-hidden">
                                        <Model name={leaders[0].name.split(' ')[0]} />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                            {leaders[0].name}
                                        </h3>
                                        <div className="flex justify-center space-x-4 text-sm">
                                            <div className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-full">
                                                {leaders[0].trophies} trophies
                                            </div>
                                            <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                                                {leaders[0].gamesPlayed} games
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-xl font-bold">1st</span>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400">No champion yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Leaderboard Table */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
                            {/* Controls */}
                            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 sm:mb-0">
                                        Rankings
                                    </h2>
                                    <div className="flex items-center space-x-3">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Sort by:
                                        </label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                                            className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors duration-200"
                                        >
                                            <option value="Trophies">Trophies</option>
                                            <option value="Games Played">Games Played</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700">
                                            <th className="text-left py-4 px-6 font-medium text-slate-900 dark:text-slate-100">Rank</th>
                                            <th className="text-left py-4 px-6 font-medium text-slate-900 dark:text-slate-100">Player</th>
                                            <th className="text-left py-4 px-6 font-medium text-slate-900 dark:text-slate-100">{sortBy}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            [...Array(5)].map((_, i) => (
                                                <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
                                                    <td className="py-4 px-6">
                                                        <div className="w-8 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="w-32 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="w-16 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : sortedLeaders.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="py-12 text-center">
                                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <span className="text-lg font-bold">Stats</span>
                                                    </div>
                                                    <p className="text-slate-500 dark:text-slate-400">No leaderboard data available</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            sortedLeaders.map((player, index) => (
                                                <tr key={player.rank} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                                                    <td className="py-4 px-6">
                                                        <div className={`inline-flex items-center justify-center w-10 h-8 rounded-lg font-bold text-sm ${getRankStyle(player.rank)}`}>
                                                            {getRankIcon(player.rank)}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                                {player.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="font-medium text-slate-900 dark:text-slate-100">
                                                                {player.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                                                            {player[sortFieldMap[sortBy]].toLocaleString()}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}