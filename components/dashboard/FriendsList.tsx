'use client';

interface Friend {
    FriendPlayFabId: string;
    Username?: string;
    TitleDisplayName?: string;
}

interface FriendsListProps {
    friends: Friend[];
    loading: boolean;
    friendAddStatus: string | null;
}

export default function FriendsList({ friends, loading, friendAddStatus }: FriendsListProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">Friends</h3>
                <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 shadow-sm flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Friend
                </button>
            </div>
            
            {friendAddStatus && (
                <div className="mb-4 p-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm">
                    {friendAddStatus}
                </div>
            )}
            
            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : friends.length === 0 ? (
                <div className="text-center py-6">
                    <div className="w-12 h-12 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl">👥</span>
                    </div>
                    <p className="text-slate-700 font-medium text-sm">No friends yet</p>
                    <p className="text-slate-500 text-xs">Start connecting with other players!</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {friends.slice(0, 5).map((friend: Friend) => (
                        <div key={friend.FriendPlayFabId} className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center shadow-sm">
                                    <span className="text-white font-bold text-sm">
                                        {friend.TitleDisplayName?.charAt(0) || 'U'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-slate-900 font-medium truncate text-sm">{friend.TitleDisplayName}</p>
                                    <p className="text-slate-500 text-xs font-mono truncate">{friend.FriendPlayFabId.slice(0, 12)}...</p>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-green-600 text-xs font-medium">Online</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}