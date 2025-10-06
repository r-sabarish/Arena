// playfab.ts

import { Session } from "next-auth";

export type PlayFabUpdateDataResponse = {
    data?: any;
    error?: {
        code: number;
        status: string;
        errorMessage: string;
    };
};

export type PlayFabLoginResponse = {
    data?: {
        PlayFabId: string;
        SessionTicket: string;
        NewlyCreated: string
    };
    error?: {
        code: number;
        status: string;
        errorMessage: string;
    };
};

export type PlayFabUpdateStatsResponse = {
    data?: any;
    error?: {
        code: number;
        status: string;
        errorMessage: string;
    };
};

export async function getUserDataFromPlayFab(sessionTicket: string, titleId: string) {
    const res = await fetch(`https://${titleId}.playfabapi.com/Client/GetUserData`, {
        method: 'POST',
        headers: {
            'X-Authorization': sessionTicket,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
    });

    return res.json();
}

export async function getPlayerStatistics(sessionTicket: string, titleId: string) {
    const res = await fetch(`https://${titleId}.playfabapi.com/Client/GetPlayerStatistics`, {
        method: 'POST',
        headers: {
            'X-Authorization': sessionTicket,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
    });

    return res.json();
}

export async function getUserInventory(sessionTicket: string, titleId: string) {
    const res = await fetch(`https://${titleId}.playfabapi.com/Client/GetUserInventory`, {
        method: 'POST',
        headers: {
            'X-Authorization': sessionTicket,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
    });

    return res.json();
}

async function updateDisplayName(sessionTicket: string, titleId: string, newDisplayName: string) {
    try {
        const res = await fetch(`https://${titleId}.playfabapi.com/Client/UpdateUserTitleDisplayName`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': sessionTicket,
            },
            body: JSON.stringify({
                DisplayName: newDisplayName
            }),
        });

        if (!res.ok) {
            return {
                error: {
                    code: res.status,
                    status: res.statusText,
                    errorMessage: `HTTP error ${res.status}`,
                },
            };
        }

        const json = await res.json();
        return json;
    } catch (err: any) {
        return {
            error: {
                code: 0,
                status: 'NetworkError',
                errorMessage: err.message || 'Unknown error',
            },
        };
    }
}

async function updateEmail(sessionTicket: string, titleId: string, newEmail: string) {
    try {
        const res = await fetch(`https://${titleId}.playfabapi.com/Client/AddOrUpdateContactEmail`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': sessionTicket,
            },
            body: JSON.stringify({
                EmailAddress: newEmail
            }),
        });

        if (!res.ok) {
            return {
                error: {
                    code: res.status,
                    status: res.statusText,
                    errorMessage: `HTTP error ${res.status}`,
                },
            };
        }

        const json = await res.json();
        return json;
    } catch (err: any) {
        return {
            error: {
                code: 0,
                status: 'NetworkError',
                errorMessage: err.message || 'Unknown error',
            },
        };
    }
}



export async function updatePlayFabUserData(
    sessionTicket: string,
    titleId: string,
    data: Record<string, string>
): Promise<PlayFabUpdateDataResponse> {
    try {
        const res = await fetch(`https://${titleId}.playfabapi.com/Client/UpdateUserData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': sessionTicket,
            },
            body: JSON.stringify({ Data: data }),
        });

        if (!res.ok) {
            return {
                error: {
                    code: res.status,
                    status: res.statusText,
                    errorMessage: `HTTP error ${res.status}`,
                },
            };
        }

        const json = await res.json();
        return json;
    } catch (err: any) {
        return {
            error: {
                code: 0,
                status: 'NetworkError',
                errorMessage: err.message || 'Unknown error',
            },
        };
    }
}

export async function updatePlayerStatistics(
    sessionTicket: string,
    titleId: string,
    statistics: Statistics[]
): Promise<PlayFabUpdateStatsResponse> {
    try {
        const res = await fetch(`https://${titleId}.playfabapi.com/Client/UpdatePlayerStatistics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': sessionTicket,
            },
            body: JSON.stringify({ Statistics: statistics }),
        });

        if (!res.ok) {
            return {
                error: {
                    code: res.status,
                    status: res.statusText,
                    errorMessage: `HTTP error ${res.status}`,
                },
            };
        }

        const json = await res.json();
        return json;
    } catch (err: any) {
        return {
            error: {
                code: 0,
                status: 'NetworkError',
                errorMessage: err.message || 'Unknown error',
            },
        };
    }
}

