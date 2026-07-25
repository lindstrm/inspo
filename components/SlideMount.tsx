"use client";

import type { Item } from "@/lib/types";

type Props = {
  item: Item;
  accession: number;
  total: number;
  justDeveloped: boolean;
  onOpen: () => void;
};

const VISIBLE_CHIPS = 2;

function captionTitle(item: Item): string {
  if (item.title) return item.title;
  if (item.sourceUrl) {
    try {
      return new URL(item.sourceUrl).hostname.replace(/^www\./, "");
    } catch {
      return item.sourceUrl;
    }
  }
  return "Untitled";
}

/** Whether the capture file exists yet: uploads always do; URL saves only after capture. */
function hasImage(item: Item): boolean {
  return item.kind === "image" || item.width !== null;
}

export function SlideMount({ item, accession, total, justDeveloped, onOpen }: Props) {
  const title = captionTitle(item);
  const stateClass =
    item.status === "developing" ? "is-developing" : item.status === "failed" ? "is-failed" : "";
  const hint =
    item.status === "developing"
      ? "developing…"
      : item.status === "failed"
        ? "failed"
        : (item.styleHint ?? "");
  const chips = item.keywords.slice(0, VISIBLE_CHIPS);
  const overflow = item.keywords.length - chips.length;

  return (
    <button
      className={`mount ${stateClass} ${justDeveloped ? "just-developed" : ""}`}
      onClick={onOpen}
      aria-label={`${title}${item.designType ? ` — ${item.designType}` : ""}${
        item.status !== "ready" ? ` (${item.status})` : ""
      }`}
    >
      <span className="mount-window">
        {item.status === "developing" && (
          <span className="developing-edge" aria-hidden="true">
            Safety film · developing
          </span>
        )}
        {item.status === "failed" && !hasImage(item) && (
          <svg className="failed-x" viewBox="0 0 44 44" aria-hidden="true">
            <path
              d="M8 7 L37 36 M36 6 L7 37"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        )}
        {item.status !== "developing" && hasImage(item) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/files/${item.imageFile}`} alt="" loading="lazy" />
        )}
      </span>

      <span className="mount-caption">
        <span className="caption-title">{title}</span>
        <span className="caption-hint">
          {item.videoUrl && item.status === "ready" ? "▸ " : ""}
          {hint}
        </span>
      </span>

      {chips.length > 0 && (
        <span className="mount-chips">
          {chips.map((keyword) => (
            <span className="chip-keyword" key={keyword}>
              {keyword}
            </span>
          ))}
          {overflow > 0 && <span className="chip-overflow">+{overflow}</span>}
        </span>
      )}

      <span className="mount-footer">
        {item.designType ? (
          <span className="footer-family">
            <span className="family-mark" aria-hidden="true">
              ◆
            </span>
            <span className="family-name">{item.designType}</span>
          </span>
        ) : (
          <span className="footer-family muted">Unfiled</span>
        )}
        <span className="footer-count">
          {String(accession).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </span>
    </button>
  );
}
