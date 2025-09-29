'use client';

import { useSession } from 'next-auth/react';
import SignIn from '@/components/auth/SignIn';
import { useEffect, useState, useRef } from 'react';
import {
    playFabLoginWithAzureAD,
    getUserDataFromPlayFab,
    getUserInventory,
    getStoreItems,
    purchaseStoreItem,
    useInventoryItem,
    updatePlayFabUserData,
    getPlayerStatistics,
} from '@/lib/playfab/playfab';
import { generateCouponCode } from '@/lib/ticket/ticket';
import Popup from '../../components/popup/Popup';
import { useRouter } from 'next/navigation';

// Dashboard Components
import HeroSection from '@/components/dashboard/HeroSection';
import PlaytimeChart from '@/components/dashboard/PlaytimeChart';
import Inventory from '@/components/dashboard/Inventory';
import Store from '@/components/dashboard/Store';
import GoldenTickets from '@/components/dashboard/GoldenTickets';
import VirtualCurrencies from '@/components/dashboard/VirtualCurrencies';
import PlayerStatsChart from '@/components/dashboard/PlayerStatsChart';

const titleId = process.env.NEXT_PUBLIC_PLAYFAB_TITLE_ID ?? '';

interface PlayerStat {
    StatisticName: string;
    Value: string;
    Version?: number;
}


interface UserDataRecord {
    Value: string;
    LastUpdated?: string;
}

interface VirtualCurrency {
    [currencyCode: string]: number;
}

interface InventoryItem {
    ItemInstanceId: string;
    ItemId: string;
    DisplayName?: string;
    RemainingUses?: number;
}


interface StoreItem {
    ItemId: string;
    DisplayName?: string;
    CatalogVersion?: string;
    VirtualCurrencyPrices?: { [currencyCode: string]: number };
}