export async function playFabLoginWithOpenId(
    connectionId: string,
    idToken: string,
    titleId: string
): Promise<PlayFabLoginResponse> {
    try {
        const res = await fetch(`https://${titleId}.playfabapi.com/Client/LoginWithOpenIdConnect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                TitleId: titleId,
                ConnectionId: connectionId,
                IdToken: idToken,
                CreateAccount: true,
            }),
        });

        const json = await res.json();


        if (!res.ok) {
            return { error: json };
        }
        return json;
    } catch (err: any) {
        return {
            error: {
                code: 0,
                status: 'NetworkError',
                errorMessage: err.message || 'Unknown error',
            },
        };
    }
}

interface CustomProfile {
    name?: string,
    email?: string,
    Stats?: Statistics[],
}

interface Statistics {
    StatisticName: string;
    Value: string;
}

export async function UpdateProfile(profile: CustomProfile, sessionTicket: string, titleId: string) {
    const results: {
        displayNameUpdate?: any;
        emailUpdate?: any;
        statsUpdate?: any;
    } = {};

    if (profile.name) {
        results.displayNameUpdate = await updateDisplayName(sessionTicket, titleId, profile.name);
    }

    if (profile.email) {
        results.emailUpdate = await updateEmail(sessionTicket, titleId, profile.email);
    }


    if (profile.Stats && profile.Stats.length > 0) {
        const statistics: Statistics[] = profile.Stats
            .filter(stat => stat.StatisticName && stat.Value !== undefined)
            .map(stat => ({
                StatisticName: stat.StatisticName!,
                Value: stat.Value,
            }));

        if (statistics.length > 0) {
            results.statsUpdate = await updatePlayerStatistics(sessionTicket, titleId, statistics);
        }
    }

    return results;
}

export async function playFabLoginWithAzureAD(
    titleId: string,
    session: Session
): Promise<PlayFabLoginResponse> {
    if (!session || !session.user || !session.idToken) {
        throw new Error("Session or idToken missing");
    }

    const idToken = session.idToken as string;

    const loginResponse = await playFabLoginWithOpenId('microsoft', idToken, titleId);

    if (loginResponse.error || !loginResponse.data?.SessionTicket) {
        return loginResponse;
    }

    const sessionTicket = loginResponse.data.SessionTicket;

    if (typeof window !== 'undefined') {
        sessionStorage.setItem('playfabSessionTicket', sessionTicket);
    }

    const profile: CustomProfile = {
        email: session.user.email ?? '',
        name: session.user.name ?? '',
        Stats: [
            { StatisticName: "Trophies", Value: '0' },
            { StatisticName: "Games Played", Value: '0' }
        ]
    };

    await UpdateProfile(profile, sessionTicket, titleId);

    return loginResponse;
}


export async function getFriendsList(sessionTicket: string, titleId: string) {
    try {
        const res = await fetch(`https://${titleId}.playfabapi.com/Client/GetFriendsList`, {
            method: 'POST',
            headers: {
                'X-Authorization': sessionTicket,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        });

        if (!res.ok) {
            return {
                error: {
                    code: res.status,
                    status: res.statusText,
                    errorMessage: `HTTP error ${res.status}`,
                },
            };
        }

        const json = await res.json();
        return json;
    } catch (err: any) {
        return {
            error: {
                code: 0,
                status: 'NetworkError',
                errorMessage: err.message || 'Unknown error',
            },
        };
    }
}

export async function addFriend(
    sessionTicket: string,
    titleId: string,
    friendPlayFabId?: string,
    friendEmail?: string,
    friendUsername?: string,
    friendTitleDisplayName?: string
) {
    const body: Record<string, string> = {};

    if (friendPlayFabId) body.FriendPlayFabId = friendPlayFabId;
    else if (friendEmail) body.FriendEmail = friendEmail;
    else if (friendUsername) body.FriendUsername = friendUsername;
    else if (friendTitleDisplayName) body.FriendTitleDisplayName = friendTitleDisplayName;
    else throw new Error('You must provide at least one friend identifier');


    const res = await fetch(`https://${titleId}.playfabapi.com/Client/AddFriend`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization': sessionTicket,
        },
        body: JSON.stringify(body),
    });


    return res.json();

}


