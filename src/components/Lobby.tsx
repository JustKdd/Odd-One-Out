import { useState, useEffect } from "react";
import type { Player, Phase } from "../types";
import { collection, addDoc, doc, getDoc, getDocs, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "../firebase";
type User = { uid: string };
import { onAuthStateChanged } from "firebase/auth";
import { THEMES } from "../hooks/themes";
import LobbyMenu from "./LobbyMenu";
import LobbyJoin from "./LobbyJoin";
import LobbyRoom from "./LobbyRoom";

type LobbyProps = {
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
    setTheme: React.Dispatch<React.SetStateAction<string>>;
    setHasImposter: React.Dispatch<React.SetStateAction<boolean>>;
    setPhase: React.Dispatch<React.SetStateAction<Phase>>;
    setThemeLang: React.Dispatch<React.SetStateAction<string>>;
    nickname: string;
    setTurn: React.Dispatch<React.SetStateAction<number>>;
    setRound: React.Dispatch<React.SetStateAction<number>>;
    theme: string;
    lang: string;
    players: Player[];
};

export default function Lobby({ setPlayers, setTheme, setHasImposter, setPhase, nickname, theme, lang, players, setTurn, setRound }: LobbyProps) {
    const [roomId, setRoomId] = useState(() => localStorage.getItem("roomId") || "");
    const [isHost, setIsHost] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    // Listen for Firebase Auth state
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
    // Check if current user is host, but only when both roomId and user are available
    useEffect(() => {
        if (!roomId || !user) return;
        const checkHost = async () => {
            const roomRef = doc(db, "rooms", roomId);
            const snap = await getDoc(roomRef);
            const data = snap.data();
            setIsHost(!!(data && data.hostId === user.uid));
        };
        checkHost();
    }, [roomId, user]);
    const [username, setUsername] = useState(nickname || "");
    const themeNames = Object.keys(THEMES);
    const [themeInput, setThemeInput] = useState(themeNames[0]);
    // use lang prop instead of local state

    // Sync selects with Firestore changes
    useEffect(() => {
        if (themeNames.includes(theme)) setThemeInput(theme);
    }, [theme, themeNames]);
    // (no need for effect, lang is always from Firestore)
    // Use players prop from App.tsx instead of local state
    // If roomId exists in localStorage, start in lobby mode
    const [mode, setMode] = useState<"menu" | "create" | "join" | "lobby">(() => {
        const storedRoomId = localStorage.getItem("roomId");
        return storedRoomId ? "lobby" : "menu";
    });
    const [error, setError] = useState("");
    // const [createdRoomId, setCreatedRoomId] = useState<string | null>(null); // No longer used

    // Firestore listener moved to App.tsx for all phases

    // Create a new room
    const handleCreateRoom = async () => {
        if (!user) return setError("User not authenticated");
        if (!username || !username.trim()) return setError("Please enter a valid username");
        // Reset all state before creating new room
        setTheme("");
        setHasImposter(false);
        setPhase("lobby");
        setTurn(0);
        setRound(1);
        // Create new room
        const playerObj = { id: user.uid, name: username, clues: [] };
        const newRoomRef = await addDoc(collection(db, "rooms"), {
            players: [playerObj],
            theme: "",
            hasImposter: false,
            phase: "lobby",
            hostId: user.uid
        });
        // Only set roomId and mode; Firestore listener will update all other state
        setRoomId(newRoomRef.id);
        localStorage.setItem("roomId", newRoomRef.id);
        setMode("lobby");
        setError("");
    };
    // Use players prop from App.tsx instead of local state
    // Join an existing room
    const [joining, setJoining] = useState(false);
    const handleJoinRoom = async () => {
        if (!username.trim() || !roomId.trim()) return setError("Enter username and room code");
        if (!user) return setError("User not authenticated");
        const roomRef = doc(db, "rooms", roomId);
        const roomSnap = await getDoc(roomRef);
        if (!roomSnap.exists()) {
            setError("Room not found");
            return;
        }
        const data = roomSnap.data();
        // If user is already in the room by id, just switch to lobby
        if (data.players.some((p: Player) => p.id === user.uid)) {
            setRoomId(roomId);
            localStorage.setItem("roomId", roomId);
            setMode("lobby");
            setError("");
            return;
        }
        // Prevent duplicate names
        if (data.players.some((p: Player) => p.name === username)) {
            setError("Username already in this room");
            return;
        }
        // Always add the player to the room
        await updateDoc(roomRef, {
            players: arrayUnion({ id: user.uid, name: username, clues: [] })
        });
        setRoomId(roomId);
        localStorage.setItem("roomId", roomId);
        setJoining(true);
        setError("");
    };

    // After joining, wait for Firestore to show user in players, then switch to lobby
    useEffect(() => {
        if (joining && players.some((p) => user && p.id === user.uid)) {
            setMode("lobby");
            setJoining(false);
        }
    }, [joining, players, user]);
    // On mount, if user is already in a room, auto-switch to that room's lobby
    useEffect(() => {
        const checkExistingRoom = async () => {
            if (!user) return;
            // Search all rooms for this user
            const roomsCol = collection(db, "rooms");
            const roomsSnap = await getDocs(roomsCol);
            for (const docSnap of roomsSnap.docs) {
                const data = docSnap.data();
                if (data.players && data.players.some((p: Player) => p.id === user.uid)) {
                    setRoomId(docSnap.id);
                    setMode("lobby");
                    break;
                }
            }
        };
        if (mode === "menu") {
            checkExistingRoom();
        }
    }, [mode, user]);

    // Start the game (host only)
    const startGame = async () => {
        if (!roomId) return;
        const roomRef = doc(db, "rooms", roomId);
        const chosenTheme = themeInput || themeNames[0];
        const hasImposterValue = Math.random() < 0.7;
        // Pick a random option for the chosen theme and language
        let option = "";
        const optionsArr = THEMES[chosenTheme]?.[lang as keyof typeof THEMES[typeof chosenTheme]] || [];
        if (optionsArr.length > 0) {
            option = optionsArr[Math.floor(Math.random() * optionsArr.length)];
        }
        // Fetch current players
        const roomSnap = await getDoc(roomRef);
        const data = roomSnap.data();
        let updatedPlayers = data?.players || [];
        if (hasImposterValue && updatedPlayers.length > 0) {
            // Pick a random imposter
            const imposterIdx = Math.floor(Math.random() * updatedPlayers.length);
            updatedPlayers = updatedPlayers.map((p: Player, idx: number) => {
                if (idx === imposterIdx) {
                    // Imposter: no word
                    return { ...p, isImposter: true, word: "", clues: [] };
                } else {
                    // Not imposter: gets the word
                    return { ...p, isImposter: false, word: option, clues: [] };
                }
            });
        } else {
            // No imposter, everyone gets the word
            updatedPlayers = updatedPlayers.map((p: Player) => ({ ...p, isImposter: false, word: option, clues: [] }));
        }
        await updateDoc(roomRef, {
            theme: chosenTheme,
            themeOption: option,
            themeLang: lang,
            hasImposter: hasImposterValue,
            phase: "game",
            players: updatedPlayers
        });
        setTheme(chosenTheme);
        setHasImposter(hasImposterValue);
        setPlayers(updatedPlayers);
        setPhase("game");
    };

    // UI
    if (mode === "menu") {
        return (
            <LobbyMenu
                onCreate={handleCreateRoom}
                onJoin={() => setMode("join")}
            />
        );
    }

    if (mode === "join") {
        return (
            <LobbyJoin
                username={username}
                setUsername={setUsername}
                roomId={roomId}
                setRoomId={setRoomId}
                onJoin={handleJoinRoom}
                onBack={() => setMode("menu")}
                error={error}
            />
        );
    }

    // LOBBY: show room code and players, and allow nickname change for current user
    return (
        <LobbyRoom
            roomId={roomId}
            username={username}
            setUsername={setUsername}
            themeInput={themeInput}
            setThemeInput={setThemeInput}
            themeNames={themeNames}
            lang={lang}
            isHost={isHost}
            players={players}
            startGame={startGame}
            canStart={players.length >= 3 && isHost}
            error={error}
            onReturn={async () => {
                if (!user || !roomId) {
                    setRoomId("");
                    localStorage.removeItem("roomId");
                    setMode('menu');
                    return;
                }
                const roomRef = doc(db, "rooms", roomId);
                const roomSnap = await getDoc(roomRef);
                if (!roomSnap.exists()) {
                    setRoomId("");
                    localStorage.removeItem("roomId");
                    setMode('menu');
                    return;
                }
                const data = roomSnap.data();
                if (data.hostId === user.uid) {
                    // Host: delete the room
                    try {
                        await import("firebase/firestore").then(({ deleteDoc }) => deleteDoc(roomRef));
                    } catch (e) { /* ignore */ }
                } else {
                    // Player: remove self from players array
                    const updatedPlayers = (data.players || []).filter((p: Player) => p.id !== user.uid);
                    try {
                        await updateDoc(roomRef, { players: updatedPlayers });
                    } catch (e) { /* ignore */ }
                }
                setRoomId("");
                localStorage.removeItem("roomId");
                setMode('menu');
            }}
        />
    );
}
