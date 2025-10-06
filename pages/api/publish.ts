import { NextApiRequest, NextApiResponse } from 'next';

// Legacy endpoint - redirects to Unity endpoint for backward compatibility
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Redirect to Unity endpoint for backward compatibility
    return res.status(301).json({ 
        message: 'This endpoint is deprecated. Please use /api/publish/unity for Unity builds or /api/publish/html for HTML games.',
        redirect: '/api/publish/unity'
    });
}