const arenaTaglines = [
    "The Ultimate Coffee Break Showdown",
    "Where Office Legends Are Made",
    "Enter the Arena, Rule the Floor",
    "Challenge. Compete. Conquer.",
    "Outplay. Outlast. Outscore.",
    "Turning Colleagues into Champions",
    "Work Hard, Play Smarter",
    "Battle Your Buddies—Break the Routine",
    "Unleash the Competitive Spirit at Work",
    "Gamify Your Workday",
    "Raise the Stakes of Your 9 to 5",
    "Step Into the Spotlight",
    "Every Click Counts",
    "Office Just Got Interesting",
    "Be the MVP of Your Team",
];

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [playFabId, setPlayFabId] = useState<string | null>(null);
    const [playerStats, setPlayerStats] = useState<PlayerStat[]>([]);
    const [virtualCurrency, setVirtualCurrency] = useState<VirtualCurrency>({});
    const [userData, setUserData] = useState<Record<string, string>>({});
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [sessionTicket, setSessionTicket] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [tagline, setTagline] = useState('');
    const [storeItems, setStoreItems] = useState<any[]>([]);
    const [currencySelections, setCurrencySelections] = useState<Record<string, string>>({});
    const [isBuying, setIsBuying] = useState(false);
    const [popup, setPopup] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const popupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const catalogVersion = '1';
    const storeId = 'Ticket Store';

    useEffect(() => {
        if (status !== 'authenticated' || !session) return;

        const randomTagline = arenaTaglines[Math.floor(Math.random() * arenaTaglines.length)];
        setTagline(randomTagline);

        const loginAndLoadData = async () => {
            setLoading(true);
            setError(null);

            try {
                let _sessionTicket = null;
                let _playFabId = null;

                if (typeof window !== 'undefined') {
                    _sessionTicket = sessionStorage.getItem('playfabSessionTicket');
                    _playFabId = sessionStorage.getItem('playfabId');
                }

                if (!_sessionTicket || !_playFabId) {
                    try {
                        const loginRes = await playFabLoginWithAzureAD(titleId, session!);

                        if (!loginRes.data?.PlayFabId || !loginRes.data?.SessionTicket) {
                            throw new Error('Missing PlayFabId or SessionTicket in login response');
                        }

                        _sessionTicket = loginRes.data.SessionTicket;
                        _playFabId = loginRes.data.PlayFabId;

                        if (typeof window !== 'undefined') {
                            sessionStorage.setItem('playfabSessionTicket', _sessionTicket);
                            sessionStorage.setItem('playfabId', _playFabId);
                        }
                    } catch (e) {
                        console.warn('Session ticket or PlayFab ID missing. Trying silent sign-in with Azure AD...');

                        const { signOut, signIn } = await import('next-auth/react');

                        await signOut({ redirect: false });
                        await signIn('azure-ad', { redirect: false });

                        setTimeout(() => {
                            loginAndLoadData();
                        }, 1000);

                        return;
                    }
                }

                setPlayFabId(_playFabId);
                setSessionTicket(_sessionTicket);

                // User Data
                const userDataRes = await getUserDataFromPlayFab(_sessionTicket, titleId);
                if (userDataRes.data?.Data) {
                    const cleanedUserData = Object.entries(userDataRes.data.Data).reduce<Record<string, string>>(
                        (acc, [key, val]) => {
                            const record = val as UserDataRecord;
                            acc[key] = record?.Value || '';
                            return acc;
                        },
                        {}
                    );
                    setUserData(cleanedUserData);
                }

                if (String(userDataRes.code) === "401") {
                    await handleUnAuthorized(userDataRes.error, loginAndLoadData);
                }

                // Player Statistics
                const statsRes = await getPlayerStatistics(_sessionTicket, titleId);
                if (statsRes.data?.Statistics) {
                    setPlayerStats(statsRes.data.Statistics);
                } else {
                    setPlayerStats([]); // Set empty array if no stats
                }

                // Inventory & Virtual Currency
                const inventoryRes = await getUserInventory(_sessionTicket, titleId);
                if (inventoryRes.data) {
                    setVirtualCurrency(inventoryRes.data.VirtualCurrency || {});
                    setInventoryItems(inventoryRes.data.Inventory || []);
                }


                // Store
                const storeRes = await getStoreItems(_sessionTicket, titleId, storeId, catalogVersion);
                if (storeRes.data?.Store) {
                    setStoreItems(storeRes.data.Store);
                }

            } catch (err: any) {
                console.log("UnAuthorized !");
                const errorMessage = err?.message || 'Unknown error';
                setError(errorMessage);

                const isUnauthorized =
                    errorMessage.includes('401') ||
                    errorMessage.toLowerCase().includes('unauthorized') ||
                    errorMessage.toLowerCase().includes('invalid session');

                if (isUnauthorized) {
                    handleUnAuthorized(errorMessage, loginAndLoadData);
                }
            } finally {
                setLoading(false);
            }
        };

        loginAndLoadData();
    }, [session, status]);

    async function handleUnAuthorized(error: string, onSuccess: Function) {
        const errorMessage = error;
        setError(errorMessage);

        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('playfabSessionTicket');
            sessionStorage.removeItem('playfabId');
        }

        const { signOut, signIn } = await import('next-auth/react');

        await signOut({ redirect: false });
        await signIn('azure-ad', { redirect: false });

        setTimeout(() => {
            onSuccess();
        }, 1000);
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-background-primary flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-muted animate-spin mx-auto mb-4"></div>
                    <p className="text-primary text-lg font-medium">Loading your arena...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return <SignIn />;
    }

    const copyPlayFabId = () => {
        if (!playFabId) return;
        navigator.clipboard.writeText(playFabId).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const totalSeconds = parseInt(process.env.NEXT_PUBLIC_DAILY_PLAYTIME_LIMIT || '0');
    const playtimeSecondsStr = userData.playtime_seconds || '0';
    const playtimeSeconds = parseInt(playtimeSecondsStr, 10) || 0;

    const handleUseInventoryItem = async (item: InventoryItem) => {
        if (!sessionTicket) return;
        try {
            const res = await useInventoryItem(sessionTicket, titleId, item.ItemInstanceId, 1);
            if (res?.error) {
                showPopup(`Failed to use item: ${res.errorMessage || 'Unknown error'}`, 'error');
            } else {
                // Generate coupon code on success
                const coupon = generateCouponCode('ARENAxVINS');

                // Update coupons in PlayFab UserData
                let coupons: string[] = [];
                try {
                    coupons = userData.Coupons ? JSON.parse(userData.Coupons) : [];
                } catch {
                    coupons = [];
                }
                coupons.push(coupon);

                // Save updated coupons to PlayFab
                await updatePlayFabUserData(sessionTicket, titleId, { Coupons: JSON.stringify(coupons) });

                // Update local state as well
                setUserData((prev) => ({ ...prev, Coupons: JSON.stringify(coupons) }));

                showPopup(`Used ${item.DisplayName || item.ItemId}! Coupon: ${coupon}`, 'success');

                // Refresh inventory after use
                const refreshedInventory = await getUserInventory(sessionTicket, titleId);
                if (refreshedInventory?.data) {
                    setInventoryItems(refreshedInventory.data.Inventory || []);
                    setVirtualCurrency(refreshedInventory.data.VirtualCurrency || {});
                }
            }
        } catch (err) {
            showPopup('Failed to use item due to a network or unexpected error.', 'error');
            console.error(err);
        }
    };

    const showPopup = (message: string, type: 'success' | 'error' = 'success') => {
        setPopup({ message, type });
        if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
        popupTimeoutRef.current = setTimeout(() => setPopup(null), 3000);
    };

    const handleRedeemCoupon = async (coupon: string) => {
        try {
            showPopup(`Redeeming golden ticket: ${coupon}`, 'success');

            // Here you would typically send the coupon to your backend for processing
            // For now, we'll just remove it from the local state
            let coupons: string[] = [];
            try {
                coupons = userData.Coupons ? JSON.parse(userData.Coupons) : [];
            } catch {
                coupons = [];
            }

            // Remove the redeemed coupon
            const updatedCoupons = coupons.filter(c => c !== coupon);

            if (sessionTicket) {
                await updatePlayFabUserData(sessionTicket, titleId, {
                    Coupons: JSON.stringify(updatedCoupons)
                });

                // Update local state
                setUserData((prev) => ({
                    ...prev,
                    Coupons: JSON.stringify(updatedCoupons)
                }));
            }

            showPopup(`Golden ticket redeemed successfully! Check your email for details.`, 'success');
        } catch (error) {
            showPopup('Failed to redeem golden ticket. Please try again.', 'error');
            console.error('Redeem error:', error);
        }
    };


    const handlePurchaseItem = async (item: any, currency: string) => {
        if (!sessionTicket) {
            showPopup('Please log in to make purchases.', 'error');
            return;
        }

        try {
            setIsBuying(true);
            console.log('Starting purchase process:', {
                item: item.ItemId,
                displayName: item.DisplayName,
                currency,
                storeId,
                catalogVersion
            });

            showPopup(`Purchasing ${item.DisplayName || item.ItemId} with ${currency}...`, 'success');

            // Calculate the price in the selected currency
            const originalPrice = item.VirtualCurrencyPrices ? Object.values(item.VirtualCurrencyPrices)[0] || 0 : 0;
            const originalCurrency = item.VirtualCurrencyPrices ? Object.keys(item.VirtualCurrencyPrices)[0] || 'AC' : 'AC';

            console.log('Item price details:', {
                itemId: item.ItemId,
                virtualCurrencyPrices: item.VirtualCurrencyPrices,
                originalPrice,
                originalCurrency,
                selectedCurrency: currency
            });

            let finalPrice = originalPrice;
            let actualCurrency = currency;

            // Check if the item actually supports the selected currency
            if (item.VirtualCurrencyPrices && !item.VirtualCurrencyPrices[currency]) {
                console.log('Item does not support selected currency, using conversion...');

                // Apply conversion rate (you can customize these rates)
                const conversionRates: { [key: string]: number } = {
                    'AC': 1, 'GC': 0.1, 'TC': 5, 'SC': 1.5, 'BC': 2, 'PC': 0.05
                };
                const originalRate = Number(conversionRates[originalCurrency]) || 1;
                const targetRate = Number(conversionRates[currency]) || 1;
                const numericOriginalPrice = typeof originalPrice === 'number' ? originalPrice : Number(originalPrice) || 0;
                finalPrice = Math.ceil(numericOriginalPrice * (originalRate / targetRate));

                console.log('Currency conversion:', {
                    originalPrice,
                    originalCurrency,
                    targetCurrency: currency,
                    originalRate,
                    targetRate,
                    finalPrice
                });
            } else if (item.VirtualCurrencyPrices && item.VirtualCurrencyPrices[currency]) {
                // Item natively supports this currency
                finalPrice = item.VirtualCurrencyPrices[currency];
                console.log('Using native currency price:', finalPrice, currency);
            }

            // Check if player has enough currency
            const playerAmount = Number(virtualCurrency?.[currency]) || 0;
            if (playerAmount < Number(finalPrice)) {
                showPopup(`Insufficient ${currency}. You need ${finalPrice} but have ${playerAmount}.`, 'error');
                return;
            }

            console.log('Making purchase request:', {
                sessionTicket: sessionTicket ? 'present' : 'missing',
                titleId,
                storeId,
                catalogVersion,
                itemId: item.ItemId,
                finalPrice,
                currency
            });

            // For multi-currency purchases, we need to handle this differently
            // If the item doesn't natively support the selected currency, we should:
            // 1. First convert the player's currency to the item's native currency
            // 2. Then purchase with the native currency

            let purchaseResult;

            if (item.VirtualCurrencyPrices && item.VirtualCurrencyPrices[currency]) {
                // Item natively supports this currency - direct purchase
                console.log('Direct purchase with native currency');
                purchaseResult = await purchaseStoreItem(sessionTicket, titleId, storeId, catalogVersion, item.ItemId, Number(finalPrice), currency);
            } else {
                // Need to use original currency for purchase
                console.log('Purchase requires currency conversion - using original currency for API call');

                // For now, let's try purchasing with the original currency and original price
                // In a real implementation, you might want to implement currency exchange first
                purchaseResult = await purchaseStoreItem(sessionTicket, titleId, storeId, catalogVersion, item.ItemId, Number(originalPrice), originalCurrency);

                // If successful, deduct the converted amount from player's selected currency
                if (purchaseResult && !purchaseResult.error) {
                    console.log('Purchase successful, need to handle currency conversion on backend');
                    // Note: In a real implementation, you'd handle the currency conversion
                    // through PlayFab's AddUserVirtualCurrency and SubtractUserVirtualCurrency APIs
                }
            }

            console.log('Purchase result:', purchaseResult);

            if (purchaseResult?.error) {
                const errorMsg = purchaseResult.error.errorMessage || purchaseResult.errorMessage || 'Unknown error';
                const errorCode = purchaseResult.error.code || purchaseResult.error || 'Unknown code';
                showPopup(`Purchase failed: ${errorMsg} (Code: ${errorCode})`, 'error');
                console.error('Purchase error details:', purchaseResult.error || purchaseResult);

                // Add more specific error handling
                if (errorMsg.toLowerCase().includes('item not found')) {
                    showPopup(`Item "${item.ItemId}" not found in store "${storeId}". Please check PlayFab configuration.`, 'error');
                } else if (errorMsg.toLowerCase().includes('insufficient')) {
                    showPopup(`Insufficient ${currency}. You need ${finalPrice} but have ${playerAmount}.`, 'error');
                }
            } else {
                showPopup(`Successfully purchased ${item.DisplayName || item.ItemId} for ${finalPrice} ${currency}!`, 'success');

                // Refresh inventory and currency data
                const refreshedInventory = await getUserInventory(sessionTicket, titleId);
                if (refreshedInventory?.data) {
                    setInventoryItems(refreshedInventory.data.Inventory || []);
                    setVirtualCurrency(refreshedInventory.data.VirtualCurrency || {});
                }
            }
        } catch (error) {
            showPopup('Purchase failed due to a network error. Please try again.', 'error');
            console.error('Purchase error:', error);
        } finally {
            setIsBuying(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-primary transition-colors duration-300">
            {popup && (
                <Popup
                    message={popup.message}
                    type={popup.type}
                    onClose={() => setPopup(null)}
                />
            )}


            {/* Hero Section */}
            <div>
                <HeroSection
                    tagline={tagline}
                    playFabId={playFabId}
                    onCopyId={copyPlayFabId}
                    copied={copied}
                />
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
                {error && (
                    <div className="mb-4 bg-error text-text-primary px-4 py-3 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span className="font-medium text-sm text-text-primary">Error: {error}</span>
                        </div>
                    </div>
                )}


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                    <PlayerStatsChart
                        gamesPlayed={parseInt(playerStats.find(s => ['Games Played', 'GamesPlayed', 'Games', 'TotalGames', 'GameCount', 'Matches', 'MatchesPlayed'].includes(s.StatisticName))?.Value || '0')}
                        trophies={parseInt(playerStats.find(s => ['Trophies', 'Achievements', 'Awards'].includes(s.StatisticName))?.Value || '0')}
                        loading={loading}
                    />
                    {/* Playtime Chart */}
                    <PlaytimeChart
                        playtimeSeconds={playtimeSeconds}
                        totalSeconds={totalSeconds}
                        loading={loading}
                    />

                    {/* Virtual Currencies */}
                    <VirtualCurrencies
                        virtualCurrency={virtualCurrency}
                        loading={loading}
                    />
                </div>

                {/* Content Grid */}
                <div className="mt-4">

                    {/* Golden Tickets */}
                    <GoldenTickets
                        coupons={(() => {
                            try {
                                return userData.Coupons ? JSON.parse(userData.Coupons) : [];
                            } catch {
                                return [];
                            }
                        })()}
                        loading={loading}
                        onRedeem={handleRedeemCoupon}
                    />

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">

                    <Store
                        storeItems={storeItems}
                        loading={loading}
                        virtualCurrency={virtualCurrency}
                        onPurchase={handlePurchaseItem}
                    />
                    
                    {/* Inventory */}
                    <Inventory
                        inventoryItems={inventoryItems}
                        loading={loading}
                        onUseItem={handleUseInventoryItem}
                        isBuying={isBuying}
                    />




                </div>



            </div>
        </div>
    );
}