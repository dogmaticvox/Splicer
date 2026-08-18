# Splicer

A neon, installable PWA for cut-up lyric writing — inspired by Bowie's Verbasizer. Paste in your own
source text, shuffle it into stanzas, and keep the lines that land. Everything runs on your device,
nothing is uploaded.

**Features**

- ✂️ **Multiple sources** — label and paste as many blocks of text as you like, even unrelated subjects,
  and shuffle recombines words and lines across all of them
- 🔀 **Shuffle unit** — word, comma-delimited phrase, or sentence, picked fresh before each shuffle
- 🧠 **Grammar mode** — fully random token shuffle, or "loosely grammatical" recombination that uses
  [compromise](https://github.com/spencermountain/compromise) to POS-tag your text and keep a plausible
  sentence shape while still mixing words across sources
- 📜 **Stanzas** — shuffle generates a fixed 6-line stanza in the results panel
- ⭐ **Pin lines** — save individual lines to a Keepers list; their words stay in the shuffle pool so they
  can resurface in later stanzas
- 📋 **Copy / export keepers** — copy the whole list to the clipboard or export it as a `.txt` file
- 💾 **Named sessions** — save your source text and keepers to a named session in `localStorage`, and
  reload it later to keep working
- 📴 **Offline-first** — installs to your home screen and works with no connection

## Install on your phone

1. Enable hosting once: repo **Settings → Pages → Source: GitHub Actions** (the included workflow
   builds and deploys automatically on every push to `main`).
2. Open **https://dogmaticvox.github.io/Splicer/** (or the custom domain in `public/CNAME`) on your
   phone.
3. Add it to your home screen:
   - **Android/Chrome**: tap the install prompt, or ⋮ menu → *Add to Home screen*
   - **iOS/Safari**: Share sheet → *Add to Home Screen*

## Local development

```sh
npm install
npm run dev
# → http://localhost:5173
```

```sh
npm run build    # production build to dist/
npm run preview  # serve the production build locally
```

## How it works

- **Tokenizing** (`src/lib/tokenize.js`) splits source text into words, comma-delimited phrases, or
  sentences, and builds a shuffle pool from every source plus every keeper (so pinned lines' words stay
  in circulation).
- **POS tagging** (`src/lib/pos.js`) wraps compromise to bucket words by part of speech (noun, verb,
  adjective, adverb, determiner, preposition, pronoun, conjunction) across all sources, and to classify
  comma-delimited phrases by rough shape (noun phrase / verb phrase / prepositional phrase).
- **Generation** (`src/lib/generator.js`) assembles a 6-line stanza: fully random mode samples raw tokens;
  loosely grammatical mode fills small sentence/phrase templates from the POS pools, so words can hop
  between unrelated source texts while the line still reads as a sentence.
- **Sessions** (`src/lib/sessions.js`) persist named sessions (sources, keepers, unit, grammar mode) to
  `localStorage`.
- Built with React + Vite; `vite-plugin-pwa` precaches the build so the installed app works fully offline.
