'use client';

export default function RecentActivity() {
    const activities = [
        {
            icon: '🎮',
            title: 'Game Completed',
            time: '2 hours ago',
            color: 'from-slate-500 to-slate-600',
            bgColor: 'bg-slate-50',
            borderColor: 'border-slate-200',
            textColor: 'text-slate-700'
        },
        {
            icon: '🏆',
            title: 'Trophy Earned',
            time: '5 hours ago',
            color: 'from-amber-500 to-amber-600',
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200',
            textColor: 'text-amber-700'
        },
        {
            icon: '👥',
            title: 'Friend Added',
            time: '1 day ago',
            color: 'from-gray-500 to-gray-600',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200',
            textColor: 'text-gray-700'
        }
    ];

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
                <button className="text-slate-600 hover:text-slate-700 transition-colors font-medium text-xs">
                    View All
                </button>
            </div>
            <div className="space-y-3">
                {activities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:border-slate-300 transition-all duration-200">
                        <div className={`w-8 h-8 ${activity.bgColor} border ${activity.borderColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <span className="text-lg">{activity.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-slate-900 font-medium text-sm">{activity.title}</p>
                            <p className="text-slate-500 text-xs">{activity.time}</p>
                        </div>
                        <div className="flex items-center">
                            <div className={`w-2 h-2 ${activity.textColor.replace('text-', 'bg-')} rounded-full`}></div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-center">
                    <button className="text-slate-500 hover:text-slate-700 text-xs font-medium flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Load More Activities
                    </button>
                </div>
            </div>
        </div>
    );
}