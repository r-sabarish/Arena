import React from 'react';

export default function Popup({
    message,
    type = 'success',
    onClose,
}: {
    message: string;
    type?: 'success' | 'error';
    onClose: () => void;
}) {
    const baseClasses = "fixed top-8 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-xl font-bold shadow-2xl shadow-black/30 min-w-56 text-center animate-fade-in";
    
    const typeClasses = type === 'success' 
        ? "bg-green-600 text-white" 
        : "bg-red-900 text-red-400";

    return (
        <div
            className={`${baseClasses} ${typeClasses}`}
            role="alert"
        >
            {message}
            <button
                onClick={onClose}
                className="ml-4 bg-transparent border-0 text-red-400 font-bold cursor-pointer text-lg hover:text-red-300 transition-colors duration-200"
                aria-label="Close"
            >
                ✖
            </button>
        </div>
    );
}
