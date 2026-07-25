/*
DIRECTION CONTRACT — The Slide Library
THESIS: A slide library, not a pinboard: saved design as luminous mounted
slides on a dark light table. Refuses the masonry grid with hover-overlay
metadata the category always ships.
OWN-WORLD: Room-black ground; bone cardboard mounts with typed Courier
captions; Franklin caps chrome; Kodachrome red as the only accent; safelight
amber exclusively for developing; depth is backlight, never drop shadow.
STORY: The owner pastes a URL or drops a screenshot; an amber slide develops
into a typed, labeled mount; they browse trays, project a slide, and copy its
vocabulary — keywords, image prompt, build brief — into a model.
FIRST VIEWPORT: Slim charcoal bar (wordmark left, capture input right), tray
tabs beneath, then the dense strict grid of mounted slides edge to edge. Empty
state: one dashed mount inviting the first save.
FORM: Slide-library lightbox; grounded candidate 5 of 7 (assigned); staging:
light-table wall with floating capture bar; seed key 88a3793f.
*/
import { Gallery } from "@/components/Gallery";
import * as repo from "@/lib/items-repo";

export const dynamic = "force-dynamic";

export default function Home() {
  const items = repo.findAll();
  return <Gallery initialItems={items} />;
}
