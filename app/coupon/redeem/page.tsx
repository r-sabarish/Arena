'use client';

import { useSession, signOut, signIn } from 'next-auth/react';
import SignIn from '@/components/auth/SignIn';
import { useState, useRef, useEffect } from 'react';
import { getUserDataFromPlayFab, updatePlayFabUserData, playFabLoginWithAzureAD } from '@/lib/playfab/playfab';
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
        const initializeCanvas = () => {
        if (!canvasRef.current || !containerRef.current) return;
            
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to container size
        const rect = containerRef.current.getBoundingClientRect();
            
            // Check if dimensions are valid
            if (rect.width <= 0 || rect.height <= 0) {
                console.log('Container not ready, retrying...');
                setTimeout(initializeCanvas, 100);
                return;
            }

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
        };

        // Initialize canvas after a short delay to ensure DOM is ready
        const timer = setTimeout(initializeCanvas, 100);
        
        // Handle window resize
        const handleResize = () => {
            setTimeout(initializeCanvas, 50);
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, [couponCode]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (redeemed) return;
        isDrawing.current = true;
        draw(e);
    };

    const stopDrawing = () => {
        if (redeemed) return;
        isDrawing.current = false;
        checkScratchPercent();
    };

    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();

        if ('touches' in e && e.touches.length > 0) {
        return {
            x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top,
            };
        } else if ('clientX' in e) {
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        }
        return null;
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const pos = getPos(e);
        if (!pos) return;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 50, 0, Math.PI * 2, false); // brush radius 50px
        ctx.fill();
    };

    const checkScratchPercent = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Check if canvas has valid dimensions
        if (canvas.width <= 0 || canvas.height <= 0) return;

        try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            let transparentPixels = 0;

            for (let i = 3; i < pixels.length; i += 4) {
                if (pixels[i] === 0) transparentPixels++;
            }

            const scratchedPercent = (transparentPixels / (canvas.width * canvas.height)) * 100;

            // Auto redeem if scratched more than 50%
            if (scratchedPercent > 50 && !redeemed) {
                redeemCoupon();
            }
        } catch (error) {
            console.error('Error checking scratch percent:', error);
        }
    };

    const refreshPlayFabSession = async () => {
        if (!session) throw new Error('No session available');
        
        const titleId = process.env.NEXT_PUBLIC_PLAYFAB_TITLE_ID;
        if (!titleId) throw new Error('Title ID not found');

        console.log('Refreshing PlayFab session...');
        const loginResult = await playFabLoginWithAzureAD(titleId, session);
        
        if (loginResult.error) throw new Error(`Failed to refresh session: ${loginResult.error.errorMessage}`);
        
        return loginResult.data?.SessionTicket;
    };

    const refreshUserSession = async () => {
        console.log('Mail sending failed, refreshing session...');
        try {
            await signOut({ redirect: false });
            console.log('Signed out successfully');
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const signInResult = await signIn('azure-ad', { 
                redirect: false,
                callbackUrl: window.location.href 
            });
            
            return signInResult?.ok;
        } catch (error) {
            console.error('Sign out/re-sign in error:', error);
            return false;
        }
    };

    const sendMailAndUpdatePlayFab = async (sessionTicket: string, coupons: string[], couponCode: string, titleId: string) => {
        const mailRes = await fetch('/api/send-coupon-mail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coupon: couponCode }),
        });

        if (mailRes.ok) {
            console.log('Mail sent successfully, updating PlayFab data...');
            const updatedCoupons = coupons.filter((c: string) => c !== couponCode);
            await updatePlayFabUserData(sessionTicket, titleId, { Coupons: JSON.stringify(updatedCoupons) });
            console.log('Coupon removed from PlayFab inventory');
            return { success: true, message: 'Coupon verified and mail sent! Please check your email!' };
        } else {
            const errorText = await mailRes.text();
            console.error('Mail sending failed:', errorText);
            return { success: false, error: errorText };
        }
    };

    const clearScratchOverlay = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const getSessionTicket = async () => {
        let sessionTicket = sessionStorage.getItem('playfabSessionTicket');
        if (!sessionTicket) {
            console.log('No session ticket found, refreshing...');
            const newTicket = await refreshPlayFabSession();
            if (!newTicket) throw new Error('Failed to get new session ticket');
            sessionTicket = newTicket;
        }
        return sessionTicket;
    };

    const getUserDataWithRetry = async (sessionTicket: string, titleId: string) => {
        try {
            return await getUserDataFromPlayFab(sessionTicket, titleId);
        } catch (error: any) {
            if (error.message?.includes('expired') || error.message?.includes('invalid')) {
                console.log('Session expired, refreshing...');
                const newTicket = await refreshPlayFabSession();
                if (!newTicket) throw new Error('Failed to refresh session ticket');
                return await getUserDataFromPlayFab(newTicket, titleId);
            }
            throw error;
        }
    };

    const handleRetryAfterSessionRefresh = async (coupons: string[], couponCode: string, titleId: string) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Retrying mail sending after session refresh...');
        
        const freshSessionTicket = sessionStorage.getItem('playfabSessionTicket');
        if (!freshSessionTicket) {
            showPopup('Mail sent but failed to update inventory. Please contact support.', 'error');
            return;
        }

        const result = await sendMailAndUpdatePlayFab(freshSessionTicket, coupons, couponCode, titleId);
        if (result.success) {
            showPopup('Session refreshed and coupon redeemed successfully! Please check your email!', 'success');
        } else {
            showPopup('Mail sending failed even after session refresh. Please try again later.', 'error');
        }
    };

    const redeemCoupon = async () => {
        setRedeemed(true);
        clearScratchOverlay();
        setLoading(true);

        const titleId = process.env.NEXT_PUBLIC_PLAYFAB_TITLE_ID;
        if (!titleId) {
            showPopup('Title ID not configured', 'error');
            setLoading(false);
            return;
        }

        try {
            const sessionTicket = await getSessionTicket();
            const userDataRes = await getUserDataWithRetry(sessionTicket, titleId);
            
            const coupons = userDataRes?.data?.Data?.Coupons?.Value
                ? JSON.parse(userDataRes.data.Data.Coupons.Value)
                : [];

            if (!coupons.includes(couponCode)) {
                console.log('Coupon not found in user inventory:', couponCode);
                showPopup('Invalid coupon code or already used.', 'error');
                return;
            }

            console.log('Coupon verified in PlayFab, sending mail...');
            const result = await sendMailAndUpdatePlayFab(sessionTicket, coupons, couponCode, titleId);
            
            if (result.success) {
                showPopup(result.message!, 'success');
            } else {
                const sessionRefreshed = await refreshUserSession();
                if (sessionRefreshed) {
                    await handleRetryAfterSessionRefresh(coupons, couponCode, titleId);
                } else {
                    showPopup('Session refresh failed. Please try logging in again.', 'error');
                }
            }
        } catch (err: any) {
            console.error('Redeem error:', err);
            showPopup(`Error verifying coupon: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const showPopup = (message: string, type: 'success' | 'error' = 'success') => {
        setPopup({ message, type });
        setTimeout(() => setPopup(null), 3000);
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-background-primary flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-secondary">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return <SignIn />;
    }

    return (
        <div className="min-h-screen bg-background-primary flex flex-col items-center justify-center p-4">
            {/* Coupon Container */}
            <div className="relative">
                <div
                    className={`relative inline-block ${redeemed ? 'opacity-100' : 'opacity-100'}`}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                                ref={containerRef}
                >
                    <img
                        src="/vgoldtickets.png"
                        alt="Golden Ticket"
                        className={`w-full max-w-sm h-auto select-none ${redeemed ? 'opacity-100' : 'opacity-100'}`}
                        draggable={false}
                    />
                    {!redeemed && (
                                <canvas
                                    ref={canvasRef}
                                    className="absolute inset-0 cursor-crosshair"
                            style={{ pointerEvents: 'auto' }}
                        />
                    )}
                    {redeemed && couponCode && (
                        <div className="absolute inset-0 flex items-center justify-center bg-yellow-100/90 rounded-lg">
                            <div className="text-center p-4">
                                <div className="text-2xl font-bold text-yellow-900 mb-2">SUCCESS!</div>
                                <div className="text-lg font-semibold text-yellow-800">
                                    {couponCode}
                                </div>
                            </div>
                            </div>
                    )}
                        </div>
                    </div>

            {/* Info Text */}
            <p className="text-secondary text-sm text-center mt-4">
                (Scratch to Redeem)
            </p>

            {/* Loading Text */}
            {loading && (
                <div className="mt-4 text-center">
                    <div className="w-6 h-6 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-secondary text-sm">Redeeming...</p>
                                </div>
                            )}

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