import styles from "./Lobby.module.css";

type LobbyJoinProps = {
    username: string;
    setUsername: (name: string) => void;
    roomId: string;
    setRoomId: (id: string) => void;
    onJoin: () => void;
    onBack: () => void;
    error: string;
};

export default function LobbyJoin({ username, setUsername, roomId, setRoomId, onJoin, onBack, error }: LobbyJoinProps) {
    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>Join Room</h1>
            <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className={styles.input}
            />
            <input
                type="text"
                placeholder="Enter room code"
                value={roomId}
                onChange={e => setRoomId(e.target.value)}
                className={styles.input}
            />
            <button className={styles.button} onClick={onJoin}>Join</button>
            {error && <p className={styles.requireNote}>{error}</p>}
            <button className={styles.button} onClick={onBack}>Back</button>
        </div>
    );
}
