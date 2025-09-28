'use client';

import { useState } from 'react';
import { ListSkeleton } from '@/components/ui/SkeletonLoader';

interface GoldenTicketsProps {
    coupons: string[];
    loading: boolean;
    onRedeem?: (coupon: string) => void;
}

export default function GoldenTickets({ coupons, loading, onRedeem }: GoldenTicketsProps) {
    const [redeeming, setRedeeming] = useState<string | null>(null);

    const handleRedeem = async (coupon: string) => {
        if (!onRedeem) return;
        
        setRedeeming(coupon);
        try {
            await onRedeem(coupon);
        } finally {
            setRedeeming(null);
        }
    };

    return (
        <div className="bg-gradient-to-br from-yellow-900/30 via-slate-800/40 to-orange-900/30 backdrop-blur-sm border border-yellow-500/20 rounded-lg p-2 shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/20">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">Golden Tickets</h3>
                <div className="bg-amber-500/20 border border-amber-500/30 px-2 py-1 rounded-md">
                        <span className="text-amber-300 font-medium text-xs">TICKETS {coupons.length}</span>
                </div>
            </div>
            
            {loading ? (
                <ListSkeleton count={3} />
            ) : coupons.length === 0 ? (
                <div className="text-center py-6">
                    <div className="w-12 h-12 bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <span className="text-lg font-bold">TICKET</span>
                    </div>
                    <p className="text-slate-700 font-medium text-sm">No tickets yet</p>
                    <p className="text-slate-500 text-xs">Use inventory items to earn golden tickets!</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {coupons.slice(0, 5).map((coupon, index) => (
                        <div key={index} className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-3 hover:from-amber-100 hover:to-yellow-100 transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-sm">
                                        <span className="text-xs font-bold">TICKET</span>
                                    </div>
                                    <div>
                                        <p className="text-slate-900 font-medium text-sm font-mono">{coupon}</p>
                                        <p className="text-amber-600 text-xs font-medium">Golden Ticket #{index + 1}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRedeem(coupon)}
                                    disabled={redeeming === coupon}
                                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    {redeeming === coupon ? 'Redeeming...' : 'Redeem'}
                                </button>
                            </div>
                        </div>
                    ))}
                    {coupons.length > 5 && (
                        <div className="text-center pt-2">
                            <button className="text-amber-600 hover:text-amber-700 text-xs font-medium">
                                View {coupons.length - 5} more tickets
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}