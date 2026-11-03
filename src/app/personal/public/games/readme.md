# INDEX OF /GAMES

```text
INTRICT ARCADE                         NODE / 003
──────────────────────────────────────────────────────────
  /personal/public/games/             ACCESS: OPEN
  EXECUTION ENVIRONMENT               WEB BROWSER
  ADMISSION POLICY                     CURIOSITY REQUIRED
──────────────────────────────────────────────────────────
```

## Press start. Break nothing.

A small corner of the network dedicated to **playable ideas**: fast prototypes, strange mechanics, nostalgic experiments and browser games worth keeping online.

No store. No leaderboard promises. No fake launch dates. A game appears here when its files actually exist.

### Game cartridge format

Create one directory per game. For example:

```text
public/games/
├── README.md
└── my-game/                 ← create when ready
    ├── index.html
    ├── style.css
    └── game.js
```

Inside `index.html`, reference assets relatively:

```html
<link rel="stylesheet" href="./style.css">
<script src="./game.js" defer></script>
```

### Rules of the arcade

* **HTML, CSS and JavaScript first.** Keep each game portable and easy to inspect.
* **No dead entries.** A game is listed automatically once real files are committed.
* **Respect the sandbox.** HTML runs in a restricted browser context; don't rely on access to INTRICT login cookies or the parent site's local storage.
* **Keep assets lightweight.** The current INDEX gateway accepts supported file types up to **3 MiB per file**.
* **Mobile matters.** Prefer responsive controls, keyboard support and touch-friendly targets.

### Launch sequence

1. Commit a game folder under `personal-content/public/games/`.
2. Make sure the configured Git ref includes the commit.
3. Open `/personal/?dir=public/games` and refresh.
4. Open the game's `index.html` from the directory listing.

---

```text
INSERT COIN?                       [ NOT REQUIRED ]
SAVE POINT                         [ YOUR REPOSITORY ]
PLAYER COUNT                       [ WHOEVER SHOWS UP ]
```

*Built for the joy of making things. INTRICT // INDEX.*
