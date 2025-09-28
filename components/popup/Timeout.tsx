import React from 'react';

interface TimeoutProps {
    message?: string;
}

export default function Timeout({ message }: TimeoutProps) {
    return (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white p-3 rounded-lg shadow-lg shadow-black/20 z-50 font-bold text-base select-none text-center">
            {message || "Hey! Your playtime for today is over. We'll be looking forward to seeing you again tomorrow!"}
        </div>
    );
}
