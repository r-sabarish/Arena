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
        'AC': 'AC', // Arena Coins
        'GC': 'GC', // Gems/Gold Coins
        'TC': 'TC', // Tickets
        'SC': 'SC', // Silver Coins  
        'BC': 'BC', // Bronze Coins
        'PC': 'PC', // Premium Coins
        'Coins': 'COINS',
        'Gems': 'GEMS',
        'Tickets': 'TICKETS',
        'Gold': 'GOLD',
        'Silver': 'SILVER',
        'Bronze': 'BRONZE',
        'Credits': 'CREDITS',
        'Points': 'POINTS',
        'Energy': 'ENERGY',
        'XP': 'XP',
        'VT': 'VT', // Virtual Tickets
        'VP': 'VP', // Virtual Points
        'default': 'COIN'
    };
    
    return labelMap[currencyCode] || labelMap['default'];
};

// Currency color themes
const getCurrencyTheme = (currencyCode: string, index: number) => {
    const themes = [
        {
            gradient: 'from-emerald-500 to-emerald-600',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-200',
            textColor: 'text-emerald-700',
            hoverShadow: 'hover:shadow-emerald-100'
        },
        {
            gradient: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-700',
            hoverShadow: 'hover:shadow-blue-100'
        },
        {
            gradient: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            textColor: 'text-purple-700',
            hoverShadow: 'hover:shadow-purple-100'
        },
        {
            gradient: 'from-amber-500 to-amber-600',
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200',
            textColor: 'text-amber-700',
            hoverShadow: 'hover:shadow-amber-100'
        },
        {
            gradient: 'from-rose-500 to-rose-600',
            bgColor: 'bg-rose-50',
            borderColor: 'border-rose-200',
            textColor: 'text-rose-700',
            hoverShadow: 'hover:shadow-rose-100'
        }
    ];
    
    return themes[index % themes.length];
};

export default function VirtualCurrencies({ virtualCurrency, loading }: VirtualCurrenciesProps) {
    const currencies = Object.entries(virtualCurrency);

    return (
        <div className="bg-gradient-to-br from-amber-900/30 via-slate-800/40 to-yellow-900/30 backdrop-blur-sm border border-amber-500/20 rounded-lg p-2 shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/20">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">Virtual Currencies</h3>
                <div className="bg-amber-500/20 border border-amber-500/30 px-2 py-1 rounded-md">
                    <span className="text-amber-300 font-medium text-xs">{currencies.length} currencies</span>
                </div>
            </div>
            
            {loading ? (
                <ListSkeleton count={3} />
            ) : currencies.length === 0 ? (
                <div className="text-center py-6">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <span className="text-lg font-bold">COINS</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium text-sm">No currencies</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Virtual currencies will appear here</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {currencies.map(([currencyCode, amount], index) => {
                        const theme = getCurrencyTheme(currencyCode, index);
                        const label = getCurrencyLabel(currencyCode);
                        
                        return (
                            <div key={currencyCode} className={`bg-white dark:bg-slate-700 border ${theme.borderColor} dark:border-slate-600 rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200 ${theme.hoverShadow}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 ${theme.bgColor} dark:bg-opacity-20 border ${theme.borderColor} dark:border-slate-600 rounded-lg flex items-center justify-center`}>
                                            <span className="text-xs font-bold">{label}</span>
                                        </div>
                                        <div>
                                            <p className="text-slate-900 dark:text-slate-100 font-medium text-sm">{currencyCode}</p>
                                            <p className={`text-xs ${theme.textColor} dark:text-slate-400`}>Virtual Currency</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-900 dark:text-slate-100 font-bold text-lg leading-none">{amount.toLocaleString()}</p>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs">balance</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            
            {currencies.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                    <div className="text-center">
                        <p className="text-slate-500 dark:text-slate-400 text-xs">
                            Total Value: {currencies.reduce((sum, [_, amount]) => sum + amount, 0).toLocaleString()} units
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}