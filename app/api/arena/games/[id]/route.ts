import { NextResponse } from 'next/server';
import { getGameById } from '@/lib/db';

export async function GET(
    req: Request,
    context: Promise<{ params: Promise<{ id: string }> }>
) {
    try {
        const params = await context;
        const { id } = await params.params;
        const gameId = parseInt(id);

        if (isNaN(gameId)) {
            return NextResponse.json({ error: 'Invalid game ID' }, { status: 400 });
        }

        const game = await getGameById(gameId);

        if (!game) {
            return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        return NextResponse.json(game);
    } catch (error) {
        console.error('Failed to fetch game:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
