"use client";

import { useEffect, useRef, useState } from "react";
import type { Item } from "@/lib/types";
import { CopyButton } from "./CopyButton";

type Props = {
  item: Item;
  accession: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onDelete: () => void;
  onRedevelop: () => void;
};

function hasImage(item: Item): boolean {
  return item.kind === "image" || item.width !== null;
}

/** The projection: room darkens a stop, one slide on the wall, the registrar's card beside it. */
export function Projection({
  item,
  accession,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onClose,
  onDelete,
  onRedevelop,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setDeleteArmed(false);
    setVideoFailed(false);
  }, [item.id]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrev();
      if (event.key === "ArrowRight") onNext();
      if (event.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusables = [
          ...dialog.querySelectorAll<HTMLElement>(
            'button, a[href], input, [tabindex]:not([tabindex="-1"])',
          ),
        ];
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (!dialog.contains(active)) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && (active === first || active === dialog)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  const title = item.title ?? item.sourceUrl ?? "Untitled slide";
  const date = new Date(item.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="projection"
      role="dialog"
      aria-modal="true"
      aria-label={`Slide: ${title}`}
      ref={dialogRef}
      tabIndex={-1}
    >
      <button className="projection-close" onClick={onClose} aria-label="Close projection">
        ×
      </button>

      <figure className="projection-stage">
        {hasPrev && (
          <button className="projection-nav prev" onClick={onPrev} aria-label="Previous slide">
            ‹
          </button>
        )}
        {hasImage(item) ? (
          item.videoUrl && !videoFailed ? (
            <video
              src={item.videoUrl}
              poster={`/api/files/${item.imageFile}`}
              autoPlay
              muted
              loop
              playsInline
              controls
              onError={() => setVideoFailed(true)}
              aria-label={title}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/api/files/${item.imageFile}`} alt={title} />
          )
        ) : (
          <p className={`stage-state ${item.status === "failed" ? "failed" : ""}`}>
            {item.status === "developing" ? "Developing…" : "No capture on file"}
          </p>
        )}
        {hasNext && (
          <button className="projection-nav next" onClick={onNext} aria-label="Next slide">
            ›
          </button>
        )}
      </figure>

      <aside className="caption-card">
        {item.designType && <span className="card-tray">{item.designType}</span>}
        <h2 className="card-title">{title}</h2>
        {item.styleHint && <p className="card-hint">{item.styleHint}</p>}
        <p className="card-meta typed">
          <span>No. {String(accession).padStart(3, "0")}</span>
          <span>{date}</span>
          {item.sourceUrl && (
            <a href={item.sourceUrl} target="_blank" rel="noreferrer">
              {new URL(item.sourceUrl).hostname.replace(/^www\./, "")} ↗
            </a>
          )}
        </p>

        {item.status === "developing" && (
          <section className="card-section">
            <p className="card-description">
              The registrar is at work: capturing, classifying, and typing this
              slide&apos;s card. It will resolve on its own.
            </p>
          </section>
        )}

        {item.status === "failed" && (
          <section className="card-section">
            <h3>What went wrong</h3>
            <p className="card-error">{item.error ?? "Unknown failure."}</p>
          </section>
        )}

        {item.description && (
          <section className="card-section">
            <h3>The lecture</h3>
            <p className="card-description">{item.description}</p>
          </section>
        )}

        {item.keywords.length > 0 && (
          <section className="card-section">
            <h3>Vocabulary</h3>
            <ul className="card-keywords">
              {item.keywords.map((keyword) => (
                <li key={keyword}>{keyword}</li>
              ))}
            </ul>
          </section>
        )}

        {item.palette.length > 0 && (
          <section className="card-section">
            <h3>Palette</h3>
            <div className="card-palette">
              {item.palette.map((hex) => (
                <span className="chip" key={hex}>
                  <span className="chip-swatch" style={{ background: hex }} />
                  <span className="chip-hex">{hex}</span>
                </span>
              ))}
            </div>
          </section>
        )}

        {item.status === "ready" && (
          <div className="card-actions">
            {item.keywords.length > 0 && (
              <CopyButton
                label="Copy keywords"
                hint="style terms"
                getText={() => item.keywords.join(", ")}
              />
            )}
            {item.imagePrompt && (
              <CopyButton
                label="Copy image prompt"
                hint="hero background"
                getText={() => item.imagePrompt ?? ""}
              />
            )}
            {item.brief && (
              <CopyButton
                label="Copy build brief"
                hint="seeds a site"
                getText={() => item.brief ?? ""}
              />
            )}
          </div>
        )}

        <div className="card-footer">
          {item.status === "failed" ? (
            <button className="btn-quiet" onClick={onRedevelop}>
              Develop again
            </button>
          ) : (
            <span />
          )}
          <button
            className={`btn-quiet danger ${deleteArmed ? "armed" : ""}`}
            onClick={() => (deleteArmed ? onDelete() : setDeleteArmed(true))}
            onBlur={() => setDeleteArmed(false)}
          >
            {deleteArmed ? "Confirm discard" : "Discard slide"}
          </button>
        </div>
      </aside>
    </div>
  );
}
