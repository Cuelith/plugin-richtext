import { connectPanel, PanelCallError } from "@cuelith/panel";
import {
  OUTLINE_PRESETS,
  SHADOW_PRESETS,
  type OutlinePreset,
  type RichChange,
  type ShadowPreset,
} from "@cuelith/protocol";
import { OUTLINES, SHADOWS, SIZES, viewOf } from "./logic.js";

// Pannello del plugin Formattazione: legge dallo stato il testo che un editor sta modificando
// (`live.richText`) e, quando si preme un pulsante, chiede al motore la modifica sul tratto
// selezionato (`richtext.apply`). Il testo lo scrive sempre e solo l'editor.

const element = (id: string): HTMLElement => {
  const found = document.getElementById(id);
  if (found === null) throw new Error(`manca #${id}`);
  return found;
};

const panel = await connectPanel();
const status = element("status");
const size = element("size") as HTMLSelectElement;
const bold = element("bold") as HTMLButtonElement;
const italic = element("italic") as HTMLButtonElement;
const color = element("color") as HTMLInputElement;
const clear = element("clear") as HTMLButtonElement;
const outline = element("outline") as HTMLSelectElement;
const outlineColor = element("outline-color") as HTMLInputElement;
const shadow = element("shadow") as HTMLSelectElement;

element("size-label").textContent = panel.t("cuelith.richtext.size");
element("color-label").textContent = panel.t("cuelith.richtext.color");
bold.textContent = panel.t("cuelith.richtext.boldShort");
bold.setAttribute("aria-label", panel.t("cuelith.richtext.bold"));
italic.textContent = panel.t("cuelith.richtext.italicShort");
italic.setAttribute("aria-label", panel.t("cuelith.richtext.italic"));
clear.textContent = panel.t("cuelith.richtext.clear");
element("outline-label").textContent = panel.t("cuelith.richtext.outline");
element("shadow-label").textContent = panel.t("cuelith.richtext.shadow");
outlineColor.setAttribute("aria-label", panel.t("cuelith.richtext.outlineColor"));
const addChoice = (select: HTMLSelectElement, value: string, text: string): void => {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  select.append(option);
};
addChoice(outline, "none", panel.t("cuelith.richtext.none"));
for (const preset of OUTLINES)
  addChoice(outline, preset, panel.t(`cuelith.richtext.outline.${preset}`));
addChoice(shadow, "none", panel.t("cuelith.richtext.shadowNone"));
for (const preset of SHADOWS)
  addChoice(shadow, preset, panel.t(`cuelith.richtext.shadow.${preset}`));

const percent = (value: number): string => `${String(Math.round(value * 100))}%`;
const addSize = (value: number): void => {
  const option = document.createElement("option");
  option.value = String(value);
  option.textContent = value === 1 ? panel.t("cuelith.richtext.sizeNormal") : percent(value);
  size.append(option);
};
for (const value of SIZES) addSize(value);

const render = (): void => {
  const view = viewOf(panel.state);
  const on = view.active && view.hasSelection;
  status.textContent = view.active
    ? view.hasSelection
      ? panel.t("cuelith.richtext.selected", { count: view.selected })
      : panel.t("cuelith.richtext.selectSome")
    : panel.t("cuelith.richtext.idle");
  size.disabled = !on;
  bold.disabled = !on;
  italic.disabled = !on || !view.canItalic;
  color.disabled = !on;
  clear.disabled = !on;
  outline.disabled = !on;
  outlineColor.disabled = !on;
  shadow.disabled = !on;
  outline.value = view.outline;
  shadow.value = view.shadow;
  bold.setAttribute("aria-pressed", String(view.bold));
  italic.setAttribute("aria-pressed", String(view.italic));
  // Una dimensione che non e' tra quelle offerte (messa da un altro strumento) si aggiunge.
  if (![...size.options].some((option) => option.value === String(view.size))) addSize(view.size);
  size.value = String(view.size);
  // Il corsivo spento si spiega nella stessa riga di stato (la barra sta in poco spazio).
  if (view.active && !view.canItalic) {
    status.textContent = `${status.textContent} ${panel.t("cuelith.richtext.noItalic")}`;
  }
};

const apply = async (change: RichChange): Promise<void> => {
  try {
    await panel.call("richtext.apply", { change });
  } catch (error) {
    // Per esempio la selezione e' sparita nel frattempo: non e' un guasto.
    status.textContent = error instanceof PanelCallError ? panel.t(error.message) : String(error);
  }
};

size.addEventListener("change", () => void apply({ size: Number(size.value) }));
bold.addEventListener("click", () => void apply({ bold: "toggle" }));
italic.addEventListener("click", () => void apply({ italic: "toggle" }));
color.addEventListener("change", () => void apply({ color: color.value }));
outline.addEventListener("change", () => {
  const preset = outline.value as OutlinePreset | "none";
  void apply({
    outline:
      preset === "none" ? null : { width: OUTLINE_PRESETS[preset], color: outlineColor.value },
  });
});
outlineColor.addEventListener("change", () => {
  const preset = outline.value as OutlinePreset | "none";
  if (preset !== "none") {
    void apply({ outline: { width: OUTLINE_PRESETS[preset], color: outlineColor.value } });
  }
});
shadow.addEventListener("change", () => {
  const preset = shadow.value as ShadowPreset | "none";
  void apply({
    shadow: preset === "none" ? null : { ...SHADOW_PRESETS[preset], color: "#000000" },
  });
});
clear.addEventListener("click", () => {
  void apply({ size: null, bold: false, italic: false, color: null, outline: null, shadow: null });
});

panel.onState(render);
panel.onLanguage(() => {
  window.location.reload();
});
render();
