'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ListSkeleton } from '@/components/ui/SkeletonLoader';

interface GoldenTicketsProps {
    coupons: string[];
    loading: boolean;
    onRedeem?: (coupon: string) => void;
}

export default function GoldenTickets({ coupons, loading, onRedeem }: GoldenTicketsProps) {
    const [redeeming, setRedeeming] = useState<string | null>(null);
    const router = useRouter();

    const handleRedeem = async (coupon: string) => {
        // Navigate to coupon redeem page with the coupon code as a parameter
        router.push(`/coupon/redeem?code=${encodeURIComponent(coupon)}`);
    };

    return (
        <div className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-primary">Golden Tickets</h3>
                <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-2 rounded-md shadow-sm">
                    <span className="text-white font-medium text-sm">TICKETS {coupons.length}</span>
                </div>
            </div>

            {loading ? (
                <ListSkeleton count={3} />
            ) : coupons.length === 0 ? (
                <div className="text-center py-6">
                    <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-muted" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M2 9a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9zm2 1v4h16v-4H4zm2 2h4v2H6v-2zm6 0h4v2h-4v-2z" />
                        </svg>
                    </div>
                    <p className="text-secondary font-medium text-sm">No tickets yet</p>
                    <p className="text-muted text-xs">Use inventory items to earn golden tickets!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {coupons.slice(0, 5).map((coupon, index) => (
                        <div key={index} className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg p-4 shadow-md">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M2 9a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9zm2 1v4h16v-4H4zm2 2h4v2H6v-2zm6 0h4v2h-4v-2z" />
                                    </svg>
                                    <div>
                                        <p className="text-primary font-medium text-base font-mono">{coupon}</p>
                                        <p className="text-accent text-sm font-medium">Golden Ticket #{index + 1}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRedeem(coupon)}
                                    disabled={redeeming === coupon}
                                    className="bg-accent-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-accent-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {redeeming === coupon ? 'Redeeming...' : 'Redeem'}
                                </button>
                            </div>
                        </div>
                    ))}
                    {coupons.length > 5 && (
                        <div className="text-center pt-4">
                            <button className="text-accent-500 text-sm font-medium hover:text-accent-600 cursor-pointer transition-colors">
                                View {coupons.length - 5} more tickets
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}