import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useQuery } from "@tanstack/react-query";

export function useRoomData(roomId: string | null) {
    const query = useQuery({
        queryKey: ["roomData", roomId],
        queryFn: async () => {
            if (!roomId) return null;
            const roomRef = doc(db, "rooms", roomId);
            const snap = await getDoc(roomRef);
            return snap.exists() ? snap.data() : null;
        },
        enabled: !!roomId
    });
    return {
        roomData: query.data,
        fetchRoom: query.refetch,
        isLoading: query.isLoading,
        error: query.error
    };
}
