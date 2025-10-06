import React, { ChangeEvent } from 'react';

interface FolderUploadProps {
    title: string;
    onChange: (files: FileList | null) => void;
}

export default function FolderUpload({ title, onChange }: FolderUploadProps) {
    const handleFolderChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        onChange(files);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-colors duration-300">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {title}
            </label>
            <input
                type="file"
                {...({webkitdirectory: ""} as any)}
                multiple
                onChange={handleFolderChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors duration-200"
            />
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                Select a folder containing all your files
            </p>
        </div>
    );
}
