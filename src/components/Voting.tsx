
import type { RoomData } from "../types";
import styles from "./Voting.module.css";
import { doc, updateDoc } from "firebase/firestore";
import { db, getCurrentUser, auth } from "../firebase";
import React, { useEffect, useRef } from "react";

interface VotingProps {
    roomData: RoomData;
    setRoomData?: React.Dispatch<React.SetStateAction<RoomData | null>>;
}

const Voting: React.FC<VotingProps> = ({ roomData, setRoomData }) => {
    let user = getCurrentUser();
    if (!user && (auth as any)?.currentUser) {
        user = { uid: (auth as any).currentUser.uid };
    }
    const roomId = roomData.id;
    const players = roomData.players;
    const me = players.find((p) => user && p.id === user.uid);

    // Only allow voting if not all have voted
    const allVoted = players.every((p) => !!p.vote);
    const isHost = !!(user && roomData.hostId === user.uid);

    // Only allow changing vote before all have voted
    const castVote = async (suspectId: string) => {
        if (!me || !roomId) return;
        const updated = players.map((p) =>
            p.id === me.id ? { ...p, vote: suspectId } : p
        );
        // Optionally update parent state if setRoomData is provided
        if (typeof setRoomData === 'function') {
            setRoomData({ ...roomData, players: updated });
        }
        // Write to Firestore
        const roomRef = doc(db, "rooms", roomId);
        await updateDoc(roomRef, { players: updated });
    };

    const revealResults = async () => {
        if (!roomId) return;
        const roomRef = doc(db, "rooms", roomId);
        // optimistic local update
        if (typeof setRoomData === 'function') {
            setRoomData({ ...roomData, phase: 'results' });
        }
        await updateDoc(roomRef, { phase: 'results' });
    };

    // Auto-reveal for host when everyone has voted
    const revealedRef = useRef(false);
    useEffect(() => {
        if (allVoted && isHost && !revealedRef.current && roomData.phase !== 'results') {
            revealedRef.current = true;
            // call but don't await (UI optimistic update handled in revealResults)
            revealResults();
        }
    }, [allVoted, isHost, roomData.phase]);

    return (
        <div className={styles.container} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            <h2 className={styles.heading}>Vote for who you think is the imposter</h2>
            <div className={styles.voteBox} style={{ display: "flex", justifyContent: 'space-around', }}>
                <div className={styles.suspectBtns}>
                    {players
                        .filter((p) => p.id !== me?.id)
                        .map((suspect) => (
                            <button
                                key={suspect.id}
                                onClick={() => !allVoted && castVote(suspect.id)}
                                className={styles.suspectBtn + (me?.vote === suspect.id ? ' ' + styles.selected : '')}
                                type="button"
                                disabled={allVoted}
                            >
                                {suspect.name}
                            </button>
                        ))}
                    <button
                        onClick={() => !allVoted && castVote("NO_IMPOSTER")}
                        className={styles.suspectBtn + (me?.vote === "NO_IMPOSTER" ? ' ' + styles.selected : '')}
                        type="button"
                        disabled={allVoted}
                    >
                        No Imposter
                    </button>
                </div>
            </div>
            {allVoted && (
                isHost ? (
                    <button
                        onClick={revealResults}
                        className={styles.revealBtn}
                        type="button"
                    >
                        Reveal Results
                    </button>
                ) : (
                    <div style={{ marginTop: 12, color: '#888', textAlign: 'center' }}>All players voted — waiting for host to reveal results</div>
                )
            )}
        </div>
    );
};

export default Voting;
