'use client';

import { useState } from 'react';
import { ListSkeleton } from '@/components/ui/SkeletonLoader';

interface StoreItem {
    ItemId: string;
    DisplayName?: string;
    CatalogVersion?: string;
    VirtualCurrencyPrices?: { [currencyCode: string]: number };
}

interface StoreProps {
    storeItems: StoreItem[];
    loading: boolean;
    virtualCurrency: { [currencyCode: string]: number };
    onPurchase?: (item: StoreItem, currency: string) => void;
}

// Currency conversion rates (base currency: first available currency)
const getCurrencyConversionRates = (currencies: string[]) => {
    // Example conversion rates - you can customize these based on your game economy
    const rates: { [key: string]: number } = {
        'AC': 1,     // Arena Coins (base)
        'GC': 0.1,   // Gold Coins (1 GC = 10 AC)
        'TC': 5,     // Tickets (1 TC = 0.2 AC)
        'SC': 1.5,   // Silver Coins  
        'BC': 2,     // Bronze Coins
        'PC': 0.05,  // Premium Coins (1 PC = 20 AC)
        'Coins': 1,
        'Gems': 0.1,
        'Tickets': 5,
        'Credits': 1,
        'Points': 10,
    };
    
    return rates;
};

// Get currency icon
const getCurrencyIcon = (currency: string): string => {
    const icons: { [key: string]: string } = {
        'AC': '🪙', 'GC': '💎', 'TC': '🎫', 'SC': '🥈', 'BC': '🥉', 'PC': '🏆',
        'Coins': '🪙', 'Gems': '💎', 'Tickets': '🎫', 'Credits': '💳', 'Points': '⭐'
    };
    return icons[currency] || '💰';
};

export default function Store({ storeItems, loading, virtualCurrency, onPurchase }: StoreProps) {
    // Get all available currencies
    const currencies = Object.entries(virtualCurrency);
    const totalCurrencies = currencies.length;
    const currencyKeys = Object.keys(virtualCurrency);
    const conversionRates = getCurrencyConversionRates(currencyKeys);
    
    // State for selected currency for each item
    const [selectedCurrencies, setSelectedCurrencies] = useState<{ [itemId: string]: string }>({});

    return (
        <div className="bg-gradient-to-br from-teal-900/30 via-slate-800/40 to-emerald-900/30 backdrop-blur-sm border border-teal-500/20 rounded-lg p-2 shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-base">Premium Store</h3>
                        <p className="text-slate-300 text-xs">Buy items with multiple currencies</p>
                    </div>
                </div>
                <span className="inline-block px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
                    {storeItems.length} Items
                </span>
            </div>
            
            {/* Currency Info */}
            {totalCurrencies > 1 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-emerald-800 font-semibold text-sm">Flexible Payment Options</h4>
                            <p className="text-emerald-700 text-xs mt-1">
                                Choose from {totalCurrencies} different currencies. Smart conversion rates ensure fair pricing across all payment methods.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            
            {loading ? (
                <ListSkeleton count={3} />
            ) : storeItems.length === 0 ? (
                <div className="text-center py-6">
                    <div className="w-12 h-12 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <p className="text-slate-700 font-medium text-sm">Store is empty</p>
                    <p className="text-slate-500 text-xs">No items available for purchase</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {storeItems.slice(0, 4).map((item) => {
                        const originalPrice = item.VirtualCurrencyPrices ? Object.values(item.VirtualCurrencyPrices)[0] || 0 : 0;
                        const originalCurrency = item.VirtualCurrencyPrices ? Object.keys(item.VirtualCurrencyPrices)[0] || 'AC' : 'AC';
                        
                        // Get selected currency for this item (default to original)
                        const selectedCurrency = selectedCurrencies[item.ItemId] || originalCurrency;
                        
                        // Calculate price in selected currency
                        const calculatePrice = (targetCurrency: string): number => {
                            if (targetCurrency === originalCurrency) return originalPrice;
                            
                            const originalRate = conversionRates[originalCurrency] || 1;
                            const targetRate = conversionRates[targetCurrency] || 1;
                            
                            return Math.ceil(originalPrice * (originalRate / targetRate));
                        };
                        
                        const price = calculatePrice(selectedCurrency);
                        const playerCurrencyAmount = virtualCurrency[selectedCurrency] || 0;
                        const canAfford = playerCurrencyAmount >= price;
                        
                        return (
                            <div key={item.ItemId} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-slate-300 transition-all duration-300">
                                {/* Item Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                                            <span className="text-xl">🎁</span>
                                        </div>
                                        <div>
                                            <h4 className="text-slate-900 font-semibold text-sm">{item.DisplayName || item.ItemId}</h4>
                                            <p className="text-slate-500 text-xs">Premium Store Item</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-slate-900">
                                            {price} {getCurrencyIcon(selectedCurrency)}
                                        </div>
                                        <div className="text-xs text-slate-500">{selectedCurrency}</div>
                                    </div>
                                </div>
                                
                                {/* Currency Selector - Clean Pills Design */}
                                <div className="mb-3">
                                    <p className="text-xs font-medium text-slate-700 mb-2">Payment Method:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {currencyKeys.slice(0, 3).map(currency => {
                                            const currencyPrice = calculatePrice(currency);
                                            const playerAmount = virtualCurrency[currency] || 0;
                                            const affordable = playerAmount >= currencyPrice;
                                            const isSelected = selectedCurrency === currency;
                                            
                                            return (
                                                <button
                                                    key={currency}
                                                    onClick={() => setSelectedCurrencies(prev => ({
                                                        ...prev,
                                                        [item.ItemId]: currency
                                                    }))}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 border ${
                                                        isSelected
                                                            ? affordable
                                                                ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                                                                : 'bg-red-100 border-red-300 text-red-700'
                                                            : affordable
                                                                ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                                                : 'bg-slate-50 border-slate-200 text-slate-400 opacity-50'
                                                    }`}
                                                    disabled={!affordable}
                                                >
                                                    {getCurrencyIcon(currency)} {currencyPrice}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {selectedCurrency !== originalCurrency && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            Original: {originalPrice} {getCurrencyIcon(originalCurrency)} {originalCurrency}
                                        </p>
                                    )}
                                </div>
                                
                                {/* Purchase Button */}
                                <button
                                    onClick={() => onPurchase && onPurchase(item, selectedCurrency)}
                                    disabled={!canAfford || !onPurchase}
                                    className={`w-full py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none ${
                                        canAfford 
                                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-sm hover:shadow-md'
                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                                >
                                    {canAfford ? 'Purchase Now' : `Need ${price - playerCurrencyAmount} more ${selectedCurrency}`}
                                </button>
                            </div>
                        );
                    })}
                    {storeItems.length > 4 && (
                        <div className="text-center pt-4">
                            <button className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-700 text-sm font-medium rounded-lg transition-all duration-200">
                                View {storeItems.length - 4} more items →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}