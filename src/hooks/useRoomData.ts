import { useState, useEffect, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export function useRoomData(roomId: string | null) {
    const [roomData, setRoomData] = useState<any>(null);
    const fetchRoom = useCallback(async () => {
        if (!roomId) return;
        const roomRef = doc(db, "rooms", roomId);
        const snap = await getDoc(roomRef);
        if (snap.exists()) setRoomData(snap.data());
    }, [roomId]);

    useEffect(() => { fetchRoom(); }, [fetchRoom]);

    return { roomData, fetchRoom };
}
