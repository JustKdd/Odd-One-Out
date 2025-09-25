
import { useState, useEffect } from "react";
import { doc, onSnapshot, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { Player, Phase } from "./types";
import Lobby from "./components/Lobby";
import Game from "./components/Game";
import Voting from "./components/Voting";
import Results from "./components/Results";
import Profile from "./components/Profile";



function App() {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [players, setPlayers] = useState<Player[]>([]);
  const [hasImposter, setHasImposter] = useState<boolean>(false);
  const [round, setRound] = useState<number>(1);
  const [turn, setTurn] = useState<number>(0);
  const [nickname, setNickname] = useState(() => localStorage.getItem("nickname") || "");
  const [theme, setTheme] = useState<string>("");
  const [themeLang, setThemeLang] = useState<string>("");
  const [roomId, setRoomId] = useState(() => localStorage.getItem("roomId") || "");

  // Firestore listener for all phases
  useEffect(() => {
    if (!roomId) return;
    localStorage.setItem("roomId", roomId);
    const roomRef = doc(db, "rooms", roomId);
    const unsub = onSnapshot(roomRef, async (docSnap) => {
      const data = docSnap.data();
      if (data && data.players) {
        setPlayers(data.players);
        if (data.phase) setPhase(data.phase);
        if (typeof data.hasImposter === "boolean") setHasImposter(data.hasImposter);
        if (typeof data.theme === "string") setTheme(data.theme);
        if (typeof data.themeLang === "string") setThemeLang(data.themeLang);
        if (typeof data.turn === "number") setTurn(data.turn);
        if (typeof data.round === "number") setRound(data.round);
        // If the room is empty, delete it
        if (data.players.length === 0) {
          await deleteDoc(roomRef);
          localStorage.removeItem("roomId");
        }
      } else {
        // Room deleted or not found
        setRoomId("");
        localStorage.removeItem("roomId");
        setPhase("lobby");
      }
    });
    return () => unsub();
  }, [roomId]);

  const handleProfileSet = (name: string) => {
    setNickname(name);
    localStorage.setItem("nickname", name);
  };

  if (!nickname) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <Profile onProfileSet={handleProfileSet} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      {phase === "lobby" && (
        <Lobby
          players={players}
          setPlayers={setPlayers}
          setTheme={setTheme}
          setHasImposter={setHasImposter}
          setPhase={setPhase}
          setThemeLang={setThemeLang}
          nickname={nickname}
          setTurn={setTurn}
          setRound={setRound}
          theme={theme}
          lang={themeLang}
        />
      )}
      {phase === "game" && (
        <Game
          players={players}
          setPlayers={setPlayers}
          round={round}
          setRound={setRound}
          setPhase={setPhase}
          theme={theme}
          themeLang={themeLang}
          turn={turn}
        />
      )}
      {phase === "voting" && (
        <Voting players={players} setPlayers={setPlayers} setPhase={setPhase} />
      )}
      {phase === "results" && (
        <Results
          players={players}
          hasImposter={hasImposter}
          setPhase={setPhase}
        />
      )}
    </div>
  );
}

export default App;
