'use client';
import { useState } from 'react';
import File from '@/components/publish/File';
import FolderUpload from '@/components/publish/Folder';
import { useSession } from 'next-auth/react';
import SignIn from '@/components/auth/SignIn';

export default function Publish() {
    const [step, setStep] = useState(1);
    const [gameType, setGameType] = useState<'unity' | 'html' | null>(null);
    const { data: session, status } = useSession();

    const [gameId, setGameId] = useState('');
    const [gameName, setGameName] = useState('');
    const [categories, setCategories] = useState('');
    const [description, setDescription] = useState('');
    const [details, setDetails] = useState('');
    const [gameImages, setGameImages] = useState<FileList | null>(null);
    const [gameVideo, setGameVideo] = useState<File | null>(null);

    const [dataFile, setDataFile] = useState<File | null>(null);
    const [wasmFile, setWasmFile] = useState<File | null>(null);
    const [frameworkFile, setFrameworkFile] = useState<File | null>(null);
    const [loaderFile, setLoaderFile] = useState<File | null>(null);

    const [hasStreamingAssets, setHasStreamingAssets] = useState(false);
    const [streamingAssetsFiles, setStreamingAssetsFiles] = useState<FileList | null>(null);
    
    // HTML game files
    const [htmlFiles, setHtmlFiles] = useState<FileList | null>(null);
    const [uploadType, setUploadType] = useState<'folder' | 'files'>('folder');

    const [uploaded, setUploaded] = useState(false);
    const [available, setAvailable] = useState<boolean | null>(null);
    const [checking, setChecking] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const canGoNextStep1 = () => {
        return gameId.trim() !== '' && gameName.trim() !== '';
    };

    const canSubmit = () => {
        if (gameType === 'unity') {
            return dataFile !== null && wasmFile !== null && frameworkFile !== null && loaderFile !== null;
        } else if (gameType === 'html') {
            return htmlFiles !== null && htmlFiles.length > 0;
        }
        return false;
    };

    const handlePreview = () => {
        if (gameType === 'html' && htmlFiles) {
            setPreviewing(true);
            // Find the main HTML file
            const htmlFile = Array.from(htmlFiles).find(file => file.name.endsWith('.html'));
            if (htmlFile) {
                const url = URL.createObjectURL(htmlFile);
                setPreviewUrl(url);
            }
        }
    };

    const closePreview = () => {
        setPreviewing(false);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    const checkAvailability = async () => {
        if (!gameId.trim()) return;
        
        setChecking(true);
        try {
            const response = await fetch(`/api/arena/games`);
            const games = await response.json();
            const exists = games.some((game: any) => game.id.toString() === gameId.trim());
            setAvailable(!exists);
        } catch (error) {
            console.error('Error checking availability:', error);
        } finally {
            setChecking(false);
        }
    };

    const handleSubmit = async () => {
        if (!canSubmit() || !session) return;

        setUploading(true);
        try {
            const formData = new FormData();
            
            // Add game info
            formData.append('gameId', gameId);
            formData.append('gameName', gameName);
            formData.append('categories', categories);
            formData.append('description', description);
            formData.append('details', details);
            formData.append('gameType', gameType!);
            formData.append('publisher', session.user?.name || 'Anonymous');

            // Add images
            if (gameImages) {
                Array.from(gameImages).forEach((file) => {
                    formData.append('images', file);
                });
            }

            // Add video
            if (gameVideo) {
                formData.append('video', gameVideo);
            }

            // Add game files based on type
            if (gameType === 'unity') {
                if (dataFile) formData.append('dataFile', dataFile);
                if (wasmFile) formData.append('wasmFile', wasmFile);
                if (frameworkFile) formData.append('frameworkFile', frameworkFile);
                if (loaderFile) formData.append('loaderFile', loaderFile);
                
                if (hasStreamingAssets && streamingAssetsFiles) {
                    Array.from(streamingAssetsFiles).forEach((file) => {
                        formData.append('streamingAssets', file);
                    });
                }
            } else if (gameType === 'html' && htmlFiles) {
                Array.from(htmlFiles).forEach((file) => {
                    formData.append('htmlFiles', file);
                });
            }

            const endpoint = gameType === 'unity' ? '/api/publish/unity' : '/api/publish/html';
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setUploaded(true);
                setStep(4);
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Error uploading game:', error);
            alert('Failed to upload game. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const getStepIcon = (stepNumber: number) => {
        if (stepNumber < step) return '✓';
        if (stepNumber === step) return '●';
        return '○';
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center transition-colors duration-300">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!session) {
        return <SignIn />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Publish Game</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Share your game with the Arena community</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            {[1, 2, 3, 4].map((stepNumber) => (
                                <div key={stepNumber} className="flex items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-200 ${
                                        stepNumber <= step 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                    }`}>
                                        {getStepIcon(stepNumber)}
                                    </div>
                                    {stepNumber < 4 && (
                                        <div className={`w-16 h-1 mx-2 rounded transition-colors duration-200 ${
                                            stepNumber < step 
                                                ? 'bg-blue-500' 
                                                : 'bg-slate-200 dark:bg-slate-700'
                                        }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-center">
                        <div className={`text-sm font-medium ${step >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                            Game Info
                        </div>
                        <div className={`text-sm font-medium ${step >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                            Game Type
                        </div>
                        <div className={`text-sm font-medium ${step >= 3 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                            Upload Files
                        </div>
                        <div className={`text-sm font-medium ${step >= 4 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                            Complete
                        </div>
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 transition-colors duration-300">
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Game Information</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Game ID *
                                    </label>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={gameId}
                                            onChange={(e) => setGameId(e.target.value)}
                                            placeholder="e.g., my-awesome-game"
                                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors duration-200"
                                        />
                                        {gameId && (
                                            <button
                                                onClick={checkAvailability}
                                                disabled={checking}
                                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                                            >
                                                {checking ? 'Checking...' : 'Check availability'}
                                            </button>
                                        )}
                                        {available !== null && (
                                            <p className={`text-sm ${available ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {available ? 'Available' : 'Already taken'}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Game Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={gameName}
                                        onChange={(e) => setGameName(e.target.value)}
                                        placeholder="Enter your game name"
                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors duration-200"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Categories
                                </label>
                                <input
                                    type="text"
                                    value={categories}
                                    onChange={(e) => setCategories(e.target.value)}
                                    placeholder="e.g., Action, Adventure, Puzzle"
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief description of your game"
                                    rows={3}
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors duration-200"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!canGoNextStep1()}
                                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed"
                                >
                                    Next Step →
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Select Game Type</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div
                                    onClick={() => setGameType('unity')}
                                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                        gameType === 'unity'
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                                            : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                                    }`}
                                >
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600 mb-4">UNITY</div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Unity WebGL</h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                                            Upload Unity WebGL builds with .data, .wasm, .js files
                                        </p>
                                    </div>
                                </div>

                                <div
                                    onClick={() => setGameType('html')}
                                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                        gameType === 'html'
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                                            : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                                    }`}
                                >
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-600 mb-4">HTML5</div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">HTML5 Game</h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                                            Upload HTML5 games with HTML, CSS, JS files
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <button
                                    onClick={() => setStep(1)}
                                    className="bg-slate-500 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                                >
                                    ← Previous
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={!gameType}
                                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed"
                                >
                                    Next Step →
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Upload Game Files</h2>
                            
                            {gameType === 'unity' ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <File
                                            title="Data File (.data)"
                                            accept=".data"
                                            onChange={setDataFile}
                                        />
                                        <File
                                            title="WASM File (.wasm)"
                                            accept=".wasm"
                                            onChange={setWasmFile}
                                        />
                                        <File
                                            title="Framework File (.js)"
                                            accept=".js"
                                            onChange={setFrameworkFile}
                                        />
                                        <File
                                            title="Loader File (.js)"
                                            accept=".js"
                                            onChange={setLoaderFile}
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={hasStreamingAssets}
                                                onChange={(e) => setHasStreamingAssets(e.target.checked)}
                                                className="w-4 h-4 text-blue-600 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-slate-700 dark:text-slate-300">Has Streaming Assets</span>
                                        </label>
                                    </div>

                                    {hasStreamingAssets && (
                                        <FolderUpload
                                            title="Streaming Assets"
                                            onChange={setStreamingAssetsFiles}
                                        />
                                    )}
                                </div>
                            ) : gameType === 'html' ? (
                                <div className="space-y-6">
                                    {/* Upload Method Selection */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Upload Method</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUploadType('folder');
                                                    setHtmlFiles(null);
                                                }}
                                                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                                                    uploadType === 'folder'
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                                                        : 'border-slate-300 dark:border-slate-600 hover:border-blue-500'
                                                }`}
                                            >
                                                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                                                    Upload Folder
                                                </h4>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    Upload entire game folder with all files and subfolders intact
                                                </p>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUploadType('files');
                                                    setHtmlFiles(null);
                                                }}
                                                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                                                    uploadType === 'files'
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                                                        : 'border-slate-300 dark:border-slate-600 hover:border-blue-500'
                                                }`}
                                            >
                                                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                                                    Upload Files
                                                </h4>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    Select individual files manually (HTML, CSS, JS, images, etc.)
                                                </p>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Upload Interface */}
                                    {uploadType === 'folder' ? (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Select Game Folder
                                            </label>
                                            <input
                                                type="file"
                                                {...({webkitdirectory: ""} as any)}
                                                multiple
                                                onChange={(e) => setHtmlFiles(e.target.files)}
                                                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors duration-200"
                                            />
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                                                Select the entire folder containing your HTML5 game files
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Select Game Files
                                            </label>
                                            <input
                                                type="file"
                                                multiple
                                                accept=".html,.htm,.js,.css,.json,.png,.jpg,.jpeg,.gif,.svg,.mp3,.wav,.ogg"
                                                onChange={(e) => setHtmlFiles(e.target.files)}
                                                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors duration-200"
                                            />
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                                                Select all files for your HTML5 game (HTML, CSS, JS, images, audio, etc.)
                                            </p>
                                        </div>
                                    )}

                                    {/* File List Preview */}
                                    {htmlFiles && htmlFiles.length > 0 && (
                                        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                                            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                                                Selected Files ({htmlFiles.length})
                                            </h4>
                                            <div className="max-h-32 overflow-y-auto space-y-1">
                                                {Array.from(htmlFiles).slice(0, 10).map((file, index) => (
                                                    <div key={index} className="text-sm text-slate-600 dark:text-slate-400">
                                                        {uploadType === 'folder' && file.webkitRelativePath 
                                                            ? file.webkitRelativePath 
                                                            : file.name}
                                                    </div>
                                                ))}
                                                {htmlFiles.length > 10 && (
                                                    <div className="text-sm text-slate-500 dark:text-slate-400 italic">
                                                        ... and {htmlFiles.length - 10} more files
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Requirements Info */}
                                    <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                                        <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">HTML5 Game Requirements</h4>
                                        <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                                            <li>• Must include at least one HTML file (index.html recommended)</li>
                                            <li>• All assets should be relative paths (no absolute URLs)</li>
                                            <li>• Game should work offline without external dependencies</li>
                                            <li>• Maximum total size: 100MB</li>
                                        </ul>
                                    </div>
                                </div>
                            ) : null}

                            <div className="flex justify-between">
                                <button
                                    onClick={() => setStep(2)}
                                    className="bg-slate-500 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                                >
                                    ← Previous
                                </button>
                                <div className="flex space-x-3">
                                    {gameType === 'html' && canSubmit() && (
                                        <button
                                            onClick={handlePreview}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                                        >
                                            Preview Game
                                        </button>
                                    )}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!canSubmit() || uploading}
                                        className="bg-green-500 hover:bg-green-600 disabled:bg-slate-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed"
                                    >
                                        {uploading ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Publishing...</span>
                                            </div>
                                        ) : (
                                            'Publish Game'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-green-700 dark:text-green-300">DONE</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                                Game Published Successfully!
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-8">
                                Your game "{gameName}" is now live in the Arena. Players can discover and play it!
                            </p>
                            <div className="space-x-4">
                                <a
                                    href={`/arena/${gameId}`}
                                    className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                                >
                                    View Game
                                </a>
                                <a
                                    href="/arena"
                                    className="inline-block bg-slate-500 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                                >
                                    Browse Arena
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Modal */}
            {previewing && previewUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-4xl max-h-[90vh] w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Game Preview</h3>
                            <button
                                onClick={closePreview}
                                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden" style={{ height: '70vh' }}>
                            <iframe
                                src={previewUrl}
                                className="w-full h-full"
                                title="Game Preview"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}