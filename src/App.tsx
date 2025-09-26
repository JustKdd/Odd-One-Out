import { useState, useEffect } from "react";
import { doc, onSnapshot, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

import Lobby from "./components/Lobby";
import Game from "./components/Game";
import Voting from "./components/Voting";
import Results from "./components/Results";
import Profile from "./components/Profile";

import type { RoomData } from "./types";

function App() {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [roomId, setRoomId] = useState(() => localStorage.getItem("roomId") || "");
  const [nickname, setNickname] = useState(() => localStorage.getItem("nickname") || "");
  const [error, setError] = useState<string | null>(null);

  // Firestore listener for room data
  useEffect(() => {
    if (!roomId) return;

    localStorage.setItem("roomId", roomId);
    const roomRef = doc(db, "rooms", roomId);

    const unsub = onSnapshot(roomRef, async (docSnap) => {
      if (!docSnap.exists()) {
        // Room deleted
        setError("This room no longer exists.");
        setRoomId("");
        setRoomData(null);
        localStorage.removeItem("roomId");
        return;
      }

      const data = docSnap.data();
      if (!data) return;

      // Keep the full Firestore document as the single source of truth.
      const parsed = {
        ...(data as any),
        id: roomId,
        hasImposter: data.hasImposter ?? false,
      } as RoomData;

      // If room has no players, delete it
      if (!parsed.players || parsed.players.length === 0) {
        await deleteDoc(roomRef);
        unsub(); // stop listening immediately
        setRoomId("");
        setRoomData(null);
        localStorage.removeItem("roomId");
        return;
      }

      setRoomData(parsed);
      setError(null); // clear any stale errors
    });

    return () => unsub();
  }, [roomId]);

  // Handle nickname setup
  const handleProfileSet = (name: string) => {
    const cleanName = name.trim();
    if (!cleanName) return; // prevent empty names
    setNickname(cleanName);
    localStorage.setItem("nickname", cleanName);
  };

  // Helper to render the current phase
  const renderPhase = () => {
    if (!roomData) return <Lobby roomData={roomData} nickname={nickname} setRoomId={setRoomId} />;


    switch (roomData.phase || 'lobby') {
      case "lobby":
        return <Lobby roomData={roomData} nickname={nickname} setRoomId={setRoomId} />;
      case "game":
        return <Game roomData={roomData} setRoomData={setRoomData} />;
      case "voting":
        return <Voting roomData={roomData} setRoomData={setRoomData} />;
      case "results":
        return <Results roomData={roomData} setRoomData={setRoomData} setRoomId={setRoomId} />;
      default:
        return null;
    }
  };

  // Show profile setup first
  if (!nickname) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <Profile onProfileSet={handleProfileSet} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      {error ? (
        <div className="text-center text-red-600 bg-white p-4 rounded shadow">
          <p className="mb-2">{error}</p>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      ) : (
        renderPhase()
      )}
    </div>
  );
}

export default App;
