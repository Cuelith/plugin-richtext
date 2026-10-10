import { emptyLayers, newId, type RichSession, type StateDocument } from "@cuelith/protocol";
import { describe, expect, it } from "vitest";
import { viewOf } from "../src/ui/logic.js";

function state(richText?: RichSession, font?: string): StateDocument {
  const id = newId();
  return {
    show: {
      schema: 1,
      id: newId(),
      name: "Show",
      playlist: [],
      items: {},
      sources: {},
      looks:
        font === undefined
          ? {}
          : {
              [id]: {
                id,
                name: "Sala",
                template: "core.fullscreen",
                layers: ["content"],
                fields: ["text"],
                style: { text: { font } },
              },
            },
      scenes: {},
      outputs: {},
      rules: [],
      plugins: {},
    },
    live: {
      rev: 0,
      cursor: { slideIndex: 0 },
      preview: { slideIndex: 0 },
      layers: emptyLayers(),
      outputs: {},
      activeScene: {},
      clients: [],
      plugins: [],
      dirty: false,
      libraryRev: 0,
      ...(richText === undefined ? {} : { richText }),
    },
  } as unknown as StateDocument;
}

const session = (over: Partial<RichSession> = {}): RichSession => ({
  owner: "acme.editor",
  field: "slide-1",
  text: "Il Signore e' il mio pastore",
  selection: { start: 3, end: 10 },
  applied: 0,
  ...over,
});

describe("barra della formattazione", () => {
  it("senza un testo in modifica non c'e' niente da fare", () => {
    expect(viewOf(state())).toMatchObject({ active: false, hasSelection: false, selected: 0 });
  });

  it("con un testo ma senza selezione la barra e' spenta; con una selezione si accende", () => {
    expect(viewOf(state(session({ selection: { start: 4, end: 4 } })))).toMatchObject({
      active: true,
      hasSelection: false,
    });
    expect(viewOf(state(session()))).toMatchObject({
      active: true,
      hasSelection: true,
      selected: 7,
      size: 1,
      bold: false,
    });
  });

  it("dice cosa ha gia' il tratto: grassetto solo se tutto il tratto lo ha", () => {
    const whole = session({ spans: [{ start: 3, end: 10, bold: true, size: 2 }] });
    expect(viewOf(state(whole))).toMatchObject({ bold: true, italic: false, size: 2 });
    const partial = session({ spans: [{ start: 3, end: 6, bold: true }] });
    expect(viewOf(state(partial))).toMatchObject({ bold: false });
  });

  it("il corsivo si offre solo se il carattere ne ha uno vero", () => {
    expect(viewOf(state(session({ font: "lora" }))).canItalic).toBe(true);
    expect(viewOf(state(session({ font: "bebas-neue" }))).canItalic).toBe(false);
    // Senza il carattere dichiarato si guarda quello dello stile della sala.
    expect(viewOf(state(session(), "oswald")).canItalic).toBe(false);
    expect(viewOf(state(session(), "display")).canItalic).toBe(true);
    // Se non si sa, non si toglie niente.
    expect(viewOf(state(session())).canItalic).toBe(true);
  });
});
