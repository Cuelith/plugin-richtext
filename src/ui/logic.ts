import {
  OUTLINE_PRESETS,
  SHADOW_PRESETS,
  TEXT_FONTS_WITH_ITALIC,
  cleanSpans,
  outlinePresetOf,
  shadowPresetOf,
  type OutlinePreset,
  type RichSession,
  type ShadowPreset,
  type StateDocument,
} from "@cuelith/protocol";

/** Cosa mostra la barra, ricavato dallo stato: solo logica, niente interfaccia. */
export interface BarView {
  /** C'e' un testo in modifica che accetta parole formattate. */
  readonly active: boolean;
  /** C'e' un tratto selezionato. */
  readonly hasSelection: boolean;
  /** Quanti caratteri sono selezionati. */
  readonly selected: number;
  /** Il carattere ha un corsivo vero. */
  readonly canItalic: boolean;
  /** Tutto il tratto selezionato e' in grassetto / in corsivo. */
  readonly bold: boolean;
  readonly italic: boolean;
  /** Dimensione all'inizio del tratto (multiplo dello stile). */
  readonly size: number;
  /** Bordo e ombra all'inizio del tratto ("none" = nessuno). */
  readonly outline: OutlinePreset | "none";
  readonly shadow: ShadowPreset | "none";
}

interface LookStyle {
  text?: { font?: unknown };
  globalText?: { text?: { font?: unknown } };
}

/**
 * Il carattere con cui e' mostrato il testo: quello dichiarato da chi scrive, altrimenti quello
 * dello stile del look a tutto schermo (cosi' si sa se il corsivo esiste davvero).
 */
function fontOf(state: StateDocument, session: RichSession): string | undefined {
  if (session.font !== undefined) return session.font;
  for (const look of Object.values(state.show.looks)) {
    if (look.template !== "core.fullscreen") continue;
    const style = look.style as LookStyle;
    const font = style.globalText?.text?.font ?? style.text?.font;
    if (typeof font === "string") return font;
  }
  return undefined;
}

export function viewOf(state: StateDocument): BarView {
  const session = state.live.richText;
  if (session === undefined) {
    return {
      active: false,
      hasSelection: false,
      selected: 0,
      canItalic: true,
      bold: false,
      italic: false,
      size: 1,
      outline: "none",
      shadow: "none",
    };
  }
  const { start, end } = session.selection;
  const selected = Math.max(0, end - start);
  const spans = cleanSpans(session.text, session.spans);
  const covered = (key: "bold" | "italic"): boolean => {
    if (selected === 0) return false;
    for (let index = start; index < end; index += 1) {
      if (!spans.some((span) => span[key] === true && span.start <= index && index < span.end)) {
        return false;
      }
    }
    return true;
  };
  const here = spans.find((span) => span.start <= start && start < span.end);
  const font = fontOf(state, session);
  return {
    active: true,
    hasSelection: selected > 0,
    selected,
    canItalic: font === undefined || TEXT_FONTS_WITH_ITALIC.includes(font),
    bold: covered("bold"),
    italic: covered("italic"),
    size: here?.size ?? 1,
    outline: outlinePresetOf(here?.outline) ?? "none",
    shadow: shadowPresetOf(here?.shadow) ?? "none",
  };
}

export const OUTLINES = Object.keys(OUTLINE_PRESETS) as OutlinePreset[];
export const SHADOWS = Object.keys(SHADOW_PRESETS) as ShadowPreset[];

/** Dimensioni offerte: multipli di quella dello stile. */
export const SIZES = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3] as const;
