'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';
import microsoftLogo from '../../public/icons/msoft.png';

// const arenaTaglines = [
//     "The Ultimate Coffee Break Showdown",
//     "Where Office Legends Are Made",
//     "Enter the Arena, Rule the Floor",
//     "Challenge. Compete. Conquer.",
//     "Outplay. Outlast. Outscore.",
//     "Turning Colleagues into Champions",
//     "Work Hard, Play Smarter",
//     "Battle Your Buddies—Break the Routine",
//     "Unleash the Competitive Spirit at Work",
//     "Gamify Your Workday",
//     "Raise the Stakes of Your 9 to 5",
//     "Step Into the Spotlight",
//     "Every Click Counts",
//     "Office Just Got Interesting",
//     "Be the MVP of Your Team"
// ];

export default function SignIn() {
    // const tagline = arenaTaglines[Math.floor(Math.random() * arenaTaglines.length)];

    const handleSignIn = () => {
        signIn('azure-ad')
    };

    return (
        <div className="flex justify-center items-center min-h-screen p-4 animate-fade-in">
            <div className="bg-white/4 backdrop-blur-lg rounded-3xl p-20 text-center shadow-2xl shadow-black/20 max-w-lg w-full animate-fade-in">
                {/* <h1 className="text-base text-white/63 mb-2">Arena: {tagline}</h1> */}
                <h3 className="text-3xl font-semibold text-white mb-8">Please sign in to continue 🚀</h3>
                <button 
                    className="inline-flex items-center gap-3 bg-gradient-to-br from-secondary-700 to-primary-600 border-0 py-3 px-6 text-base font-semibold text-white rounded-xl cursor-pointer shadow-lg shadow-primary-500/20 transition-all duration-300 hover:scale-105 hover:bg-gradient-to-br hover:from-primary-700 hover:to-accent-600 hover:shadow-xl hover:shadow-primary-500/30" 
                    onClick={handleSignIn}
                >
                    <Image
                        alt="Microsoft logo"
                        src={microsoftLogo}
                        width={20}
                        height={20}
                        className="w-5 h-5"
                    />
                    <span>Continue with Microsoft</span>
                </button>
                <p className="mt-8 text-gray-400 text-sm leading-relaxed">
                    Sign in with your work account to participate, save your progress, and maintain a fair competitive environment.
                </p>
            </div>
        </div>
    );
}
