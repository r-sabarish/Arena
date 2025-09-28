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
        <div className="bg-gradient-to-br from-blue-900/30 via-slate-800/40 to-cyan-900/30 backdrop-blur-sm border border-blue-500/20 rounded-lg p-2 shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">Playtime Analytics</h3>
                <div className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full border border-blue-500/30">
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
                <div className="flex flex-col lg:flex-row items-center justify-between">
                    <div className="w-24 h-24 mb-2 lg:mb-0">
                        <Doughnut data={playtimeData} options={options} />
                    </div>
                    <div className="lg:ml-3 space-y-2">
                        <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                                <div>
                                    <span className="text-slate-900 font-medium text-sm">Played: {Math.floor(playtimeSeconds / 60)}min</span>
                                    <p className="text-slate-500 text-xs">{playtimeSeconds} seconds</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                                <div>
                                    <span className="text-slate-900 font-medium text-sm">Remaining: {Math.floor((totalSeconds - playtimeSeconds) / 60)}min</span>
                                    <p className="text-slate-500 text-xs">{totalSeconds - playtimeSeconds} seconds</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <p className="text-slate-600 text-xs">
                                You've used <span className="font-semibold text-slate-700">{Math.round((playtimeSeconds / totalSeconds) * 100)}%</span> of your daily playtime
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}