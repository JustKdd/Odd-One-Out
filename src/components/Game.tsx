import { useState, useEffect } from "react";
import { doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { Player, Phase } from "../types";
import styles from "./Game.module.css";
import { getCurrentUser } from "../firebase";

type GameProps = {
    players: Player[];
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
    round: number;
    setRound: React.Dispatch<React.SetStateAction<number>>;
    setPhase: React.Dispatch<React.SetStateAction<Phase>>;
    theme: string;
    themeLang: string;
};

export default function Game({ players, setPlayers, round, setRound, setPhase, theme, themeLang, turn }: GameProps & { turn: number }) {
    const [clue, setClue] = useState("");
    const roomId = localStorage.getItem("roomId") || "";
    const [isHost, setIsHost] = useState(false);

    // Find the current user
    const user = getCurrentUser();
    const me = players.find((p) => user && p.id === user.uid);

    // Check if current user is host
    useEffect(() => {
        const checkHost = async () => {
            if (!roomId || !user) return;
            const roomRef = doc(db, "rooms", roomId);
            const snap = await getDoc(roomRef);
            const data = snap.data();
            setIsHost(!!(data && data.hostId === user.uid));
        };
        checkHost();
    }, [roomId, user]);
    // End game handler for host
    const handleEndGame = async () => {
        if (!roomId) return;
        try {
            await deleteDoc(doc(db, "rooms", roomId));
        } catch (e) { /* ignore */ }
        localStorage.removeItem("roomId");
        // Reset all relevant state in parent (lobby)
        setPlayers([]);
        setRound(1);
        setPhase("lobby");
        // Optionally, reset theme, host, etc. if needed
    };

    // ...existing code...
    const submitClue = async () => {
        if (!clue.trim()) return;
        // Prevent submitting more than one clue per round
        if (me && me.clues.length >= round) return;

        const updated = [...players];
        updated[turn].clues.push(clue);
        // Do not update local state, rely on Firestore/parent to sync
        setClue("");

        let newTurn = turn + 1;
        let newRound = round;
        let phase = "game";
        if (newTurn < players.length) {
            // next player's turn
        } else {
            if (round < 3) {
                newRound = round + 1;
                newTurn = 0;
            } else {
                setPhase("voting");
                phase = "voting";
            }
        }
        // Update Firestore so all players see the new clues and turn
        if (roomId) {
            const roomRef = doc(db, "rooms", roomId);
            await updateDoc(roomRef, {
                players: updated,
                turn: newTurn,
                round: newRound,
                phase: phase
            });
        }
    };

    const isMyTurn = me && players[turn].id === me.id;
    return (
        <div className={styles.container}>
            <div className={styles.round}>Round {round}/3</div>
            <div className={styles.currentPlayer}>Current Player: <b>{players[turn].name}</b></div>
            <div className={styles.themeNote} style={{ marginBottom: 12 }}>
                Theme: <b>{theme}</b> | Language: <b>{themeLang} </b>
            </div>

            {/* Show the word or imposter message */}
            {me && me.isImposter ? (
                <div style={{ color: 'red', fontWeight: 700, fontSize: '1.2rem', marginBottom: 16 }}>
                    You are the imposter!
                </div>
            ) : me && typeof me.word === 'string' && me.word.trim() ? (
                <div style={{ color: '#059669', fontWeight: 700, fontSize: '1.2rem', marginBottom: 16 }}>
                    Your word: <span style={{ color: '#0ea5e9' }}>{me.word}</span>
                </div>
            ) : null}

            {isMyTurn && me && me.clues.length < round ? (
                <>
                    <input
                        type="text"
                        placeholder="Enter your clue"
                        value={clue}
                        onChange={(e) => setClue(e.target.value)}
                        className={styles.input}
                        disabled={!isMyTurn || me.clues.length >= round}
                    />
                    <button
                        onClick={submitClue}
                        className={styles.button}
                        type="button"
                        disabled={!isMyTurn || me.clues.length >= round}
                    >
                        Submit Clue
                    </button>
                </>
            ) : (
                <div style={{ color: '#f59e42', fontWeight: 700, fontSize: '1.1rem', marginBottom: 18 }}>
                    Waiting for <span style={{ color: '#6366f1' }}>{players[turn].name}</span> to enter a clue...
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
}
