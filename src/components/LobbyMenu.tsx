import styles from "./Lobby.module.css";

type LobbyMenuProps = {
    onCreate: () => void;
    onJoin: () => void;
};

export default function LobbyMenu({ onCreate, onJoin }: LobbyMenuProps) {
    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>Odd One Out</h1>
            <button className={styles.button} onClick={onCreate}>Create Room</button>
            <button className={styles.button} onClick={onJoin}>Join Room</button>
        </div>
    );
}
