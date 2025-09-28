import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { IncomingForm } from 'formidable';
import fs from 'fs/promises';
import fssync from 'fs';
import path from 'path';
import { insertGame } from '@/lib/db';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const form = new IncomingForm({ multiples: true, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Form parse error:', err);
            return res.status(500).json({ error: 'Failed to parse form' });
        }

        try {
            const gameId = Array.isArray(fields.gameId) ? fields.gameId[0] : fields.gameId || '';
            const gameName = Array.isArray(fields.gameName) ? fields.gameName[0] : fields.gameName || '';
            const categoryStr = Array.isArray(fields.categories) ? fields.categories[0] : fields.categories || '';
            const forceField = fields.force;
            const force = Array.isArray(forceField) ? forceField[0] === 'true' : forceField === 'true';
            const categories = categoryStr.split(',').map((c) => c.trim()).filter(Boolean);
            const publisher = Array.isArray(fields.publisher) ? fields.publisher[0] : fields.publisher || '';
                        
            if (!gameId || !gameName) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const basePath = path.join(process.cwd(), 'public', 'games', gameId);
            const previewPath = path.join(basePath, 'Previews');
            const videoPath = path.join(basePath, 'Videos');

            // Handle duplicate build
            if (fssync.existsSync(basePath)) {
                if (!force) {
                    return res.status(409).json({ conflict: true, message: 'Build already exists' });
                }

                // Delete existing content
                await fs.rm(basePath, { recursive: true, force: true });
            }

            // Recreate folders
            for (const dir of [basePath, previewPath, videoPath]) {
                await fs.mkdir(dir, { recursive: true });
            }

            // Normalize files from form-data
            const htmlFiles = Array.isArray(files.htmlFiles) ? files.htmlFiles : files.htmlFiles ? [files.htmlFiles] : [];
            const previewFiles = Array.isArray(files.gameImages) ? files.gameImages : files.gameImages ? [files.gameImages] : [];
            const videoFile = Array.isArray(files.gameVideo) ? files.gameVideo[0] : files.gameVideo;

            let imageUrls: string[] = [];
            let videoUrl = '';

            // Validate that we have HTML files
            if (htmlFiles.length === 0) {
                return res.status(400).json({ error: 'No HTML game files provided' });
            }

            // Check if index.html exists
            const hasIndexHtml = htmlFiles.some(file => {
                const filename = file.originalFilename || file.newFilename || '';
                return filename.endsWith('index.html') || filename.endsWith('/index.html');
            });

            if (!hasIndexHtml) {
                return res.status(400).json({ 
                    error: 'HTML game must include an index.html file as the entry point' 
                });
            }

            // Detect folder name for HTML games
            let folderName = null;
            const firstFile = htmlFiles[0];
            if (firstFile && firstFile.originalFilename && firstFile.originalFilename.includes('/')) {
                const pathParts = firstFile.originalFilename.split('/');
                folderName = pathParts[0]; // Get the root folder name
            }

            // Save HTML game files (index.html, CSS, JS, assets, etc.)
            for (const file of htmlFiles) {
                if (!file) continue;
                
                // For folder uploads, preserve the relative path structure
                // For individual files, just use the filename
                let relativePath = '';
                
                if (file.originalFilename && file.originalFilename.includes('/')) {
                    // This is from a folder upload - preserve the full relative path
                    relativePath = file.originalFilename;
                } else {
                    // This is an individual file upload
                    relativePath = file.originalFilename || file.newFilename || '';
                }
                
                const dest = path.join(basePath, relativePath);
                
                // Ensure directory exists
                await fs.mkdir(path.dirname(dest), { recursive: true });
                await fs.copyFile(file.filepath, dest);
            }

            // Save preview images
            for (let i = 0; i < previewFiles.length; i++) {
                const file = previewFiles[i];
                if (!file) continue;
                const ext = path.extname(file.originalFilename || '.png');
                const destPath = path.join(previewPath, `${i + 1}${ext}`);
                await fs.copyFile(file.filepath, destPath);
                imageUrls.push(`/games/${gameId}/Previews/${i + 1}${ext}`);
            }

            // Save video file
            if (videoFile) {
                const ext = path.extname(videoFile.originalFilename || '.mp4');
                const filename = `${gameName.replace(/\s+/g, '')}${ext}`;
                const dest = path.join(videoPath, filename);
                await fs.copyFile(videoFile.filepath, dest);
                videoUrl = `/games/${gameId}/Videos/${filename}`;
            }

            const description = Array.isArray(fields.description) ? fields.description[0] : fields.description || '';
            const details = Array.isArray(fields.details) ? fields.details[0] : fields.details || '';

            // Insert or overwrite DB
            await insertGame({
                id: parseInt(gameId),
                buildName: 'index', // HTML games use index.html as entry point
                title: gameName,
                description,
                image: imageUrls,
                category: categories,
                video: videoUrl,
                details,
                publisher,
                type: 'html',
                folderName: folderName
            });

            return res.status(200).json({ success: true });
        } catch (e) {
            console.error('Error during upload:', e);
            return res.status(500).json({ error: 'Upload failed' });
        }
    });
}