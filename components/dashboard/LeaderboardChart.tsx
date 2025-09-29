"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface Player {
    name: string;
    trophies: number;
    gamesPlayed: number;
    rank: number;
}

interface LeaderboardChartProps {
    players: Player[];
    sortBy: 'Trophies' | 'Games Played';
}

export default function LeaderboardChart({ players, sortBy }: LeaderboardChartProps) {
    // Get top 10 players for better chart readability
    const topPlayers = players.slice(0, 10);
    
    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return 'rgba(255, 215, 0, 0.8)'; // Gold
            case 2: return 'rgba(192, 192, 192, 0.8)'; // Silver
            case 3: return 'rgba(205, 127, 50, 0.8)'; // Bronze
            default: return 'rgba(59, 130, 246, 0.8)'; // Blue
        }
    };

    const data = {
        labels: topPlayers.map(player => player.name.length > 12 ? player.name.substring(0, 12) + '...' : player.name),
        datasets: [
            {
                label: sortBy,
                data: topPlayers.map(player => 
                    sortBy === 'Trophies' ? player.trophies : player.gamesPlayed
                ),
                backgroundColor: topPlayers.map(player => getRankColor(player.rank)),
                borderColor: topPlayers.map(player => {
                    switch (player.rank) {
                        case 1: return 'rgba(255, 215, 0, 1)';
                        case 2: return 'rgba(192, 192, 192, 1)';
                        case 3: return 'rgba(205, 127, 50, 1)';
                        default: return 'rgba(59, 130, 246, 1)';
                    }
                }),
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: 'rgb(203, 213, 225)', // slate-300
                    font: {
                        size: 14,
                        weight: '500' as const,
                    },
                },
            },
            title: {
                display: true,
                text: `Top 10 Players - ${sortBy}`,
                color: 'rgb(255, 255, 255)', // white
                font: {
                    size: 18,
                    weight: 'bold' as const,
                },
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: 'rgb(255, 255, 255)',
                bodyColor: 'rgb(255, 255, 255)',
                borderColor: 'rgb(71, 85, 105)',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    title: function(context: any) {
                        const player = topPlayers[context[0].dataIndex];
                        return `#${player.rank} ${player.name}`;
                    },
                    label: function(context: any) {
                        const value = context.parsed.y;
                        return `${sortBy}: ${value.toLocaleString()}`;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(148, 163, 184, 0.2)', // slate-300 with lower opacity
                    drawBorder: false,
                },
                ticks: {
                    color: 'rgb(203, 213, 225)', // slate-300
                    font: {
                        size: 12,
                    },
                },
                title: {
                    display: true,
                    text: sortBy,
                    color: 'rgb(203, 213, 225)', // slate-300
                    font: {
                        size: 14,
                        weight: '600' as const,
                    },
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: 'rgb(203, 213, 225)', // slate-300
                    font: {
                        size: 11,
                        weight: '500' as const,
                    },
                    maxRotation: 45,
                },
            },
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart' as const,
        },
    };

    if (topPlayers.length === 0) {
        return (
            <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl"></div>
                <div className="relative h-96 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-slate-700 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                            </svg>
                        </div>
                        <p className="text-slate-300 font-medium text-lg">No data available for chart</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl"></div>
            <div className="relative">
                <div className="h-96">
                    <Bar data={data} options={options} />
                </div>
                
                {/* Legend for rank colors */}
                <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm">
                    <div className="flex items-center space-x-3 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm px-4 py-2 rounded-full">
                        <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full shadow-lg"></div>
                        <span className="text-yellow-200 font-medium">1st Place</span>
                    </div>
                    <div className="flex items-center space-x-3 bg-gradient-to-r from-gray-500/20 to-gray-600/20 backdrop-blur-sm px-4 py-2 rounded-full">
                        <div className="w-4 h-4 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full shadow-lg"></div>
                        <span className="text-gray-200 font-medium">2nd Place</span>
                    </div>
                    <div className="flex items-center space-x-3 bg-gradient-to-r from-orange-500/20 to-orange-600/20 backdrop-blur-sm px-4 py-2 rounded-full">
                        <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full shadow-lg"></div>
                        <span className="text-orange-200 font-medium">3rd Place</span>
                    </div>
                    <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-sm px-4 py-2 rounded-full">
                        <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-lg"></div>
                        <span className="text-blue-200 font-medium">Other Ranks</span>
                    </div>
                </div>
            </div>
        </div>
    );
}