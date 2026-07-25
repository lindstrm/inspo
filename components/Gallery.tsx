"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Item } from "@/lib/types";
import { CaptureBar } from "./CaptureBar";
import { EmptyTable } from "./EmptyTable";
import { Projection } from "./Projection";
import { SlideMount } from "./SlideMount";
import { TrayTabs } from "./TrayTabs";

const POLL_MS = 2500;
const DEVELOP_ANIM_MS = 1400;
const URL_LIKE = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i;

type ApiEnvelope<T> = { ok: boolean; data?: T; error?: string };

async function api<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const body = (await response.json()) as ApiEnvelope<T>;
  if (!body.ok || body.data === undefined) {
    throw new Error(body.error ?? `Request failed (${response.status})`);
  }
  return body.data;
}

export function Gallery({ initialItems }: { initialItems: readonly Item[] }) {
  const [items, setItems] = useState<readonly Item[]>(initialItems);
  const [filter, setFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [justDeveloped, setJustDeveloped] = useState<ReadonlySet<string>>(new Set());
  const statusRef = useRef<ReadonlyMap<string, Item["status"]>>(
    new Map(initialItems.map((i) => [i.id, i.status])),
  );

  const refresh = useCallback(async () => {
    try {
      const fresh = await api<readonly Item[]>("/api/items");
      const previous = statusRef.current;
      const resolved = fresh
        .filter((i) => i.status === "ready" && previous.get(i.id) === "developing")
        .map((i) => i.id);
      statusRef.current = new Map(fresh.map((i) => [i.id, i.status]));
      setItems(fresh);
      if (resolved.length > 0) {
        setJustDeveloped((prev) => new Set([...prev, ...resolved]));
        setTimeout(() => {
          setJustDeveloped((prev) => new Set([...prev].filter((id) => !resolved.includes(id))));
        }, DEVELOP_ANIM_MS);
      }
    } catch {
      /* transient poll failure — the next tick retries */
    }
  }, []);

  const developingCount = items.filter((i) => i.status === "developing").length;

  useEffect(() => {
    if (developingCount === 0) return;
    const timer = setInterval(refresh, POLL_MS);
    return () => clearInterval(timer);
  }, [developingCount, refresh]);

  const addItem = useCallback((item: Item) => {
    statusRef.current = new Map([...statusRef.current, [item.id, item.status]]);
    setItems((prev) => [item, ...prev]);
  }, []);

  const saveUrl = useCallback(
    async (url: string): Promise<boolean> => {
      setSaveError(null);
      setBusy(true);
      try {
        addItem(await api<Item>("/api/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        }));
        return true;
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Save failed");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [addItem],
  );

  const uploadFiles = useCallback(
    async (files: readonly File[]) => {
      setSaveError(null);
      setBusy(true);
      try {
        for (const file of files) {
          const form = new FormData();
          form.append("file", file);
          addItem(await api<Item>("/api/items", { method: "POST", body: form }));
        }
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Upload failed");
      } finally {
        setBusy(false);
      }
    },
    [addItem],
  );

  /* The projection lives in the URL (?slide=id): browser Back closes it,
     and a slide link survives refresh. */
  const openSlide = useCallback((id: string) => {
    setSelectedId(id);
    window.history.pushState({ slideModal: true }, "", `?slide=${id}`);
  }, []);

  const showSlide = useCallback((id: string) => {
    setSelectedId(id);
    window.history.replaceState(
      { slideModal: window.history.state?.slideModal ?? false },
      "",
      `?slide=${id}`,
    );
  }, []);

  const closeProjection = useCallback(() => {
    if (window.history.state?.slideModal) {
      window.history.back();
    } else {
      window.history.replaceState(null, "", window.location.pathname);
      setSelectedId(null);
    }
  }, []);

  useEffect(() => {
    const readSlideParam = () =>
      new URL(window.location.href).searchParams.get("slide");
    const onPop = () => setSelectedId(readSlideParam());
    window.addEventListener("popstate", onPop);
    const initial = readSlideParam();
    if (initial) setSelectedId(initial);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const deleteItem = useCallback(
    async (id: string) => {
      try {
        await api<{ id: string }>(`/api/items/${id}`, { method: "DELETE" });
        setItems((prev) => prev.filter((i) => i.id !== id));
        closeProjection();
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Delete failed");
      }
    },
    [closeProjection],
  );

  const redevelopItem = useCallback(async (id: string) => {
    try {
      const updated = await api<Item>(`/api/items/${id}/redevelop`, { method: "POST" });
      statusRef.current = new Map([...statusRef.current, [id, updated.status]]);
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Retry failed");
    }
  }, []);

  /* Paste anywhere: an image develops, a URL exposes. Inside inputs, paste stays paste. */
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      const files = [...(event.clipboardData?.files ?? [])].filter((f) => f.type.startsWith("image/"));
      if (files.length > 0) {
        event.preventDefault();
        void uploadFiles(files);
        return;
      }
      const text = event.clipboardData?.getData("text")?.trim() ?? "";
      if (URL_LIKE.test(text)) {
        event.preventDefault();
        void saveUrl(text);
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [saveUrl, uploadFiles]);

  /* The whole room is a drop target. */
  useEffect(() => {
    let depth = 0;
    const hasFiles = (e: DragEvent) => [...(e.dataTransfer?.types ?? [])].includes("Files");
    const onEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth += 1;
      setDragActive(true);
    };
    const onLeave = () => {
      depth = Math.max(0, depth - 1);
      if (depth === 0) setDragActive(false);
    };
    const onOver = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    };
    const onDrop = (e: DragEvent) => {
      depth = 0;
      setDragActive(false);
      if (!hasFiles(e)) return;
      e.preventDefault();
      const files = [...(e.dataTransfer?.files ?? [])].filter((f) => f.type.startsWith("image/"));
      if (files.length > 0) void uploadFiles(files);
    };
    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("dragover", onOver);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onEnter);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("drop", onDrop);
    };
  }, [uploadFiles]);

  const trays = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      if (item.status === "ready" && item.designType) {
        counts.set(item.designType, (counts.get(item.designType) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [items]);

  const visible = useMemo(
    () => (filter === null ? items : items.filter((i) => i.designType === filter)),
    [items, filter],
  );

  /* Accession numbers: 001 is the first slide ever saved; items arrive newest-first. */
  const accessions = useMemo(
    () => new Map(items.map((item, index) => [item.id, items.length - index])),
    [items],
  );

  const selectedIndex = visible.findIndex((i) => i.id === selectedId);
  const selected = selectedIndex >= 0 ? visible[selectedIndex] : null;

  return (
    <main>
      <header className="bar">
        <div className="wordmark">
          <span className="wordmark-name">
            Inspo<span className="stamp">zone</span>
          </span>
          <span className="wordmark-count typed">
            {items.length} {items.length === 1 ? "slide" : "slides"} · {trays.length}{" "}
            {trays.length === 1 ? "tray" : "trays"}
          </span>
        </div>
        <CaptureBar onSaveUrl={saveUrl} onUploadFiles={uploadFiles} busy={busy} />
      </header>

      {saveError && (
        <p className="save-error" role="alert">
          {saveError}
        </p>
      )}

      {items.length === 0 ? (
        <EmptyTable />
      ) : (
        <>
          <TrayTabs trays={trays} total={items.length} active={filter} onSelect={setFilter} />
          <section className="table" aria-label="Slide library">
            {visible.map((item) => (
              <SlideMount
                key={item.id}
                item={item}
                accession={accessions.get(item.id) ?? 0}
                total={items.length}
                justDeveloped={justDeveloped.has(item.id)}
                onOpen={() => openSlide(item.id)}
              />
            ))}
          </section>
        </>
      )}

      {dragActive && <div className="drop-veil">Drop to expose</div>}

      {selected && (
        <Projection
          item={selected}
          accession={accessions.get(selected.id) ?? 0}
          hasPrev={selectedIndex > 0}
          hasNext={selectedIndex < visible.length - 1}
          onPrev={() => selectedIndex > 0 && showSlide(visible[selectedIndex - 1].id)}
          onNext={() =>
            selectedIndex < visible.length - 1 && showSlide(visible[selectedIndex + 1].id)
          }
          onClose={closeProjection}
          onDelete={() => void deleteItem(selected.id)}
          onRedevelop={() => void redevelopItem(selected.id)}
        />
      )}
    </main>
  );
}
