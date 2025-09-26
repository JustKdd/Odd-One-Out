import type { Phase, RoomData } from "../types";
import React from "react";
import styles from "./Results.module.css";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, getCurrentUser } from "../firebase";


interface ResultsProps {
    roomData: RoomData;
    setRoomData?: React.Dispatch<React.SetStateAction<RoomData | null>>;
    setPhase?: React.Dispatch<React.SetStateAction<Phase>>;
    setRoomId?: React.Dispatch<React.SetStateAction<string>>;
}

const Results: React.FC<ResultsProps> = ({ roomData, setRoomData, setPhase, setRoomId }) => {
    const roomId = roomData.id;
    const players = roomData.players;
    const hasImposter = roomData.hasImposter;

    // Tally votes (including 'NO_IMPOSTER')
    const tally = new Map<string, number>();
    players.forEach((p) => {
        if (p.vote) tally.set(p.vote, (tally.get(p.vote) || 0) + 1);
    });

    // Find the top vote (could be player id or 'NO_IMPOSTER')
    const sorted = [...tally.entries()].sort((a, b) => b[1] - a[1]);
    const [topId] = sorted[0] || [];
    const imposter = hasImposter ? players.find((p) => p.isImposter) : null;
    const isNoImposterWinner = topId === "NO_IMPOSTER";
    const showConfetti = hasImposter && topId === imposter?.id;

    // Play again handler: resets room in Firestore
    const handlePlayAgain = async () => {
        const user = getCurrentUser();
        if (!user || !roomId || !roomData) return setPhase && setPhase("lobby");
        // Only host can reset
        if (roomData.hostId !== user.uid) return;
        const roomRef = doc(db, "rooms", roomId);
        const data = roomData;
        // Reset all player fields except id and name
        let updatedPlayers = (data.players || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            clues: [],
            word: "",
            isImposter: false,
            vote: null
        }));
        // Ensure host is present in players array
        if (!updatedPlayers.some((p) => p.id === roomData.hostId)) {
            const hostName = (players.find((p) => p.id === roomData.hostId)?.name) || "Host";
            updatedPlayers = [...updatedPlayers, { id: roomData.hostId, name: hostName, clues: [], word: "", isImposter: false, vote: null }];
        }
        await updateDoc(roomRef, {
            phase: "lobby",
            turn: 0,
            round: 1,
            players: updatedPlayers,
            hostId: roomData.hostId
        });
        if (setPhase) setPhase("lobby");
    };
    // Optionally, you can re-fetch room data here if needed

    const handleReturnToHome = async () => {
        // Remove player from the room in Firestore so other players see them leave.
        const user = getCurrentUser();
        if (user && roomId) {
            try {
                const roomRef = doc(db, "rooms", roomId);
                const updatedPlayers = (roomData.players || []).filter(p => p.id !== user.uid);
                if (updatedPlayers.length === 0) {
                    await deleteDoc(roomRef);
                } else {
                    await updateDoc(roomRef, { players: updatedPlayers });
                }
            } catch (e) {
                // ignore errors - best effort cleanup
            }
        }
        // Clear cached room id and local room state, then navigate home/menu.
        localStorage.removeItem("roomId");
        if (setRoomId) setRoomId("");
        if (setRoomData) setRoomData(null);
        if (setPhase) setPhase("lobby");
    };

    return (
        <div className={styles.container}>
            {showConfetti && (
                <div className={styles.confetti}>
                    <span>🎉🏆🎉</span>
                </div>
            )}
            <h2 className={styles.heading}>Results</h2>

            <h3 className={styles.votesTitle}>Votes</h3>
            <ul className={styles.votesList}>
                {players.map((p) => {
                    let votedFor: string | undefined;
                    if (p.vote === "NO_IMPOSTER") votedFor = "No Imposter";
                    else votedFor = players.find((x) => x.id === p.vote)?.name;
                    const isWinner = hasImposter && p.id === topId && topId === imposter?.id;
                    return (
                        <li
                            key={p.id}
                            className={styles.voteItem + (isWinner ? ' ' + styles.winner : '')}
                        >
                            <span className={styles.avatar}>
                                {p.name[0]?.toUpperCase()}
                            </span>
                            <span className={styles.voteName}>{p.name}</span>
                            <span className={styles.voteArrow}>→</span>
                            <span className={styles.voteFor + (isWinner ? ' ' + styles.winner : '')}>
                                {votedFor || <span style={{ fontStyle: 'italic', color: '#a1a1aa' }}>nobody</span>}
                            </span>
                            {isWinner && <span className={styles.trophy}>🏆</span>}
                        </li>
                    );
                })}
            </ul>

            <div className={styles.resultBox}>
                {isNoImposterWinner ? (
                    <div className={styles.resultInner}>
                        <p className={styles.resultNoImposter}>Most players voted <b>No Imposter</b>!</p>
                        {hasImposter ? (
                            <p className={styles.resultFail}>But there <b>was</b> an imposter! 😅</p>
                        ) : (
                            <p className={styles.resultSuccess}>And they were right! 🎉</p>
                        )}
                    </div>
                ) : hasImposter ? (
                    <div className={styles.resultInner}>
                        <p className={styles.resultImposter}>
                            The imposter was <span>{imposter?.name || "unknown"}</span>.
                        </p>
                        <p>
                            Players {topId === imposter?.id ? <span className={styles.resultSuccess}>caught them 🎉</span> : <span className={styles.resultFail}>failed 😅</span>}.
                        </p>
                    </div>
                ) : (
                    <div className={styles.resultInner}>
                        <p className={styles.resultNoImposter}>There was <b>no imposter</b> this time!</p>
                        <p className={styles.resultNoImposter}>Did you falsely accuse someone? 🤔</p>
                    </div>
                )}
            </div>

            {(() => {
                const user = getCurrentUser();
                if (!roomData || !user) return null;
                if (roomData.hostId === user.uid) {
                    return (
                        <button
                            onClick={handlePlayAgain}
                            className={styles.playAgainBtn}
                        >
                            Play Again
                        </button>
                    );
                } else {
                    return (
                        <div style={{ marginTop: 16, color: '#888', textAlign: 'center' }}>Waiting for host to start a new game...</div>
                    );
                }
            })()}
            <button
                onClick={handleReturnToHome}
                className={styles.returnHomeBtn}
                type="button"
            >
                Return to Home
            </button>
        </div>
    );
};

export default Results;
