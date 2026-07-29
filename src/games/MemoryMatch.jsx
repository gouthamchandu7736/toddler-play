import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Sparkles from "../components/Sparkles.jsx";
import GameShell from "../ui/GameShell.jsx";
import { ANIMALS, FRUITS } from "../data/scenes.js";
import { playSfx, speak, stopSpeech, vibrate } from "../audio/audioManager.js";

/**
 * Turn over cards, find the pairs.
 *
 * Three pairs, not six or eight. A 3-year-old's working memory holds roughly
 * three items; a full 4x4 board is not a harder version of this game, it is an
 * unplayable one. When the board is cleared it simply deals a new one.
 *
 * Nothing is ever taken away for a wrong pair — the two cards turn back over
 * after a beat, and that is the entire penalty. No moves counter, no timer,
 * no stars-out-of-three.
 */

const PAIRS = 3;

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function deal() {
  // Draw from two different sets so the pictures on a board are easy to tell
  // apart — six similar animals would make it a discrimination test.
  const pool = shuffle([...ANIMALS, ...FRUITS]).slice(0, PAIRS);
  const cards = shuffle(
    pool.flatMap((item, i) => [
      { key: `${item.id}-a`, pairId: item.id, item, slot: i },
      { key: `${item.id}-b`, pairId: item.id, item, slot: i },
    ]),
  );
  return { id: Math.random().toString(36).slice(2), cards };
}

export default function MemoryMatch({ onHome }) {
  const [board, setBoard] = useState(deal);
  const [flipped, setFlipped] = useState([]); // keys currently face-up
  const [matched, setMatched] = useState([]); // pairIds already found
  const [busy, setBusy] = useState(false);

  const timers = useRef([]);
  const after = useCallback((ms, fn) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      stopSpeech();
    };
  }, []);

  const flip = (card) => {
    if (busy) return;
    if (flipped.includes(card.key)) return;
    if (matched.includes(card.pairId)) return;

    playSfx("pop");
    vibrate(20);
    speak(card.item.label);

    const next = [...flipped, card.key];
    setFlipped(next);

    if (next.length < 2) return;

    const [aKey, bKey] = next;
    const a = board.cards.find((c) => c.key === aKey);
    const b = board.cards.find((c) => c.key === bKey);

    setBusy(true);

    if (a.pairId === b.pairId) {
      const found = [...matched, a.pairId];
      after(420, () => {
        playSfx("chime");
        setMatched(found);
        setFlipped([]);
        setBusy(false);

        if (found.length === PAIRS) {
          after(300, () => {
            playSfx("celebrate");
            speak("You found them all!");
          });
          // Deal a fresh board rather than showing a "you win" screen with a
          // button — she should land back in the game, still playing.
          after(2400, () => {
            setBoard(deal());
            setMatched([]);
            setFlipped([]);
          });
        }
      });
    } else {
      // Turn back over. No sound of failure — just a quiet return.
      after(1100, () => {
        setFlipped([]);
        setBusy(false);
      });
    }
  };

  const allDone = matched.length === PAIRS;

  return (
    <GameShell title="Match" tone="think" onHome={onHome}>
      <div className="mm-board" key={board.id}>
        {board.cards.map((card, i) => {
          const isUp = flipped.includes(card.key) || matched.includes(card.pairId);
          const isMatched = matched.includes(card.pairId);
          return (
            <motion.button
              key={card.key}
              type="button"
              className={`mm-card tappable${isMatched ? " is-matched" : ""}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              onPointerDown={() => flip(card)}
              onClick={(e) => e.preventDefault()}
              aria-label={isUp ? card.item.label : "Hidden card"}
            >
              {/* Both faces are always rendered; the 3D flip swaps which one
                  faces the viewer. Cheaper and smoother than swapping DOM. */}
              <motion.span
                className="mm-inner"
                animate={{ rotateY: isUp ? 180 : 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="mm-face mm-back">
                  <span className="mm-back-mark">?</span>
                </span>
                <span
                  className="mm-face mm-front"
                  style={{ "--tile-color": card.item.color }}
                >
                  {card.item.emoji}
                </span>
              </motion.span>

              {isMatched && <Sparkles count={8} distance={70} />}
            </motion.button>
          );
        })}
      </div>

      {allDone && (
        <div className="mm-cheer" aria-live="polite">
          <Sparkles count={18} distance={200} />
        </div>
      )}
    </GameShell>
  );
}
