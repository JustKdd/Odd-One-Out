
import type { Player, Phase } from "../types";
import styles from "./Voting.module.css";
import { doc, updateDoc } from "firebase/firestore";
import { db, getCurrentUser } from "../firebase";

type VotingProps = {
    players: Player[];
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
    setPhase: React.Dispatch<React.SetStateAction<Phase>>;
};

export default function Voting({ players, setPlayers, setPhase }: VotingProps) {
    const user = getCurrentUser();
    const roomId = localStorage.getItem("roomId") || "";
    const me = players.find((p) => user && p.id === user.uid);

    // Only allow voting if not all have voted
    const allVoted = players.every((p) => p.vote);

    // Only allow changing vote before all have voted
    const castVote = async (suspectId: string) => {
        if (!me || !roomId) return;
        const updated = players.map((p) =>
            p.id === me.id ? { ...p, vote: suspectId } : p
        );
        setPlayers(updated); // Optimistic update
        // Write to Firestore
        const roomRef = doc(db, "rooms", roomId);
        await updateDoc(roomRef, { players: updated });
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>Vote for who you think is the imposter</h2>
            <div className={styles.voteBox}>
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
                <button
                    onClick={() => setPhase("results")}
                    className={styles.revealBtn}
                    type="button"
                >
                    Reveal Results
                </button>
            )}
        </div>
    );
}
