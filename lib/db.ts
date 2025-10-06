import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'games.db');

export async function getDb(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
    return open({
        filename: dbPath,
        driver: sqlite3.Database,
    });
}

export async function initDb() {
    const db = await getDb();

    await db.exec(`
        CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY,
            buildName TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            video TEXT,
            details TEXT,
            publisher TEXT,
            folderName TEXT
        );

        CREATE TABLE IF NOT EXISTS game_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_id INTEGER NOT NULL,
            image_path TEXT NOT NULL,
            FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS game_categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_id INTEGER NOT NULL,
            category TEXT NOT NULL,
            FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
        );
    `);

    // Add type column if it doesn't exist (migration)
    try {
        await db.exec(`ALTER TABLE games ADD COLUMN type TEXT DEFAULT 'unity'`);
    } catch (error) {
        // Column already exists, ignore the error
        console.log('Type column already exists or migration failed:', error);
    }

    // Add folderName column if it doesn't exist (migration)
    try {
        await db.exec(`ALTER TABLE games ADD COLUMN folderName TEXT`);
    } catch (error) {
        // Column already exists, ignore the error
        console.log('FolderName column already exists or migration failed:', error);
    }

    await db.close();
}

export type Game = {
    id?: number;
    buildName: string;
    title: string;
    description?: string;
    video?: string;
    details?: string;
    image?: string[];
    category?: string[];
    publisher?: string;
    type?: string;
    folderName?: string;
};

export async function insertGame(game: Game): Promise<number> {
    const db = await getDb();

    const { id, buildName, title, description, video, details, image = [], category = [], publisher, type = 'unity', folderName } = game;

    if (id !== undefined) {
        await db.run(`DELETE FROM games WHERE id = ?`, [id]);
        await db.run(`DELETE FROM game_images WHERE game_id = ?`, [id]);
        await db.run(`DELETE FROM game_categories WHERE game_id = ?`, [id]);
    }

    const result = await db.run(
        `INSERT INTO games (id, buildName, title, description, video, details, publisher, type, folderName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id ?? null, buildName, title, description, video, details, publisher, type, folderName]
    );

    const gameId = id ?? result.lastID!;

    const insertImage = db.prepare(`INSERT INTO game_images (game_id, image_path) VALUES (?, ?)`);
    const insertCategory = db.prepare(`INSERT INTO game_categories (game_id, category) VALUES (?, ?)`);

    for (const img of image) {
        await (await insertImage).run(gameId, img);
    }

    for (const cat of category) {
        await (await insertCategory).run(gameId, cat);
    }

    await (await insertImage).finalize();
    await (await insertCategory).finalize();
    await db.close();

    return gameId;
}

export async function getAllGames(): Promise<Game[]> {
    const db = await getDb();

    const games = await db.all(`SELECT * FROM games ORDER BY id ASC`);

    for (const game of games) {
        const images = await db.all(
            `SELECT image_path FROM game_images WHERE game_id = ?`,
            [game.id]
        );
        const categories = await db.all(
            `SELECT category FROM game_categories WHERE game_id = ?`,
            [game.id]
        );

        game.image = images.map(i => i.image_path);
        game.category = categories.map(c => c.category);
        
        // Ensure type field exists, default to 'unity' for existing games
        if (!game.type) {
            game.type = 'unity';
        }
    }

    await db.close();

    return games;
}

export async function getGameById(id: number): Promise<Game | null> {
    const db = await getDb();

    const game = await db.get(
        `SELECT id, buildName, title, description, video, details, publisher, type, folderName FROM games WHERE id = ?`,
        [id]
    );

    if (!game) {
        await db.close();
        return null;
    }

    const images = await db.all(
        `SELECT image_path FROM game_images WHERE game_id = ? ORDER BY id ASC`,
        [id]
    );
    const categories = await db.all(
        `SELECT category FROM game_categories WHERE game_id = ? ORDER BY id ASC`,
        [id]
    );

    await db.close();

    return {
        id: game.id,
        buildName: game.buildName,
        title: game.title,
        description: game.description,
        video: game.video,
        details: game.details,
        image: images.map(img => img.image_path),
        category: categories.map(cat => cat.category),
        publisher: game.publisher,
        type: game.type || 'unity', // Default to 'unity' if type is null/undefined
        folderName: game.folderName,
    };
}

export async function deleteGameById(id: number) {
    const db = await getDb();

    await db.run('PRAGMA foreign_keys = ON');

    await db.run(`DELETE FROM games WHERE id = ?`, [id]);
    await db.close();
}
