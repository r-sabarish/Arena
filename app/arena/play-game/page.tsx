"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

const UnityGameView = dynamic(() => import("../../../components/unity/game-view"), { ssr: false });
const HTMLGameView = dynamic(() => import("../../../components/html/html-game-view"), { ssr: false });

interface Game {
    id: number;
    buildName: string;
    title: string;
    type: string;
    folderName?: string;
}

const PlayGamePage: React.FC = () => {
    const searchParams = useSearchParams();
    const id = searchParams?.get("Id");
    const name = searchParams?.get("Name");
    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGame = async () => {
            try {
                const res = await fetch(`/api/arena/games/${id}`);
                if (!res.ok) throw new Error('Game not found');
                const data = await res.json();
                setGame(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchGame();
        }
    }, [id]);

    if (loading) {
        return (
            <div
                className="aspect-video bg-white rounded-lg flex items-center justify-center"
                style={{ width: "100%", height: "100vh" }}
            >
                Loading game...
            </div>
        );
    }

    if (!game) {
        return (
            <div
                className="aspect-video bg-white rounded-lg flex items-center justify-center"
                style={{ width: "100%", height: "100vh" }}
            >
                Game not found
            </div>
        );
    }

    return (
        <div
            className="aspect-video bg-white rounded-lg flex items-center justify-center"
            style={{ width: "100%", height: "100vh" }}
        >
            {game.type === 'unity' ? (
                <UnityGameView Id={id!} Name={name!} />
            ) : (
                <HTMLGameView gameId={id!} buildName={name!} folderName={game.folderName} />
            )}
        </div>
    );
};

export default PlayGamePage;
