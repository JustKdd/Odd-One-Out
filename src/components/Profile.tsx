import { useState } from "react";

interface ProfileProps {
    onProfileSet: (nickname: string) => void;
}

export default function Profile({ onProfileSet }: ProfileProps) {
    const [nickname, setNickname] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nickname.trim()) {
            setError("Please enter a nickname");
            return;
        }
        setError("");
        onProfileSet(nickname.trim());
    };

    return (
        <form onSubmit={handleSubmit} style={{
            background: "#fff",
            borderRadius: "1.5rem",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.12)",
            padding: "2.5rem",
            minWidth: 320,
            maxWidth: 400,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
        }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 24, color: "#1e293b" }}>Create Profile</h1>
            <input
                type="text"
                placeholder="Enter your nickname"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                style={{
                    width: "100%",
                    border: "1.5px solid #cbd5e1",
                    borderRadius: ".7rem",
                    padding: ".7rem 1rem",
                    fontSize: "1rem",
                    marginBottom: 12
                }}
            />
            <button
                type="submit"
                style={{
                    width: "100%",
                    background: "linear-gradient(90deg, #3b82f6 0%, #a78bfa 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: ".9rem",
                    padding: ".9rem",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    boxShadow: "0 4px 16px #c7d2fe",
                    cursor: "pointer",
                    marginBottom: 8
                }}
            >
                Continue
            </button>
            {error && <div style={{ color: "#dc2626", fontSize: ".95rem" }}>{error}</div>}
        </form>
    );
}
