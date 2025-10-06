'use client';

import { ListSkeleton } from '@/components/ui/SkeletonLoader';

interface VirtualCurrency {
    [currencyCode: string]: number;
}

interface VirtualCurrenciesProps {
    virtualCurrency: VirtualCurrency;
    loading: boolean;
}

// Currency labels mapping
const getCurrencyLabel = (currencyCode: string): string => {
    const labelMap: { [key: string]: string } = {
        'AC': 'ArenaCoins', // Arena Coins
        'PR': 'Prize Money', // Prize Money
        'default': 'COIN'
    };

    return labelMap[currencyCode] || labelMap['default'];
};


export default function VirtualCurrencies({ virtualCurrency, loading }: VirtualCurrenciesProps) {
    const currencies = Object.entries(virtualCurrency);

    return (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/30 dark:to-teal-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-primary">Arena Economy</h3>
            </div>

            {loading ? (
                <ListSkeleton count={3} />
            ) : currencies.length === 0 ? (
                <div className="text-center py-6">
                    <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
                        <span className="text-lg font-bold">COINS</span>
                    </div>
                    <p className="text-secondary font-medium text-sm">No currencies</p>
                    <p className="text-muted text-xs">Virtual currencies will appear here</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {currencies.map(([currencyCode, amount], index) => {
                        const label = getCurrencyLabel(currencyCode);

                        return (
                            <div key={currencyCode} className={`bg-gradient-to-r from-white to-emerald-50 dark:from-gray-800 dark:to-emerald-900/20 rounded-lg p-4 shadow-md`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md`}>
                                            <span className="text-white text-sm font-bold">{currencyCode}</span>
                                        </div>
                                        <div>
                                            <p className="text-primary font-medium text-base">{label}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-primary font-bold text-xl leading-none">{amount.toLocaleString()} ₹</p>
                                        <p className="text-muted text-sm">balance</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {currencies.length > 0 && (
                <div className="mt-6 pt-4">
                    <div className="text-center">
                        <p className="text-muted text-sm">
                            Total Value: {currencies.reduce((sum, [_, amount]) => sum + amount, 0).toLocaleString()} units
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}