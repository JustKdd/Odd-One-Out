export type RoomData = {
    id: string;
    players: Player[];
    theme: string;
    themeLang: string;
    hasImposter: boolean;
    phase: Phase;
    hostId: string;
    turn?: number;
    round?: number;
    [key: string]: any;
};
export type Player = {
    id: string;
    name: string;
    word?: string; // undefined if imposter
    isImposter?: boolean;
    clues: string[];
    vote?: string; // id of voted player
};

export type Phase = "lobby" | "game" | "voting" | "results";
