'use client';

import { useSession } from 'next-auth/react';
import SignIn from '@/components/auth/SignIn';
import { useState, useRef, useEffect } from 'react';
import { getUserDataFromPlayFab, updatePlayFabUserData } from '@/lib/playfab/playfab';
import Popup from '@/components/popup/Popup';
import { useSearchParams } from 'next/navigation';

export default function ScratchToRedeem() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const [couponCode, setCouponCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [redeemed, setRedeemed] = useState(false);
    const [popup, setPopup] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const isDrawing = useRef(false);

    useEffect(() => {
        const code = searchParams?.get('code') || '';
        setCouponCode(code.trim());
    }, [searchParams]);

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to container size
        const rect = containerRef.current.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Fill canvas with gray "scratch-off" color
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Optional: add some noise texture for foil effect
        const noise = ctx.createImageData(canvas.width, canvas.height);
        for (let i = 0; i < noise.data.length; i += 4) {
            const val = Math.random() * 50 + 150; // light gray noise
            noise.data[i] = val;
            noise.data[i + 1] = val;
            noise.data[i + 2] = val;
            noise.data[i + 3] = 255;
        }
        ctx.putImageData(noise, 0, 0);
    }, []);

    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top
        };
    };

    const startScratch = (pos: { x: number; y: number }) => {
        if (!canvasRef.current) return;
        isDrawing.current = true;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
        ctx.fill();
    };

    const scratch = (pos: { x: number; y: number }) => {
        if (!isDrawing.current || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
        ctx.fill();
    };

    const stopScratch = () => {
        isDrawing.current = false;
    };

    const handleRedeem = async () => {
        if (!couponCode || !session) return;

        setLoading(true);
        try {
            // Get user data
            const titleId = process.env.NEXT_PUBLIC_PLAYFAB_TITLE_ID!;
            let sessionTicket = null;
            if (typeof window !== 'undefined') {
                sessionTicket = sessionStorage.getItem('playfabSessionTicket');
            }

            if (!sessionTicket) {
                setPopup({ message: 'Please log in to redeem coupons.', type: 'error' });
                setLoading(false);
                return;
            }

            const userData = await getUserDataFromPlayFab(sessionTicket, titleId);
            
            // Parse existing coupons
            const existingCoupons = userData?.UserData?.Coupons?.Value 
                ? JSON.parse(userData.UserData.Coupons.Value) 
                : [];

            // Check if coupon already redeemed
            if (existingCoupons.includes(couponCode)) {
                setPopup({ message: 'This coupon has already been redeemed!', type: 'error' });
                setLoading(false);
                return;
            }

            // Add new coupon
            const updatedCoupons = [...existingCoupons, couponCode];
            
            // Update user data
            await updatePlayFabUserData(sessionTicket, titleId, {
                Coupons: JSON.stringify(updatedCoupons)
            });

            setRedeemed(true);
            setPopup({ message: 'Coupon redeemed successfully!', type: 'success' });
        } catch (error) {
            console.error('Error redeeming coupon:', error);
            setPopup({ message: 'Failed to redeem coupon. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const showPopup = (message: string, type: 'success' | 'error') => {
        setPopup({ message, type });
        setTimeout(() => setPopup(null), 3000);
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center transition-colors duration-300">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!session) {
        return <SignIn />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Redeem Coupon</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Scratch to reveal and redeem your golden ticket</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Left - Scratch Card */}
                    <div className="order-2 lg:order-1">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 text-center">
                                Golden Ticket
                            </h2>
                            
                            {/* Scratch Area */}
                            <div 
                                ref={containerRef}
                                className="relative bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-lg overflow-hidden"
                                style={{ height: '300px' }}
                            >
                                {/* Hidden content behind scratch layer */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center p-8">
                                        <div className="text-4xl font-bold text-yellow-900 mb-4">SUCCESS</div>
                                        <h3 className="text-2xl font-bold text-yellow-900 mb-2">Congratulations!</h3>
                                        <p className="text-yellow-800 text-lg font-semibold">
                                            Coupon Code: {couponCode || 'ARENA2024'}
                                        </p>
                                        <p className="text-yellow-700 text-sm mt-2">
                                            Scratch off the silver layer to reveal
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Scratch layer */}
                                <canvas
                                    ref={canvasRef}
                                    className="absolute inset-0 cursor-crosshair"
                                    onMouseDown={(e) => startScratch(getMousePos(e))}
                                    onMouseMove={(e) => scratch(getMousePos(e))}
                                    onMouseUp={stopScratch}
                                    onMouseLeave={stopScratch}
                                    onTouchStart={(e) => {
                                        e.preventDefault();
                                        startScratch(getTouchPos(e));
                                    }}
                                    onTouchMove={(e) => {
                                        e.preventDefault();
                                        scratch(getTouchPos(e));
                                    }}
                                    onTouchEnd={(e) => {
                                        e.preventDefault();
                                        stopScratch();
                                    }}
                                />
                            </div>
                            
                            <p className="text-slate-600 dark:text-slate-400 text-sm text-center mt-4">
                                Tip: Use your mouse or finger to scratch off the silver layer
                            </p>
                        </div>
                    </div>

                    {/* Right - Redemption Form */}
                    <div className="order-1 lg:order-2">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                                Redeem Your Ticket
                            </h2>
                            
                            {redeemed ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-lg font-bold text-green-700 dark:text-green-300">DONE</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">
                                        Successfully Redeemed!
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Your golden ticket has been added to your account
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Coupon Code
                                        </label>
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            placeholder="Enter your coupon code"
                                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors duration-200"
                                        />
                                    </div>
                                    
                                    <button
                                        onClick={handleRedeem}
                                        disabled={loading || !couponCode.trim()}
                                        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-slate-400 disabled:to-slate-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed shadow-lg"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Redeeming...</span>
                                            </div>
                                        ) : (
                                            'Redeem Coupon'
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Info Cards */}
                            <div className="mt-8 space-y-3">
                                <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <div className="flex items-start space-x-3">
                                        <span className="text-blue-500 text-lg font-bold">i</span>
                                        <div>
                                            <h4 className="font-semibold text-blue-700 dark:text-blue-300 text-sm">How it works</h4>
                                            <p className="text-blue-600 dark:text-blue-400 text-xs">
                                                Each golden ticket contains special rewards and bonuses for your Arena account.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                    <div className="flex items-start space-x-3">
                                        <span className="text-green-500 text-lg font-bold">!</span>
                                        <div>
                                            <h4 className="font-semibold text-green-700 dark:text-green-300 text-sm">One-time use</h4>
                                            <p className="text-green-600 dark:text-green-400 text-xs">
                                                Each coupon code can only be redeemed once per account.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Popup */}
            {popup && (
                <Popup
                    message={popup.message}
                    type={popup.type}
                    onClose={() => setPopup(null)}
                />
            )}
        </div>
    );
}