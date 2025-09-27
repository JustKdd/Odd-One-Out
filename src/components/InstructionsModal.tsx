import { X } from "lucide-react";
import "./Instructions.css"; // Import CSS file

interface InstructionsProps {
    onClose: () => void;
}

export default function InstructionsModal({ onClose }: InstructionsProps) {
    return (
        <div className="instructions-overlay">
            <div className="instructions-modal">
                <div className="instructions-header">
                    <h1>Game Instructions</h1>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="instructions-content">
                    <h2>How to Play</h2>
                    <ol>
                        <li>Everyone joins a room. All players (except one) get the same secret word.</li>
                        <li>One player is the <strong>Imposter</strong> — they don’t know the word.</li>
                        <li>Players take turns giving clues about the word (but not too obvious!).</li>
                        <li>After a few rounds, everyone votes on who they think the Imposter is.</li>
                        <li>
                            If the group finds the Imposter → <strong>group wins</strong>.
                            If the Imposter survives or guesses the word → <strong>Imposter wins</strong>.
                        </li>
                    </ol>
                    <p className="tip">
                        💡 Tip: Balance your clues — too vague and you’ll look suspicious, too specific and the Imposter may guess the word!
                    </p>
                </div>
            </div>
        </div>
    );
}
