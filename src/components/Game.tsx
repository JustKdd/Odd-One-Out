import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { RoomData } from "../types";
import React, { useState } from "react";
import styles from "./Game.module.css";
import { getCurrentUser, auth } from "../firebase";


interface GameProps {
    roomData: RoomData;
    setRoomData?: React.Dispatch<React.SetStateAction<RoomData | null>>;
}

const Game: React.FC<GameProps> = ({ roomData, setRoomData }) => {
    const [clue, setClue] = useState("");
    const roomId = roomData.id;
    const players = roomData.players;
    const round = roomData.round || 1;
    const theme = roomData.theme;
    const themeLang = roomData.themeLang;

    // Find the current user (fallback to auth.currentUser if helper not yet set)
    let user = getCurrentUser();
    if (!user && (auth as any)?.currentUser) {
        user = { uid: (auth as any).currentUser.uid };
    }
    const me = players.find((p) => user && p.id === user.uid);
    const isHost = !!(user && roomData.hostId === user.uid);

    // End game handler for host: delete room and clear local cache
    const handleEndGame = async () => {
        if (!roomId) return;
        try {
            await deleteDoc(doc(db, "rooms", roomId));
        } catch (e) { /* ignore */ }
        localStorage.removeItem("roomId");
        if (setRoomData) setRoomData(null);
    };

    const submitClue = async () => {
        if (!clue.trim()) return;
        // Prevent submitting more than one clue per round
        if (me && (me.clues || []).length >= round) return;

        const t = typeof roomData.turn === 'number' ? roomData.turn : 0;
        // build updated players immutably
        const updatedPlayers = players.map((p, idx) => idx === t ? { ...p, clues: [...(p.clues || []), clue] } : p);
        setClue("");

        let newTurn = t + 1;
        let newRound = round;
        let newPhase = "game";
        if (newTurn < players.length) {
            // next player's turn
        } else {
            if (round < 3) {
                newRound = round + 1;
                newTurn = 0;
            } else {
                newPhase = "voting";
            }
        }

        // Update Firestore so all players see the new clues and turn/phase
        if (roomId) {
            const roomRef = doc(db, "rooms", roomId);
            // optimistic update locally so UI isn't stuck while Firestore syncs
            if (setRoomData) {
                setRoomData((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        players: updatedPlayers,
                        turn: newTurn,
                        round: newRound,
                        phase: newPhase,
                    } as RoomData;
                });
            }
            await updateDoc(roomRef, {
                players: updatedPlayers,
                turn: newTurn,
                round: newRound,
                phase: newPhase
            });
        }
    };

    const t = typeof roomData.turn === 'number' ? roomData.turn : 0;
    const isMyTurn = !!(me && players[t] && players[t].id === me.id);
    // Defensive: if players is empty or turn is out of bounds, show nothing (or a fallback)
    if (!players.length || !players[t]) {
        return null;
    }
    return (
        <div className={styles.container}>
            <div className={styles.round}>Round {round}/3</div>
            <div className={styles.currentPlayer}>Current Player: <b>{players[t].name}</b></div>
            <div className={styles.themeNote} style={{ marginBottom: 12 }}>
                Theme: <b>{theme}</b> | Language: <b>{themeLang} </b>
            </div>

            {/* Show the word or imposter message */}
            {me && me.isImposter ? (
                <div style={{ color: 'red', fontWeight: 700, fontSize: '1.2rem', marginBottom: 16 }}>
                    You are the imposter!
                </div>
            ) : me && me.word ? (
                <div style={{ color: '#059669', fontWeight: 700, fontSize: '1.2rem', marginBottom: 16 }}>
                    Your word: <span style={{ color: '#0ea5e9' }}>{me.word}</span>
                </div>
            ) : null}

            {isMyTurn && me && (me.clues || []).length < round ? (
                <>
                    <input
                        type="text"
                        placeholder="Enter your clue"
                        value={clue}
                        onChange={(e) => setClue(e.target.value)}
                        className={styles.input}
                        disabled={!isMyTurn || (me.clues || []).length >= round}
                    />
                    <button
                        onClick={submitClue}
                        className={styles.button}
                        type="button"
                        disabled={!isMyTurn || (me.clues || []).length >= round}
                    >
                        Submit Clue
                    </button>
                </>
            ) : (
                <div style={{ color: '#f59e42', fontWeight: 700, fontSize: '1.1rem', marginBottom: 18 }}>
                    Waiting for <span style={{ color: '#6366f1' }}>{players[t].name}</span> to enter a clue...
                </div>
            )}

            <h3 className={styles.heading} style={{ fontSize: '1.2rem', margin: '1.5rem 0 0.5rem' }}>Clues so far:</h3>
            <ul className={styles.clueBox}>
                {players.map((p) => (
                    <li key={p.id} className={styles.clueItem}>
                        <span className={styles.avatar}>{p.name[0]?.toUpperCase()}</span>
                        <span className={styles.playerName}>{p.name}:</span> <span className={styles.clueText}>{p.clues.join(", ")}</span>
                    </li>
                ))}
            </ul>
            {isHost && (
                <button
                    className={styles.button}
                    style={{ marginTop: 24, background: 'linear-gradient(90deg, #f87171 0%, #fbbf24 100%)', color: '#fff', fontWeight: 700 }}
                    onClick={handleEndGame}
                    type="button"
                >
                    End Game (Host Only)
                </button>
            )}
        </div>
    );
};

export default Game;
