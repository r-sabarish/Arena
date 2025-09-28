'use client';

import { ListSkeleton } from '@/components/ui/SkeletonLoader';

interface InventoryItem {
    ItemInstanceId: string;
    ItemId: string;
    DisplayName?: string;
    RemainingUses?: number;
}

interface InventoryProps {
    inventoryItems: InventoryItem[];
    loading: boolean;
    onUseItem: (item: InventoryItem) => void;
    isBuying: boolean;
}

export default function Inventory({ inventoryItems, loading, onUseItem, isBuying }: InventoryProps) {
    return (
        <div className="bg-gradient-to-br from-emerald-900/30 via-slate-800/40 to-green-900/30 backdrop-blur-sm border border-emerald-500/20 rounded-lg p-2 shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-green-500/20">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">Inventory</h3>
                <button className="text-slate-400 hover:text-slate-200 transition-colors font-medium text-xs flex items-center">
                    View All 
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
            {loading ? (
                <ListSkeleton count={3} />
            ) : inventoryItems.length === 0 ? (
                <div className="text-center py-6">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <span className="text-lg font-bold">BAG</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium text-sm">No items yet</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Visit the store to get started!</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {inventoryItems.slice(0, 3).map((item) => (
                        <div key={item.ItemInstanceId} className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-3 hover:bg-slate-100 dark:hover:bg-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center shadow-sm">
                                        <span className="text-sm">📦</span>
                                    </div>
                                    <div>
                                        <p className="text-slate-900 dark:text-slate-100 font-medium text-sm">{item.DisplayName || item.ItemId}</p>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs">Qty: {item.RemainingUses ?? 1}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onUseItem(item)}
                                    disabled={isBuying}
                                    className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    {isBuying ? 'Using...' : 'Use'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}