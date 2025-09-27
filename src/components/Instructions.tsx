// src/components/Instructions.tsx
export default function Instructions() {
    return (

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

    );

}
