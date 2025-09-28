'use client';

import { Bar } from 'react-chartjs-2';
import { ChartSkeleton } from '@/components/ui/SkeletonLoader';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface PlayerStatsChartProps {
    gamesPlayed: number;
    trophies: number;
    loading: boolean;
}

export default function PlayerStatsChart({ gamesPlayed, trophies, loading }: PlayerStatsChartProps) {
    const chartData = {
        labels: ['Games Played', 'Trophies'],
        datasets: [
            {
                label: 'Player Statistics',
                data: [gamesPlayed, trophies],
                backgroundColor: ['rgba(59, 130, 246, 0.6)', 'rgba(16, 185, 129, 0.6)'], // Blue and Green with transparency
                borderColor: ['#3b82f6', '#10b981'], // Solid colors for borders
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, // Hide legend since we show labels on x-axis
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#374151',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    title: function(context: any) {
                        return context[0].label;
                    },
                    label: function(context: any) {
                        return `Count: ${context.parsed.y.toLocaleString()}`;
                    }
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)', // Very light grid lines
                    drawBorder: false,
                },
                ticks: {
                    color: '#64748b',
                    font: {
                        size: 12,
                    },
                    callback: function(value: any) {
                        return value.toLocaleString();
                    }
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#64748b',
                    font: {
                        size: 12,
                        weight: 500,
                    },
                    maxRotation: 0,
                },
            },
        },
        interaction: {
            intersect: false,
            mode: 'index' as const,
        },
        animation: {
            duration: 1000,
            easing: 'easeOutQuart' as const,
        },
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-purple-900/30 via-slate-800/40 to-indigo-900/30 backdrop-blur-sm border border-purple-500/20 rounded-lg p-2 shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">Player Statistics</h3>
                    <div className="bg-purple-500/20 border border-purple-500/30 px-2 py-1 rounded-md">
                        <span className="text-purple-300 font-medium text-xs">Loading...</span>
                    </div>
                </div>
                <ChartSkeleton />
            </div>
        );
    }

    const hasData = gamesPlayed > 0 || trophies > 0;

    return (
        <div className="bg-gradient-to-br from-purple-900/30 via-slate-800/40 to-indigo-900/30 backdrop-blur-sm border border-purple-500/20 rounded-lg p-2 shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Player Statistics</h3>
                <div className="bg-purple-500/20 border border-purple-500/30 px-2 py-1 rounded-md">
                    <span className="text-purple-300 font-medium text-xs">Games & Trophies</span>
                </div>
            </div>
            
            {!hasData ? (
                <div className="text-center py-8">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-lg font-bold text-slate-500 dark:text-slate-400">STATS</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium text-sm">No statistics yet</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Start playing games to see your progress</p>
                </div>
            ) : (
                <div>
                    {/* Chart Container */}
                    <div className="relative h-32 mb-2">
                        <Bar data={chartData} options={chartOptions} />
                    </div>

                    {/* Statistics Summary Cards */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center border border-blue-200 dark:border-blue-700">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1"></div>
                            <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Games Played</p>
                            <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                {gamesPlayed.toLocaleString()}
                            </p>
                        </div>
                        
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center border border-green-200 dark:border-green-700">
                            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
                            <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">Trophies</p>
                            <p className="text-lg font-bold text-green-900 dark:text-green-100">
                                {trophies.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Total Summary */}
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600 dark:text-slate-400 text-xs">Total Achievement Score:</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                {(gamesPlayed + trophies).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}