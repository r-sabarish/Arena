'use client';

import { ListSkeleton } from '@/components/ui/SkeletonLoader';
import { useState } from 'react';

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



export default function Store({ storeItems, loading, virtualCurrency, onPurchase }: StoreProps) {
    // Get all available currencies
    const currencies = Object.entries(virtualCurrency);

    // State for selected currency for each item
    const [selectedCurrencies, setSelectedCurrencies] = useState<{ [itemId: string]: string }>({});

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-primary font-semibold text-lg">Arena Store</h3>
                        <p className="text-secondary text-sm">Purchase Items</p>
                    </div>
                </div>
                <span className="inline-block px-3 py-2 bg-muted text-secondary text-sm font-semibold rounded-full">
                    {storeItems.length} Items
                </span>
            </div>



            {loading ? (
                <ListSkeleton count={3} />
            ) : storeItems.length === 0 ? (
                <div className="text-center py-6">
                    <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <p className="text-secondary font-medium text-sm">Store is empty</p>
                    <p className="text-muted text-xs">No items available for purchase</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {storeItems.slice(0, 4).map((item) => {
                        const availableCurrencies = item.VirtualCurrencyPrices ? Object.keys(item.VirtualCurrencyPrices) : [];
                        const selectedCurrency = selectedCurrencies[item.ItemId] || availableCurrencies[0];
                        const selectedPrice = item.VirtualCurrencyPrices![selectedCurrency] || 0;
                        const playerAmount = virtualCurrency[selectedCurrency] || 0;
                        const canAfford = playerAmount >= selectedPrice;

                        return (
                            <div key={item.ItemId} className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-5 shadow-lg">
                                {/* Item Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M2 9a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9zm2 1v4h16v-4H4zm2 2h4v2H6v-2zm6 0h4v2h-4v-2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-primary font-semibold text-base">{item.DisplayName || item.ItemId}</h4>
                                        </div>
                                    </div>
                                </div>

                                {/* Currency Selection (Radio Buttons) */}
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-secondary mb-3">Buy using</p>
                                    <div className="space-y-2">
                                        {availableCurrencies.map((currency) => {
                                            const price = item.VirtualCurrencyPrices![currency];
                                            const playerAmount = virtualCurrency[currency] || 0;
                                            const canAffordCurrency = playerAmount >= price;
                                            const isSelected = selectedCurrency === currency;

                                            return (
                                                <label
                                                    key={currency}
                                                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isSelected
                                                            ? canAffordCurrency
                                                                ? 'bg-blue-500 text-white'
                                                                : 'bg-red-500 text-white'
                                                            : canAffordCurrency
                                                                ? 'bg-background-card text-text-secondary hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
                                                                : 'bg-background-muted text-text-muted opacity-50 cursor-not-allowed'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="radio"
                                                            name={`currency-${item.ItemId}`}
                                                            value={currency}
                                                            checked={isSelected}
                                                            onChange={(e) => setSelectedCurrencies(prev => ({
                                                                ...prev,
                                                                [item.ItemId]: e.target.value
                                                            }))}
                                                            className="w-4 h-4 text-blue-500 bg-background-card border-border-medium focus:ring-blue-500"
                                                            disabled={!canAffordCurrency}
                                                        />
                                                        <span className="flex items-center gap-2">
                                                            <span className="font-medium">{currency}</span>
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-lg">{price} ₹</div>
                                                        <div className="text-xs opacity-75">
                                                            Balance: ₹ {playerAmount}
                                                        </div>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Purchase Button */}
                                <button
                                    onClick={() => onPurchase && onPurchase(item, selectedCurrency)}
                                    disabled={!canAfford || !onPurchase}
                                    className={`w-full py-3 px-4 rounded-lg text-base font-semibold flex items-center justify-center gap-2 transition-colors ${canAfford
                                            ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                                            : 'bg-background-muted text-text-muted cursor-not-allowed'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                                    </svg>
                                    {canAfford ? 'Purchase Now' : `Need ${selectedPrice - playerAmount} more ${selectedCurrency}`}
                                </button>
                            </div>
                        );
                    })}
                    {storeItems.length > 4 && (
                        <div className="text-center pt-5">
                            <button className="px-5 py-3 bg-background-card text-text-secondary text-base font-medium rounded-lg hover:bg-background-tertiary cursor-pointer transition-colors">
                                View {storeItems.length - 4} more items →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}