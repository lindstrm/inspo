export type ItemKind = "url" | "image";
export type ItemStatus = "developing" | "ready" | "failed";

/** One saved slide: the capture plus the vocabulary the analysis produced. */
export type Item = Readonly<{
  id: string;
  kind: ItemKind;
  sourceUrl: string | null;
  imageFile: string;
  videoUrl: string | null;
  width: number | null;
  height: number | null;
  status: ItemStatus;
  error: string | null;
  designType: string | null;
  styleHint: string | null;
  title: string | null;
  keywords: readonly string[];
  description: string | null;
  palette: readonly string[];
  imagePrompt: string | null;
  brief: string | null;
  createdAt: string;
}>;

/** What the vision analysis must return for one slide. */
export type Analysis = Readonly<{
  designType: string;
  styleHint: string;
  title: string;
  keywords: readonly string[];
  description: string;
  palette: readonly string[];
  imagePrompt: string;
  brief: string;
}>;
