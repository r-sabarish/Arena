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
                backgroundColor: ['rgba(59, 130, 246, 0.6)', 'rgba(16, 185, 129, 0.6)'],
                borderWidth: 0,
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
            <div className="bg-card rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-primary">Player Statistics</h3>
            </div>
                <ChartSkeleton />
            </div>
        );
    }

    const hasData = gamesPlayed > 0 || trophies > 0;

    return (
        <div className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/30 dark:to-red-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-primary">Player Statistics</h3>
            </div>
            
            {!hasData ? (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-3 shadow-md">
                            <span className="text-white text-lg font-bold">STATS</span>
                        </div>
                    <p className="text-secondary font-medium text-sm">No statistics yet</p>
                    <p className="text-muted text-xs">Start playing games to see your progress</p>
                </div>
            ) : (
                <div>
                    {/* Chart Container */}
                    <div className="relative h-40 mb-4">
                        <Bar data={chartData} options={chartOptions} />
                    </div>

                    {/* Statistics Summary Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-orange-900/20 rounded-lg p-3 text-center shadow-md">
                            <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mx-auto mb-2"></div>
                            <p className="text-sm font-medium text-secondary mb-2">Games Played</p>
                            <p className="text-xl font-bold text-primary">
                                {gamesPlayed.toLocaleString()}
                            </p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-white to-red-50 dark:from-gray-800 dark:to-red-900/20 rounded-lg p-3 text-center shadow-md">
                            <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-pink-500 rounded-full mx-auto mb-2"></div>
                            <p className="text-sm font-medium text-secondary mb-2">Trophies</p>
                            <p className="text-xl font-bold text-primary">
                                {trophies.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Total Summary */}
                    <div className="mt-4 pt-4">
                        <div className="flex justify-between items-center">
                            <span className="text-muted text-sm">Total Achievement Score:</span>
                            <span className="font-bold text-primary text-base">
                                {(gamesPlayed + trophies).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}