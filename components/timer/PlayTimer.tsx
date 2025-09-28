'use client';

import React, { useEffect, useState } from 'react';
import { usePlayTimeSession } from '@/context/PlayTimeContext';
import { useUnitySession } from '@/context/UnitySessionContext';

function formatTime(seconds: number) {
    if (isNaN(seconds) || seconds < 0) seconds = 0;
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}


export default function PlayTimer() {
    const { isUnityLoaded } = useUnitySession();
    const { elapsedTime, timeLeft } = usePlayTimeSession();

    const [remainingDisplay, setRemainingDisplay] = useState(timeLeft);

    useEffect(() => {
        setRemainingDisplay(timeLeft);
    }, [timeLeft, isUnityLoaded]);

    if (!isUnityLoaded) return null;

    return (
        <div className="fixed top-2.5 left-25 bg-black/70 text-white p-2 rounded-lg font-bold font-mono z-50 select-none pointer-events-none min-w-40 text-left text-sm leading-relaxed whitespace-pre-line">
            Elapsed: {formatTime(elapsedTime)}
            {'\n'}
            Remaining: {formatTime(remainingDisplay)}
        </div>
    );
}
