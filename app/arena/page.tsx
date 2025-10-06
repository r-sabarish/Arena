'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import SignIn from '@/components/auth/SignIn';

interface Game {
    id: number;
    title: string;
    description: string;
    image: string[];
    category: string[];
    publisher: string
}

export default function Arena() {
    const router = useRouter();
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState<{ [key: number]: number }>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const { data: session, status } = useSession();

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const res = await fetch('/api/arena/games');
                const data = await res.json();
                setGames(data);

                const initialIndexes: { [key: number]: number } = {};
                data.forEach((game: Game) => {
                    initialIndexes[game.id] = 0;
                });
                setActiveImageIndex(initialIndexes);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchGames();
    }, []);

    // Autoplay logic
    useEffect(() => {
        const intervals: { [key: number]: NodeJS.Timeout } = {};

        games.forEach((game) => {
            if (game.image.length > 1) {
                intervals[game.id] = setInterval(() => {
                    setActiveImageIndex((prev) => ({
                        ...prev,
                        [game.id]: (prev[game.id] + 1) % game.image.length,
                    }));
                }, 3000);
            }
        });

        return () => {
            Object.values(intervals).forEach(clearInterval);
        };
    }, [games]);

    const handleDotClick = (gameId: number, index: number) => {
        setActiveImageIndex((prev) => ({ ...prev, [gameId]: index }));
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center transition-colors duration-300">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">Loading Arena...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!session) return <SignIn />;

    // Get all unique categories
    const allCategories = Array.from(new Set(games.flatMap(game => game.category)));

    // Filter games based on search and category
    const filteredGames = games.filter(game => {
        const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            game.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || game.category.includes(selectedCategory);
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-background-primary transition-colors duration-300">
                {/* Header */}
                <div className="bg-card border-b border-border-light transition-colors duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <h1 className="text-3xl font-bold text-primary">Arena</h1>
                        <p className="text-secondary mt-2">Discover and play games</p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-card rounded-xl border border-border-light overflow-hidden">
                                <div className="h-48 bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-primary transition-colors duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900/80 to-gray-900/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Arena</h1>
                            <p className="text-gray-300 mt-2">
                                Discover and play games • {games.length} games available
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                                Gaming Hub
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    {/* Search */}
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search games..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-200 shadow-lg"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="sm:w-48">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-900/50 backdrop-blur-sm text-white border-none outline-none focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 shadow-lg rounded-lg"
                        >
                            <option value="all">All Categories</option>
                            {allCategories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Games Grid */}
                {filteredGames.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gray-800/60 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <span className="text-gray-300 text-xl font-bold">GAMES</span>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                            {searchTerm || selectedCategory !== 'all' ? 'No games found' : 'No games available'}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                            {searchTerm || selectedCategory !== 'all'
                                ? 'Try adjusting your search or filter criteria'
                                : 'Check back later for new games!'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredGames.map((game) => {
                            const images = Array.isArray(game.image) ? game.image : [game.image];
                            const currentIndex = activeImageIndex[game.id] ?? 0;

                            return (
                                <div
                                    key={game.id}
                                    className="bg-gray-800/40 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group shadow-lg"
                                    onClick={() => router.push(`/arena/${game.id}`)}
                                >
                                    {/* Game Image */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={images[currentIndex]}
                                            alt={`${game.title} preview`}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />

                                        {/* Image Indicators */}
                                        {images.length > 1 && (
                                            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
                                                {images.map((_, index) => (
                                                    <button
                                                        key={index}
                                                        className={`w-2 h-2 rounded-full transition-colors duration-200 ${currentIndex === index
                                                            ? 'bg-white'
                                                            : 'bg-white/50 hover:bg-white/75'
                                                            }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDotClick(game.id, index);
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Game Info */}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-white mb-2 line-clamp-1">
                                            {game.title}
                                        </h3>
                                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                                            {game.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}