'use client';
import { useState } from 'react';
import styles from './publish.module.css';
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

    const handleUpload = async (force = false) => {
        if (!canSubmit()) {
            alert('Please upload all required build files.');
            return;
        }

        if (hasStreamingAssets && (!streamingAssetsFiles || streamingAssetsFiles.length === 0)) {
            alert('Please upload the StreamingAssets folder contents.');
            return;
        }

        const formData = new FormData();
        formData.append('gameId', gameId);
        formData.append('gameName', gameName);
        formData.append('categories', categories);
        formData.append('description', description);
        formData.append('details', details);
        formData.append('publisher', session?.user?.email || "magician");

        if (gameImages) {
            Array.from(gameImages).forEach((file) => formData.append('gameImages', file));
        }
        if (gameVideo) {
            formData.append('gameVideo', gameVideo);
        }

        if (gameType === 'unity') {
            formData.append('hasStreamingAssets', hasStreamingAssets ? 'true' : 'false');
            formData.append('files', dataFile!);
            formData.append('files', wasmFile!);
            formData.append('files', frameworkFile!);
            formData.append('files', loaderFile!);

            if (hasStreamingAssets && streamingAssetsFiles) {
                Array.from(streamingAssetsFiles).forEach((file) => {
                    formData.append('streamingAssetsFiles', file, file.webkitRelativePath);
                });
            }
        } else if (gameType === 'html') {
            Array.from(htmlFiles!).forEach((file) => {
                formData.append('htmlFiles', file);
            });
        }

        if (force) {
            formData.append('force', 'true');
        }

        const endpoint = gameType === 'unity' ? '/api/publish/unity' : '/api/publish/html';
        const res = await fetch(endpoint, {
            method: 'POST',
            body: formData,
        });

        if (res.ok) {
            setUploaded(true);
        } else if (res.status === 409) {
            const { message } = await res.json();
            const confirmOverwrite = window.confirm(message);
            if (confirmOverwrite) {
                await handleUpload(true);
            }
        } else {
            alert('Upload failed.');
        }
    };

    const checkAvailability = async () => {
        if (!gameId.trim()) return alert("Please enter a Game ID to check.");

        setChecking(true);
        setAvailable(null);

        try {
            const res = await fetch(`/api/arena/games/${gameId.trim()}`);

            if (res.status === 200) {
                // Game exists => Not available
                setAvailable(false);
            } else if (res.status === 404) {
                // Game not found => Available
                setAvailable(true);
            } else {
                throw new Error('Unexpected response');
            }
        } catch (err) {
            console.error('Error checking game ID:', err);
            alert('Error checking game ID. See console for details.');
            setAvailable(null);
        } finally {
            setChecking(false);
        }
    };

    if (!session) return <SignIn />;


    return (
        <div className={styles.wrapper}>
            <h1 className={styles.title}>Publish Game</h1>
            <h6 className={styles.uploader}>Publisher : {session.user?.name}</h6>

            {!uploaded && (
                <>
                    {step === 1 && !gameType && (
                        <>
                            <h2>Choose Game Type</h2>
                            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                                <button
                                    className={styles.gameTypeButton}
                                    onClick={() => setGameType('unity')}
                                    style={{
                                        padding: '20px',
                                        border: '2px solid #007bff',
                                        borderRadius: '8px',
                                        background: 'white',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        flex: 1
                                    }}
                                >
                                    Unity WebGL Build
                                    <br />
                                    <small style={{ fontWeight: 'normal', color: '#666' }}>
                                        Upload .data, .wasm, .framework.js, .loader.js files
                                    </small>
                                </button>
                                <button
                                    className={styles.gameTypeButton}
                                    onClick={() => setGameType('html')}
                                    style={{
                                        padding: '20px',
                                        border: '2px solid #28a745',
                                        borderRadius: '8px',
                                        background: 'white',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        flex: 1
                                    }}
                                >
                                    HTML Game
                                    <br />
                                    <small style={{ fontWeight: 'normal', color: '#666' }}>
                                        Upload index.html, CSS, JS, and assets
                                    </small>
                                </button>
                            </div>
                        </>
                    )}

                    {step === 1 && gameType && (
                        <>
                            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button
                                    onClick={() => {
                                        setGameType(null);
                                        setStep(1);
                                    }}
                                    style={{
                                        padding: '5px 10px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        background: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ← Back to Game Type
                                </button>
                                <span style={{ fontWeight: 'bold' }}>
                                    Publishing {gameType === 'unity' ? 'Unity WebGL' : 'HTML'} Game
                                </span>
                            </div>
                            <label>
                                Game ID ❗️
                                <input
                                    type="text"
                                    required
                                    value={gameId}
                                    onChange={(e) => setGameId(e.target.value)}
                                    placeholder="Must be Unique, please check for availability "
                                />
                                <br />
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <button
                                        className={styles.checkForAvailability}
                                        type="button"
                                        onClick={checkAvailability}
                                        disabled={checking}
                                    >
                                        {checking ? 'Checking...' : 'Check for Availability'}
                                    </button>
                                    {available !== null && (
                                        <span style={{ fontSize: 14 }}>
                                            {available ? '✅ Available' : '❌ Already Exists'}
                                        </span>
                                    )}
                                </div>

                            </label>


                            <label>
                                Game Name ❗️
                                <input
                                    type="text"
                                    required
                                    value={gameName}
                                    onChange={(e) => setGameName(e.target.value)}
                                    placeholder="Enter game name"
                                />
                            </label>

                            <label>
                                Description
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    placeholder="Enter game description"
                                />
                            </label>

                            <label>
                                Details
                                <textarea
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    rows={4}
                                    placeholder="Enter additional details ... ex: controls, how to play ?"
                                />
                            </label>

                            <label>
                                Categories
                                <input
                                    type="text"
                                    value={categories}
                                    onChange={(e) => setCategories(e.target.value)}
                                    placeholder="Comma separated"
                                />
                            </label>

                            <label>
                                Game Images (PNG, IMG):
                                <input
                                    type="file"
                                    accept=".png, .img"
                                    multiple
                                    onChange={(e) => setGameImages(e.target.files)}
                                />
                            </label>

                            <label>
                                Game Video (MP4)*
                                <input
                                    type="file"
                                    accept=".mp4"
                                    onChange={(e) =>
                                        setGameVideo(e.target.files ? e.target.files[0] : null)
                                    }
                                />
                            </label>

                            <button
                                className={styles.uploadBtn}
                                onClick={() => {
                                    if (canGoNextStep1()) setStep(2);
                                    else alert('Please fill all required fields on this page.');
                                }}
                            >
                                Next
                            </button>
                        </>
                    )}

                    {step === 2 && gameType === 'unity' && (
                        <>
                            <File label="DATA file (.data)*" accept=".data" onFileChange={setDataFile} />
                            <File label="WASM file (.wasm)*" accept=".wasm" onFileChange={setWasmFile} />
                            <File
                                label="Framework JS (.framework.js)*"
                                accept=".framework.js"
                                onFileChange={setFrameworkFile}
                            />
                            <File label="Loader JS (.loader.js)*" accept=".loader.js" onFileChange={setLoaderFile} />

                            {/* <label style={{ marginTop: '20px', display: 'block' }}>
                                <input
                                    type="checkbox"
                                    checked={hasStreamingAssets}
                                    onChange={(e) => {
                                        setHasStreamingAssets(e.target.checked);
                                        setStreamingAssetsFiles(null);
                                    }}
                                    style={{ marginRight: 6 }}
                                />
                                Has Streaming Assets?
                            </label> */}

                            {/* {hasStreamingAssets && (
                                <div>
                                    <label htmlFor="streaming-assets-upload">
                                        Upload StreamingAssets Folder:
                                    </label>
                                    <FolderUpload />
                                    <small style={{ fontSize: 12, color: '#666' }}>
                                        Select the entire StreamingAssets folder to preserve structure
                                    </small>
                                </div>
                            )} */}

                            <div style={{ marginTop: '20px' }}>
                                <button
                                    className={styles.uploadBtn}
                                    onClick={() => setStep(1)}
                                    style={{ marginRight: '10px' }}
                                >
                                    Back
                                </button>

                                <button
                                    className={styles.uploadBtn}
                                    onClick={() => {
                                        handleUpload();
                                    }}
                                    disabled={!canSubmit()}
                                >
                                    Upload Unity Build
                                </button>
                            </div>
                        </>
                    )}

                    {step === 2 && gameType === 'html' && (
                        <>
                            <div style={{ marginBottom: '20px' }}>
                                <h3>HTML Game Upload Options</h3>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <input
                                            type="radio"
                                            name="uploadType"
                                            value="folder"
                                            defaultChecked
                                            onChange={() => setUploadType('folder')}
                                        />
                                        Upload Folder
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <input
                                            type="radio"
                                            name="uploadType"
                                            value="files"
                                            onChange={() => setUploadType('files')}
                                        />
                                        Upload Individual Files
                                    </label>
                                </div>
                            </div>

                            {uploadType === 'folder' && (
                                <>
                                    <label>
                                        HTML Game Folder*
                                        <input
                                            type="file"
                                            webkitdirectory="true"
                                            directory="true"
                                            multiple
                                            onChange={(e) => setHtmlFiles(e.target.files)}
                                            style={{ 
                                                padding: '10px',
                                                border: '2px dashed #ccc',
                                                borderRadius: '8px',
                                                width: '100%',
                                                cursor: 'pointer'
                                            }}
                                        />
                                        <small style={{ fontSize: 12, color: '#666', display: 'block', marginTop: '5px' }}>
                                            Select your HTML game folder. All files and subfolders will be preserved.
                                        </small>
                                    </label>

                                    {htmlFiles && htmlFiles.length > 0 && (
                                        <div style={{ 
                                            marginTop: '15px', 
                                            padding: '15px', 
                                            backgroundColor: '#f8f9fa', 
                                            borderRadius: '8px',
                                            border: '1px solid #e9ecef'
                                        }}>
                                            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
                                                📁 Uploaded Files ({htmlFiles.length} files)
                                            </h4>
                                            <div style={{ 
                                                maxHeight: '200px', 
                                                overflowY: 'auto',
                                                fontSize: '12px',
                                                fontFamily: 'monospace'
                                            }}>
                                                {Array.from(htmlFiles).map((file, index) => (
                                                    <div key={index} style={{ 
                                                        padding: '2px 0',
                                                        color: file.name.endsWith('.html') ? '#007bff' : '#666'
                                                    }}>
                                                        {file.webkitRelativePath || file.name}
                                                        {file.name === 'index.html' && ' ⭐'}
                                                    </div>
                                                ))}
                                            </div>
                                            {!Array.from(htmlFiles).some(f => f.name === 'index.html') && (
                                                <div style={{ 
                                                    marginTop: '10px', 
                                                    padding: '8px', 
                                                    backgroundColor: '#fff3cd', 
                                                    border: '1px solid #ffeaa7',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    color: '#856404'
                                                }}>
                                                    ⚠️ Warning: No index.html file found. Make sure your main HTML file is named 'index.html'
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            {uploadType === 'files' && (
                                <>
                                    <label>
                                        HTML Game Files*
                                        <input
                                            type="file"
                                            multiple
                                            accept=".html,.htm,.css,.js,.png,.jpg,.jpeg,.gif,.svg,.wav,.mp3,.ogg,.webm,.mp4"
                                            onChange={(e) => setHtmlFiles(e.target.files)}
                                            style={{ 
                                                padding: '10px',
                                                border: '1px solid #ccc',
                                                borderRadius: '8px',
                                                width: '100%'
                                            }}
                                        />
                                        <small style={{ fontSize: 12, color: '#666', display: 'block', marginTop: '5px' }}>
                                            Upload all your HTML game files (index.html, CSS, JS, images, sounds, etc.)
                                        </small>
                                    </label>

                                    {htmlFiles && htmlFiles.length > 0 && (
                                        <div style={{ 
                                            marginTop: '15px', 
                                            padding: '15px', 
                                            backgroundColor: '#f8f9fa', 
                                            borderRadius: '8px',
                                            border: '1px solid #e9ecef'
                                        }}>
                                            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
                                                📄 Selected Files ({htmlFiles.length} files)
                                            </h4>
                                            <div style={{ 
                                                maxHeight: '150px', 
                                                overflowY: 'auto',
                                                fontSize: '12px'
                                            }}>
                                                {Array.from(htmlFiles).map((file, index) => (
                                                    <div key={index} style={{ 
                                                        padding: '2px 0',
                                                        color: file.name.endsWith('.html') ? '#007bff' : '#666'
                                                    }}>
                                                        📄 {file.name}
                                                        {file.name === 'index.html' && ' ⭐'}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            <div style={{ 
                                marginTop: '20px', 
                                padding: '15px', 
                                backgroundColor: '#e7f3ff', 
                                borderRadius: '8px',
                                border: '1px solid #b3d9ff'
                            }}>
                                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
                                    📋 HTML Game Requirements
                                </h4>
                                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#0066cc' }}>
                                    <li>Must include index.html as the main entry point</li>
                                    <li>All file paths should be relative (no absolute URLs)</li>
                                    <li>Maximum total size: 50MB</li>
                                    <li>Supported formats: HTML, CSS, JS, PNG, JPG, GIF, SVG, MP3, WAV, OGG</li>
                                </ul>
                            </div>

                            <div style={{ marginTop: '20px' }}>
                                <button
                                    className={styles.uploadBtn}
                                    onClick={() => setStep(1)}
                                    style={{ marginRight: '10px' }}
                                >
                                    Back
                                </button>

                                <button
                                    className={styles.uploadBtn}
                                    onClick={() => {
                                        handleUpload();
                                    }}
                                    disabled={!canSubmit()}
                                >
                                    Upload HTML Game
                                </button>
                            </div>
                        </>
                    )}
                </>
            )}

            {uploaded && <p>{gameType === 'unity' ? 'Unity Build' : 'HTML Game'} Uploaded! You can now preview the game.</p>}
        </div>
    );
}
