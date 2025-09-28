'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function SideBar() {
    const pathname = usePathname();

    const list = [
        { name: "Dashboard", url: "/dashboard", icon: "/icons/activity.png" },
        { name: "Arena", url: "/arena", icon: "/icons/arena.png" },
        { name: "LeaderBoard", url: "/leaderboard", icon: "/icons/leaderboard.png" },
        { name: "Profile", url: "/profile", icon: "/icons/user.png" },
        { name: "Contribute", url: "/contribute", icon: "/icons/logo.png" },
    ];

    return (
        <div className="fixed top-0 left-0 w-20 h-screen bg-white dark:bg-slate-900 p-4 shadow-lg flex flex-col items-center z-20 border-r border-slate-200 dark:border-slate-700">
            {/* Navigation Items */}
            <ul className="list-none p-0 m-0 flex flex-col gap-6">
                {list.map((item) => {
                    const isSelected = pathname === item.url;
                    return (
                        <li
                            key={item.url}
                            className={`relative flex justify-center items-center cursor-pointer rounded-xl p-2 w-12 h-12 transition-all duration-300 ${
                                isSelected 
                                    ? 'bg-blue-100 dark:bg-blue-900 shadow-lg shadow-blue-500/20' 
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            <Link href={item.url} className="flex justify-center items-center w-full h-full rounded-xl text-decoration-none text-inherit group">
                                <Image
                                    src={item.icon}
                                    alt={`${item.name} icon`}
                                    width={24}
                                    height={24}
                                    className={`transition-all duration-300 ${
                                        isSelected 
                                            ? 'filter-none scale-110' 
                                            : 'grayscale brightness-70 group-hover:filter-none group-hover:scale-110'
                                    }`}
                                />
                                <span className="absolute top-1/2 left-full ml-4 transform -translate-y-1/2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-2 rounded-lg whitespace-nowrap text-sm font-medium opacity-0 pointer-events-none transition-all duration-300 shadow-lg z-10 group-hover:opacity-100 group-hover:pointer-events-auto">
                                    {item.name}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
