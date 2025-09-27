
import { useState } from "react";
import styles from "./Lobby.module.css";
import type { Player } from "../types";
import { db, getCurrentUser } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import InstructionsModal from "./InstructionsModal";

interface LobbyRoomProps {
    roomId: string;
    username: string;
    setUsername: (name: string) => void;
    themeInput: string;
    setThemeInput: (theme: string) => void;
    themeNames: string[];
    lang: string;
    isHost: boolean;
    players: Player[];
    startGame: () => void;
    canStart: boolean;
    error: string;
    onReturn: () => void;
}

export default function LobbyRoom({
    roomId,
    username,
    setUsername,
    themeInput,
    setThemeInput,
    themeNames,
    lang,
    isHost,
    players,
    startGame,
    canStart,
    error,
    onReturn
}: LobbyRoomProps) {
    // Track local input for nickname editing
    const [nicknameInput, setNicknameInput] = useState(username);
    const [updating, setUpdating] = useState(false);
    const nameChanged = nicknameInput.trim() && nicknameInput !== username;
    const [showInstructions, setShowInstructions] = useState(false); // NEW state

    // Update nickname in Firestore and local players
    const handleUpdateNickname = async () => {
        if (!nameChanged || !roomId) return;
        setUpdating(true);
        const user = getCurrentUser();
        if (!user) return;
        // Update in players array
        const updatedPlayers = players.map((p) =>
            p.id === user.uid ? { ...p, name: nicknameInput.trim() } : p
        );
        try {
            const roomRef = doc(db, "rooms", roomId);
            await updateDoc(roomRef, { players: updatedPlayers });
        } catch (e) { /* ignore */ }
        setUsername(nicknameInput.trim());
        setUpdating(false);
    };

    return (
        <div className={styles.container}>
            {showInstructions && (
                <InstructionsModal onClose={() => setShowInstructions(false)} />
            )}
            <button
                onClick={() => setShowInstructions(true)}
                className="absolute top-4 right-4 bg-white p-2 rounded-full shadow hover:bg-gray-200"
            >
                ❓
            </button>
            <h1 className={styles.heading}>Room Lobby</h1>
            <div className={styles.themeNote} style={{ textAlign: 'center', fontWeight: 600, fontSize: '1.1rem', marginBottom: 10 }}>
                Room code: <b>{roomId}</b>
            </div>
            <div style={{
                marginBottom: 18,
                background: '#f8fafc',
                borderRadius: 14,
                padding: 16,
                boxShadow: '0 1px 8px #e0e7ff',
                maxWidth: 360,
                marginLeft: 'auto',
                marginRight: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8
            }}>
                <label style={{ fontWeight: 700, color: '#334155', fontSize: '1.05rem', marginBottom: 4 }}>Change your nickname</label>
                <input
                    type="text"
                    placeholder="Change your nickname"
                    value={nicknameInput}
                    onChange={e => setNicknameInput(e.target.value)}
                    className={styles.input}
                    style={{ maxWidth: 220, textAlign: 'center', fontWeight: 500, fontSize: '1.05rem', marginBottom: 0 }}
                />
                <button
                    className={styles.button}
                    type="button"
                    style={{ width: 140, marginTop: 4 }}
                    onClick={handleUpdateNickname}
                    disabled={!nameChanged || updating}
                >
                    {updating ? "Updating..." : "Update"}
                </button>
            </div>
            <div className={styles.themeNote} style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.15rem', marginBottom: 12, color: '#6366f1', letterSpacing: 0.5 }}>
                Theme & Language
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
                <div>
                    <label style={{ fontWeight: 600, marginRight: 6 }}>Theme:</label>
                    <select
                        value={themeInput}
                        onChange={async (e) => {
                            if (!isHost) return;
                            const newTheme = e.target.value;
                            setThemeInput(newTheme);
                            if (roomId) {
                                const roomRef = doc(db, "rooms", roomId);
                                await updateDoc(roomRef, { theme: newTheme });
                            }
                        }}
                        className={styles.input}
                        style={{ minWidth: 120 }}
                        disabled={!isHost}
                    >
                        {themeNames.map((name) => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={{ fontWeight: 600, marginRight: 6 }}>Language:</label>
                    <select
                        value={lang}
                        onChange={async (e) => {
                            if (!isHost) return;
                            const newLang = e.target.value;
                            // Update Firestore
                            if (roomId) {
                                const roomRef = doc(db, "rooms", roomId);
                                await updateDoc(roomRef, { themeLang: newLang });
                            }
                        }}
                        disabled={!isHost}
                        className={styles.input}
                        style={{ minWidth: 80 }}
                    >
                        <option value="en">English</option>
                        <option value="bg">Bulgarian</option>
                    </select>
                </div>
                {/* no imposter toggle; imposter is chosen at start with 80% probability */}
            </div>
            <ul className={styles.playersList} style={{ marginBottom: 18, marginTop: 0, background: '#fff', border: '1.5px solid #e0e7ff', boxShadow: '0 1px 6px #e0e7ff' }}>
                {players.map((p) => {
                    const isYou = p.name === username;
                    return (
                        <li key={p.id} className={styles.playerItem} style={{ padding: 4, borderRadius: 8, margin: '2px 0', background: isYou ? '#e0e7ff' : 'transparent', fontWeight: isYou ? 700 : 500 }}>
                            <span className={styles.avatar}>{p.name[0]?.toUpperCase()}</span>
                            <span className={styles.playerName}>{p.name}</span>
                            {isYou && (
                                <span style={{ marginLeft: 8, color: '#6366f1', fontSize: '0.95em', fontWeight: 700 }}>(You)</span>
                            )}
                        </li>
                    );
                })}
            </ul>

            <button
                onClick={startGame}
                className={styles.button + (!canStart ? ' ' + styles.disabled : '')}
                disabled={!canStart}
                type="button"
                style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: 0.5, marginTop: 0, marginBottom: 0 }}
            >
                Start Game
            </button>
            {error && <p className={styles.requireNote}>{error}</p>}
            <button
                className={styles.button}
                style={{ marginTop: 12, background: 'linear-gradient(90deg, #f87171 0%, #fbbf24 100%)', color: '#fff', fontWeight: 700 }}
                onClick={onReturn}
                type="button"
            >
                Return
            </button>
        </div>
    );
}
