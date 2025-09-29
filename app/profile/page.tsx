'use client';

import { useSession, signOut } from 'next-auth/react';
import SignIn from '@/components/auth/SignIn';
import { useEffect, useState } from 'react';
import { addFriend } from '@/lib/playfab/playfab';
import { Game } from '@/lib/db';

export default function Profile() {
    const { data: session, status } = useSession();

    const [method, setMethod] = useState<'id' | 'username' | 'email'>('id');
    const [inputValue, setInputValue] = useState('');
    const [feedback, setFeedback] = useState('');
    const [showHelp, setShowHelp] = useState(false);
    const [myGames, setMyGames] = useState<Game[]>([]);
    const [gamesLoading, setGamesLoading] = useState(true);

    useEffect(() => {
        if (session) {
            fetchMyGames();
        }
    }, [session]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
                <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-12 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl"></div>
                    <div className="relative flex items-center space-x-4">
                        <div className="w-8 h-8 border-4 border-gradient-to-r from-blue-500 to-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-white font-medium text-lg">Loading Profile...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!session) {
        return <SignIn />;
    }

    const fetchMyGames = async () => {
        try {
            const res = await fetch('/api/profile/my-games');
            const data = await res.json();
            setMyGames(data);
        } catch (e) {
            console.error(e);
        } finally {
            setGamesLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this game?')) return;

        try {
            const res = await fetch(`/api/profile/my-games/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setMyGames((prev) => prev.filter((g) => g.id !== id));
            } else {
                alert('Failed to delete game.');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddFriend = async () => {
        if (!inputValue.trim()) {
            setFeedback('Please enter a value.');
            return;
        }

        try {
            const result = await addFriend(method, inputValue);
            if (result.success) {
                setFeedback('Friend request sent successfully!');
                setInputValue('');
            } else {
                setFeedback(result.message || 'Failed to send friend request.');
            }
        } catch (error) {
            setFeedback('An error occurred while sending the friend request.');
        }
    };

    const getPlaceholder = () => {
        switch (method) {
            case 'id': return 'Enter PlayFab ID';
            case 'username': return 'Enter username';
            case 'email': return 'Enter email address';
            default: return '';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                                Profile
                            </h1>
                            <p className="text-slate-300 mt-1">Manage your account and game preferences</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Information */}
                    <div className="lg:col-span-1">
                        <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 rounded-2xl"></div>
                            <div className="relative text-center">
                                <div className="relative inline-block">
                                    <img 
                                        src={session.user?.image || '/icons/user.png'} 
                                        alt="Profile" 
                                        className="w-20 h-20 rounded-full shadow-lg"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full shadow-lg"></div>
                                </div>
                                <h2 className="text-xl font-semibold text-white mt-4">
                                    {session.user?.name ?? 'Anonymous'}
                                </h2>
                                <p className="text-slate-300 mt-1">
                                    {session.user?.email ?? 'No email'}
                                </p>
                                <button 
                                    onClick={() => signOut()}
                                    className="mt-6 w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>

                        {/* Add Friends Section */}
                        <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 mt-6 shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-blue-500/5 rounded-2xl"></div>
                            <div className="relative">
                                <div className="flex items-center mb-4">
                                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">Add Friends</h3>
                                </div>
                            
                                {/* Method Selection */}
                                <div className="flex space-x-2 mb-4">
                                    {(['id', 'username', 'email'] as const).map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => setMethod(m)}
                                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                method === m
                                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                                                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white'
                                            }`}
                                        >
                                            {m.charAt(0).toUpperCase() + m.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                {/* Input */}
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder={getPlaceholder()}
                                        className="w-full px-3 py-2 rounded-lg bg-slate-700/50 backdrop-blur-sm text-white placeholder-slate-400 focus:bg-slate-600/50 focus:outline-none transition-all duration-200"
                                    />
                                    <button 
                                        onClick={handleAddFriend}
                                        className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg"
                                    >
                                        Send Friend Request
                                    </button>
                                    
                                    {/* Help Button */}
                                    <div className="relative">
                                        <button 
                                            onClick={() => setShowHelp(!showHelp)}
                                            className="text-slate-400 hover:text-white text-sm transition-colors duration-200"
                                        >
                                            Need help?
                                        </button>
                                        
                                        {showHelp && (
                                            <div className="absolute top-full mt-2 left-0 right-0 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 text-xs text-slate-300 z-10 shadow-lg">
                                                <p><strong className="text-white">PlayFab ID:</strong> Found in user's dashboard</p>
                                                <p><strong className="text-white">Username:</strong> Display name in the game</p>
                                                <p><strong className="text-white">Email:</strong> Account email address</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {feedback && (
                                        <p className={`text-sm ${
                                            feedback.includes('successfully') 
                                                ? 'text-green-400' 
                                                : 'text-red-400'
                                        }`}>
                                            {feedback}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* My Games */}
                    <div className="lg:col-span-2">
                        <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 rounded-2xl"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-white">My Published Games</h3>
                                    </div>
                                    <span className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 backdrop-blur-sm text-slate-300 px-3 py-1 rounded-full text-sm font-medium">
                                        {myGames.length} Games
                                    </span>
                                </div>

                                {gamesLoading ? (
                                    <div className="space-y-4">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="h-16 bg-slate-700/50 rounded-lg animate-pulse"></div>
                                        ))}
                                    </div>
                                ) : myGames.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gradient-to-r from-slate-700 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                            <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <h4 className="text-white font-medium mb-2">No games published yet</h4>
                                        <p className="text-slate-400 text-sm">Start creating and publishing your games!</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-slate-600/50">
                                                    <th className="text-left py-3 px-4 font-medium text-white">Game Name</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Type</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Status</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {myGames.map((game) => (
                                                    <tr key={game.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors duration-200">
                                                        <td className="py-4 px-4">
                                                            <div>
                                                                <p className="font-medium text-white">{game.title}</p>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                                                game.type === 'html' 
                                                                    ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-300'
                                                                    : 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300'
                                                            }`}>
                                                                {game.type!.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300">
                                                                Published
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <div className="flex space-x-2">
                                                                <a
                                                                    href={`/arena/${game.id}`}
                                                                    className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 text-blue-300 rounded-md text-sm font-medium transition-all duration-200"
                                                                >
                                                                    View
                                                                </a>
                                                                <button
                                                                    onClick={() => handleDelete(game.id!)}
                                                                    className="px-3 py-1 bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 text-red-300 rounded-md text-sm font-medium transition-all duration-200"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}