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
        <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-pink-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-primary">Inventory</h3>
            </div>
            {loading ? (
                <ListSkeleton count={3} />
            ) : inventoryItems.length === 0 ? (
                <div className="text-center py-6">
                    <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
                        <span className="text-lg font-bold">BAG</span>
                    </div>
                    <p className="text-secondary font-medium text-sm">No items yet</p>
                    <p className="text-muted text-xs">Visit the store to get started!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {inventoryItems.slice(0, 3).map((item) => (
                        <div key={item.ItemInstanceId} className="bg-gradient-to-r from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 rounded-lg p-4 shadow-md">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M2 9a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9zm2 1v4h16v-4H4zm2 2h4v2H6v-2zm6 0h4v2h-4v-2z" />
                                    </svg>
                                    <div>
                                        <p className="text-primary font-medium text-base">{item.DisplayName || item.ItemId}</p>
                                        <p className="text-muted text-sm">Qty: {item.RemainingUses ?? 1}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onUseItem(item)}
                                    disabled={isBuying}
                                    className="bg-primary-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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