"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

const MODAL_WIDTH = 420;

type Props = {
  src: string;
  title: string;
  buttonClassName?: string;
};

export default function CallRecordingPlayer({
  src,
  title,
  buttonClassName = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const titleId = useId();

  const close = useCallback(() => {
    audioRef.current?.pause();
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const w = MODAL_WIDTH;
    const h = 200;
    setPos({
      x: Math.max(8, (window.innerWidth - w) / 2),
      y: Math.max(8, (window.innerHeight - h) / 2),
    });
  }, [open]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const maxX = window.innerWidth - MODAL_WIDTH - 8;
      const maxY = window.innerHeight - 80;
      setPos({
        x: Math.min(Math.max(8, e.clientX - dragOffset.current.x), maxX),
        y: Math.min(Math.max(8, e.clientY - dragOffset.current.y), maxY),
      });
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  function startDrag(e: React.MouseEvent) {
    e.preventDefault();
    dragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg border-2 border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 ${buttonClassName}`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <PlayIcon className="shrink-0" />
        Play recording
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/65"
            aria-label="Close recording player"
            onClick={close}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            style={{ left: pos.x, top: pos.y, width: MODAL_WIDTH }}
            className="absolute z-10 rounded-xl border-2 border-slate-300 bg-white shadow-xl dark:border-slate-600 dark:bg-slate-900"
          >
            <div
              onMouseDown={startDrag}
              className="flex cursor-grab items-center justify-between gap-2 rounded-t-[10px] border-b border-slate-200 bg-slate-50 px-3 py-2.5 active:cursor-grabbing dark:border-slate-600 dark:bg-slate-800/80"
            >
              <span id={titleId} className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate pr-2">
                Call recording — {title}
              </span>
              <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Drag to move
              </span>
            </div>
            <div className="p-4">
              <audio
                ref={audioRef}
                controls
                preload="metadata"
                src={src}
                className="h-12 w-full"
              >
                Your browser does not support the audio element.
              </audio>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Use the timeline to seek, or the controls to play, pause, and change volume.
              </p>
              <button
                type="button"
                onClick={close}
                className="mt-3 w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
