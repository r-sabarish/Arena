'use client';
import { useRouter } from 'next/navigation';

export default function Contribute() {
    const router = useRouter();

    const HandlePublish = () => {
        router.push('/contribute/publish');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-green-100 to-blue-200 bg-clip-text text-transparent">
                                Contribute
                            </h1>
                            <p className="text-slate-300 mt-1">Join our community and help build the future of Arena</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Logo and GitHub */}
                    <div className="text-center lg:text-left">
                        <a 
                            href="https://github.com/r-sabarish/Arena" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block"
                        >
                            <div className="group relative">
                                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
                                <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl p-8 rounded-full shadow-2xl transition-all duration-300 group-hover:scale-105">
                                    <img 
                                        src="/icons/logo.png" 
                                        alt="Arena Logo" 
                                        className="w-32 h-32 mx-auto"
                                    />
                                </div>
                            </div>
                        </a>
                        
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold text-white mb-4">
                                Open Source Project
                            </h2>
                            <a 
                                href="https://github.com/r-sabarish/Arena" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-2 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                                </svg>
                                <span>View on GitHub</span>
                            </a>
                        </div>
                    </div>

                    {/* Right Side - Content */}
                    <div className="space-y-6">
                        <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 rounded-2xl"></div>
                            <div className="relative">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
                                    Be a Contributor
                                </h1>

                                <div className="space-y-4 text-slate-300">
                                    <p>
                                        <strong className="text-white">Arena</strong> is an open-source platform that makes it easy and fun for office teams to play games together online.
                                    </p>

                                    <p>
                                        Combining robust backend services with engaging gameplay, Arena delivers a smooth, interactive experience directly in your browser.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tech Stack */}
                        <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-blue-500/5 rounded-2xl"></div>
                            <div className="relative">
                                <div className="flex items-center mb-4">
                                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">Tech Stack</h3>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                        <div>
                                            <strong className="text-white">Website & Authentication:</strong>
                                            <span className="text-slate-300"> Built with Next.js, featuring secure sign-in powered by NextAuth and Azure AD</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                        <div>
                                            <strong className="text-white">Player Progress & Leaderboards:</strong>
                                            <span className="text-slate-300"> Managed through PlayFab, tracking stats, achievements, and virtual currencies</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                        <div>
                                            <strong className="text-white">Game Experience:</strong>
                                            <span className="text-slate-300"> Developed in Unity WebGL, supporting both single-player and multiplayer modes</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                                        <div>
                                            <strong className="text-white">Real-Time Multiplayer:</strong>
                                            <span className="text-slate-300"> Enabled by Photon Fusion 2 for seamless multiplayer interactions</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div className="relative bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 rounded-2xl"></div>
                            <div className="relative">
                                <h3 className="text-lg font-semibold text-white mb-4">Ready to Contribute?</h3>
                                <p className="text-slate-300 mb-4">
                                    Whether you're a developer, designer, or game creator, there are many ways to contribute to Arena!
                                </p>
                                
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={HandlePublish}
                                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                                    >
                                        Publish Your Game
                                    </button>
                                    
                                    <a
                                        href="https://github.com/r-sabarish/Arena/issues"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 px-6 py-3 rounded-lg font-medium transition-all duration-200 text-center backdrop-blur-sm"
                                    >
                                        Report Issues
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}