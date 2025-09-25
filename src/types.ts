export type Player = {
    id: string;
    name: string;
    word?: string; // undefined if imposter
    isImposter?: boolean;
    clues: string[];
    vote?: string; // id of voted player
};

export type Phase = "lobby" | "game" | "voting" | "results";
