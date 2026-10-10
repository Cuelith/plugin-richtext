# Formattazione (plugin di Cuelith)

Ingrandisci, metti in grassetto, in corsivo o colora **solo alcune parole** di un testo, negli
editor dei plugin che lo supportano. È un plugin annesso: chi non vuole le parole formattate non
lo installa, e Cuelith (e i plugin dei testi) funzionano come sempre.

## Come funziona

- Un editor (di Brani o di qualunque plugin) descrive al motore il testo che sta scrivendo e il
  tratto selezionato (`richtext.session`).
- Questo plugin è una **barra di strumenti** (`placement: "editor"`, protocollo 1.23): la postazione la mostra in cima alla finestra dell'editor, solo mentre l'editor ha un testo che la usa. Legge `live.richText` dallo stato e, con i suoi pulsanti, chiede la modifica del
  tratto (`richtext.apply`).
- Il motore calcola i nuovi intervalli e li riporta nello stato; l'editor li adotta (`onSpans`).
  Il testo lo scrive solo l'editor.

Il testo resta una stringa semplice: le parole formattate stanno accanto (`spans`, protocollo 1.21)
e chi non le conosce legge il testo di sempre. Le uscite e l'anteprima le disegnano uguali.

## Per chi scrive un plugin

In `@cuelith/panel`, `bindRichText(panel, campo, onSpans)` (o `bindTextarea` per una casella di
testo) collega un testo del plugin a questo plugin annesso. Se non è installato, non succede niente.
Vedi la guida per chi sviluppa.

## Sviluppo

```
pnpm install
pnpm check   # tipi, lint, prove
pnpm build   # dist/cuelith.richtext-<versione>.cpkg
```

Licenza GPL 3.0 o successiva.
