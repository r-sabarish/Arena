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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center transition-colors duration-300">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">Loading Profile...</span>
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Profile</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your account and game preferences</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Information */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
                            <div className="text-center">
                                <div className="relative inline-block">
                                    <img 
                                        src={session.user?.image || '/icons/user.png'} 
                                        alt="Profile" 
                                        className="w-20 h-20 rounded-full border-4 border-slate-200 dark:border-slate-600"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                                </div>
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">
                                    {session.user?.name ?? 'Anonymous'}
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    {session.user?.email ?? 'No email'}
                                </p>
                                <button 
                                    onClick={() => signOut()}
                                    className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>

                        {/* Add Friends Section */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mt-6 transition-colors duration-300">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Add Friends</h3>
                            
                            {/* Method Selection */}
                            <div className="flex space-x-2 mb-4">
                                {(['id', 'username', 'email'] as const).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setMethod(m)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                            method === m
                                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
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
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors duration-200"
                                />
                                <button 
                                    onClick={handleAddFriend}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                                >
                                    Send Friend Request
                                </button>
                                
                                {/* Help Button */}
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowHelp(!showHelp)}
                                        className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 text-sm transition-colors duration-200"
                                    >
                                        Need help?
                                    </button>
                                    
                                    {showHelp && (
                                        <div className="absolute top-full mt-2 left-0 right-0 bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300 z-10">
                                            <p><strong>PlayFab ID:</strong> Found in user's dashboard</p>
                                            <p><strong>Username:</strong> Display name in the game</p>
                                            <p><strong>Email:</strong> Account email address</p>
                                        </div>
                                    )}
                                </div>
                                
                                {feedback && (
                                    <p className={`text-sm ${
                                        feedback.includes('successfully') 
                                            ? 'text-green-600 dark:text-green-400' 
                                            : 'text-red-600 dark:text-red-400'
                                    }`}>
                                        {feedback}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* My Games */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">My Published Games</h3>
                                <span className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-sm font-medium">
                                    {myGames.length} Games
                                </span>
                            </div>

                            {gamesLoading ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                                    ))}
                                </div>
                            ) : myGames.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">Games</span>
                                    </div>
                                    <h4 className="text-slate-900 dark:text-slate-100 font-medium mb-2">No games published yet</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Start creating and publishing your games!</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-600">
                                                <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Game Name</th>
                                                <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Type</th>
                                                <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Status</th>
                                                <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {myGames.map((game) => (
                                                <tr key={game.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                                                    <td className="py-4 px-4">
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-slate-100">{game.name}</p>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">{game.description}</p>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                                            game.type === 'html' 
                                                                ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'
                                                                : 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                                                        }`}>
                                                            {game.type.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                                                            Published
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex space-x-2">
                                                            <a
                                                                href={`/arena/${game.id}`}
                                                                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium transition-colors duration-200"
                                                            >
                                                                View
                                                            </a>
                                                            <button
                                                                onClick={() => handleDelete(game.id)}
                                                                className="px-3 py-1 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-700 dark:text-red-300 rounded-md text-sm font-medium transition-colors duration-200"
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
    );
}