export async function getLeaderboard(
    sessionTicket: string,
    titleId: string,
    statisticName: string
) {
    const res = await fetch(`https://${titleId}.playfabapi.com/Client/GetLeaderboard`, {
        method: 'POST',
        headers: {
            'X-Authorization': sessionTicket,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            StatisticName: statisticName,
            StartPosition: 0,
            MaxResultsCount: 10,
        }),
    });

    return res.json();
}

export async function AddArenaCoins(
    sessionTicket: string,
    titleId: string,
    amount: number
) {
    if (amount === 0) return;
    await AddVirtualCurrency(sessionTicket, titleId, "AC", amount);
}

export async function AddGamePlayedCount(
    sessionTicket: string,
    titleId: string
) {
    const statsRes = await getPlayerStatistics(sessionTicket, titleId);

    const currentCount = statsRes?.data?.Statistics?.find(
        (s: any) => s.StatisticName === "Games Played"
    )?.Value ?? 0;

    const newCount = parseInt(currentCount) + 1;

    const statistics: Statistics[] = [
        {
            StatisticName: "Games Played",
            Value: newCount.toString(),
        }
    ];

    await updatePlayerStatistics(sessionTicket, titleId, statistics);
}


export async function AddTrophies(
    sessionTicket: string,
    titleId: string,
    trophies: number
) {
    if (trophies === 0) return;

    const statistics: Statistics[] = [
        {
            StatisticName: "Trophies",
            Value: String(trophies),
        }
    ];

    await updatePlayerStatistics(sessionTicket, titleId, statistics);
}

async function AddVirtualCurrency(
    sessionTicket: string,
    titleId: string,
    currencyName: string = "AC",
    amount: number
) {
    const res = await fetch(`https://${titleId}.playfabapi.com/Client/AddUserVirtualCurrency`, {
        method: 'POST',
        headers: {
            'X-Authorization': sessionTicket,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            VirtualCurrency: currencyName,
            Amount: amount,
        }),
    });

    return res.json();
}


export async function getCatalogItems(sessionTicket: string, titleId: string, catalogVersion = 'Main') {
    const res = await fetch(`https://${titleId}.playfabapi.com/Client/GetCatalogItems`, {
        method: 'POST',
        headers: {
            'X-Authorization': sessionTicket,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ CatalogVersion: catalogVersion }),
    });

    return res.json();
}

export async function getStoreItems(sessionTicket: string, titleId: string, storeId: string, catalogVersion = 'Main') {
    const res = await fetch(`https://${titleId}.playfabapi.com/Client/GetStoreItems`, {
        method: 'POST',
        headers: {
            'X-Authorization': sessionTicket,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ StoreId: storeId, CatalogVersion: catalogVersion }),
    });

    return res.json();
}

export async function purchaseStoreItem(sessionTicket: string, titleId: string, storeId: string, catalogVersion: string, itemId: string, price: number, currencyCode = 'AC') {
    console.log('PlayFab Purchase Request:', {
        endpoint: `https://${titleId}.playfabapi.com/Client/PurchaseItem`,
        storeId,
        catalogVersion,
        itemId,
        price,
        currencyCode
    });
    
    const res = await fetch(`https://${titleId}.playfabapi.com/Client/PurchaseItem`, {
        method: 'POST',
        headers: {
            'X-Authorization': sessionTicket,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            StoreId: storeId,
            CatalogVersion: catalogVersion,
            ItemId: itemId,
            Price: price,
            VirtualCurrency: currencyCode,
        }),
    });

    const result = await res.json();
    console.log('PlayFab Purchase Response:', result);
    
    return result;
}

export async function useInventoryItem(
    sessionTicket: string,
    titleId: string,
    itemInstanceId: string,
    consumeCount: number = 1
) {
    const res = await fetch(`https://${titleId}.playfabapi.com/Client/ConsumeItem`, {
        method: 'POST',
        headers: {
            'X-Authorization': sessionTicket,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ItemInstanceId: itemInstanceId,
            ConsumeCount: consumeCount,
        }),
    });

    return res.json();
}
