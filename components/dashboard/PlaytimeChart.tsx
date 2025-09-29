'use client';

import { Doughnut } from 'react-chartjs-2';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface PlaytimeChartProps {
    playtimeSeconds: number;
    totalSeconds: number;
    loading: boolean;
}

export default function PlaytimeChart({ playtimeSeconds, totalSeconds, loading }: PlaytimeChartProps) {
    const playtimeData = {
        labels: ['Played', 'Remaining'],
        datasets: [
            {
                data: [playtimeSeconds, totalSeconds - playtimeSeconds],
                backgroundColor: ['#64748b', '#e2e8f0'],
                borderWidth: 0,
                cutout: '75%',
            },
        ],
    };

    const options = {
        responsive: true,
        cutout: '80%',
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        if (label === 'Played') {
                            return `${label}: ${value} sec (${Math.floor(value / 60)} min)`;
                        }
                        if (label === 'Remaining') {
                            return `${label}: ${value} sec (${Math.floor(value / 60)} min)`;
                        }
                        return `${label}: ${value}`;
                    },
                },
            },
        },
    };

    return (
        <div className="bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-900/30 dark:to-blue-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-primary">Playtime Analytics</h3>
                <div className="px-3 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-sm font-medium rounded-full shadow-sm">
                    Daily Limit: {Math.floor(totalSeconds / 60)}min
                </div>
            </div>
            {loading ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <SkeletonLoader width="w-32" height="h-6" />
                        <SkeletonLoader width="w-20" height="h-6" />
                    </div>
                    <div className="flex items-center justify-between h-32">
                        <div className="flex flex-col items-center space-y-3">
                            <SkeletonLoader variant="rectangular" width="w-16" height="h-24" />
                            <SkeletonLoader width="w-12" />
                        </div>
                        <div className="flex flex-col items-center space-y-3">
                            <SkeletonLoader variant="rectangular" width="w-16" height="h-16" />
                            <SkeletonLoader width="w-12" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-column items-center">
                    <div className="w-32 h-32 mb-4">
                        <Doughnut data={playtimeData} options={options} />
                    </div>
                    <div className="lg:ml-6 space-y-3">
                        <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                                <div className="w-4 h-4 bg-slate-500 rounded-full"></div>
                                <div>
                                    <span className="text-primary font-medium text-base">Played: {Math.floor(playtimeSeconds / 60)}min</span>
                                    <p className="text-muted text-sm">{playtimeSeconds} seconds</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-4 h-4 bg-slate-300 rounded-full"></div>
                                <div>
                                    <span className="text-primary font-medium text-base">Remaining: {Math.floor((totalSeconds - playtimeSeconds) / 60)}min</span>
                                    <p className="text-muted text-sm">{totalSeconds - playtimeSeconds} seconds</p>
                                </div>
                            </div>
                        </div>
                            <div className="bg-gradient-to-r from-white to-cyan-50 dark:from-gray-800 dark:to-cyan-900/20 p-4 rounded-lg shadow-md">
                            <p className="text-muted text-sm">
                                You've used <span className="font-semibold text-secondary">{Math.round((playtimeSeconds / totalSeconds) * 100)}%</span> of your daily playtime
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}