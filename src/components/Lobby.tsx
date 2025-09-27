import { useState, useEffect } from "react";
import { THEMES } from "../hooks/themes";
import { auth, getCurrentUser, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, updateDoc, doc, getDoc, arrayUnion, deleteDoc } from "firebase/firestore";

import LobbyMenu from "./LobbyMenu";
import LobbyJoin from "./LobbyJoin";
import LobbyRoom from "./LobbyRoom";
import type { RoomData } from "../types";

type LobbyProps = {
    roomData: RoomData | null;
    nickname: string;
    setRoomId: (id: string) => void;
};

const Lobby: React.FC<LobbyProps> = ({ roomData, nickname, setRoomId }: LobbyProps) => {
    const roomId = roomData?.id || localStorage.getItem("roomId") || "";
    const [username, setUsername] = useState(nickname || "");
    const themeNames = Object.keys(THEMES);
    const [themeInput, setThemeInput] = useState(roomData?.theme || themeNames[0]);
    // no explicit create-time imposter flag; startGame will decide randomly
    const [mode, setMode] = useState<"menu" | "create" | "join" | "lobby">(() => {
        const storedRoomId = localStorage.getItem("roomId");
        return storedRoomId ? "lobby" : "menu";
    });

    const [error, setError] = useState("");
    const [isHost, setIsHost] = useState(false);
    const [user, setUser] = useState<{ uid: string } | null>(null);
    const [roomCode, setRoomCode] = useState("");
    // Track Firebase auth user
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser({ uid: firebaseUser.uid });
            } else {
                setUser(null);
            }
        });
        return () => unsub();
    }, []);

    // Detect host
    useEffect(() => {
        if (!roomData || !user) return setIsHost(false);
        setIsHost(roomData.hostId === user.uid);
    }, [roomData, user]);

    // Sync theme if room changes
    useEffect(() => {
        if (roomData && themeNames.includes(roomData.theme)) setThemeInput(roomData.theme);
    }, [roomData?.theme, themeNames]);

    // --- Create Room ---
    const createRoom = async () => {
        setError("");
        const user = getCurrentUser();
        if (!user) {
            setError("Not signed in yet. Try again shortly.");
            return;
        }
        try {
            const cleanName = username.trim() || "Host";
            const room = {
                players: [
                    {
                        id: user.uid,
                        name: cleanName,
                        clues: [],
                        word: "",
                        isImposter: false,
                        vote: null,
                    },
                ],
                theme: themeInput,
                themeLang: "en",
                hasImposter: false,
                phase: "lobby",
                hostId: user.uid,
                turn: 0,
                round: 1,
            };
            const colRef = collection(db, "rooms");
            const docRef = await addDoc(colRef, room);
            setRoomId(docRef.id);
            localStorage.setItem("roomId", docRef.id);
            setMode("lobby");
        } catch (e: any) {
            setError(e?.message || "Failed to create room");
        }
    };

    // --- Join Room ---
    const joinRoom = async (joinId: string) => {
        setError("");
        const user = getCurrentUser();
        if (!user) {
            setError("Not signed in yet. Try again shortly.");
            return;
        }

        try {
            const roomRef = doc(db, "rooms", joinId);
            const snap = await getDoc(roomRef);

            if (!snap.exists()) {
                setError("Room not found");
                return;
            }

            const roomData = snap.data();

            if (roomData.phase === "game") {
                setError("Game already in progress. Please wait for the next round.");
                return;
            }

            const cleanName = username.trim() || "Player";

            await updateDoc(roomRef, {
                players: arrayUnion({
                    id: user.uid,
                    name: cleanName,
                    clues: [],
                    word: "",
                    isImposter: false,
                    vote: null,
                }),
            });

            setRoomId(joinId);
            localStorage.setItem("roomId", joinId);
            setMode("lobby");
        } catch (e: any) {
            setError(e?.message || "Failed to join room");
        }
    };

    // --- Start Game ---
    const startGame = async () => {
        if (!roomId || !roomData) return;
        try {
            const roomRef = doc(db, "rooms", roomId);
            // Choose words from theme
            const themeName = roomData.theme || themeNames[0];
            const lang = roomData.themeLang || "en";
            const wordPool = (THEMES as any)[themeName]?.[lang] || [];
            // pick a random word
            const pickWord = () => wordPool[Math.floor(Math.random() * wordPool.length)];

            const players = roomData.players || [];
            // 80% chance to include an imposter
            const hasImposter = Math.random() < 0.8;
            const imposterIndex = hasImposter && players.length > 0 ? Math.floor(Math.random() * players.length) : -1;
            const chosenWord = pickWord() || "";

            const updatedPlayers = players.map((p, idx) => {
                if (idx === imposterIndex) {
                    return { ...p, isImposter: true, word: "" };
                }
                return { ...p, isImposter: false, word: chosenWord, clues: [] };
            });

            await updateDoc(roomRef, {
                players: updatedPlayers,
                phase: "game",
                turn: 0,
                round: 1,
                hasImposter: hasImposter
            });
        } catch (e: any) {
            setError(e?.message || "Failed to start game");
        }
    };

    // --- UI ---
    if (mode === "menu") {
        return (
            <LobbyMenu
                onCreate={createRoom}
                onJoin={() => setMode("join")}
            />
        );
    }

    if (mode === "join") {
        return (
            <LobbyJoin
                username={username}
                setUsername={setUsername}
                roomId={roomCode}
                setRoomId={setRoomCode}
                onJoin={joinRoom}
                onBack={() => setMode("menu")}
                error={error}
            />
        );
    }

    if (mode === "lobby" && roomData) {
        const handleReturn = async () => {
            // Remove current user from the room players list so others see them leave.
            try {
                const user = getCurrentUser();
                if (user && roomId) {
                    const roomRef = doc(db, "rooms", roomId);
                    const updatedPlayers = (roomData.players || []).filter(p => p.id !== user.uid);
                    if (updatedPlayers.length === 0) {
                        await deleteDoc(roomRef);
                    } else {
                        await updateDoc(roomRef, { players: updatedPlayers });
                    }
                }
            } catch (e) {
                // ignore errors - best effort cleanup
            }
            // locally navigate away regardless of Firestore result
            setRoomId("");
            localStorage.removeItem("roomId");
            setMode("menu");
        };

        return (
            <LobbyRoom
                roomId={roomId}
                username={username}
                setUsername={setUsername}
                themeInput={themeInput}
                setThemeInput={setThemeInput}
                themeNames={themeNames}
                lang={roomData.themeLang || "en"}
                isHost={isHost}
                players={roomData.players || []}
                startGame={startGame}
                canStart={isHost && (roomData.players?.length || 0) >= 3}
                error={error}
                onReturn={handleReturn}
            />
        );
    }
    // If no UI branch matched, render nothing instead of undefined
    return null;
};

export default Lobby;
