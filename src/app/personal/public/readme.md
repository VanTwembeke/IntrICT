# INDEX OF /PUBLIC

```text
INTRICT NETWORK                        NODE / 001
──────────────────────────────────────────────────────────
  /personal/public/                    ACCESS: ANONYMOUS
  DIRECTORY TYPE                       OPEN WEB
  AUTHENTICATION                       NOT REQUIRED
──────────────────────────────────────────────────────────
```

## Welcome to the open side.

No credentials. No invitations. No velvet rope.

This directory is the public-facing entry point of **INTRICT // INDEX**: a place for experiments, browser tools, tiny software projects and things worth sharing.

Think old-school web hosting, rebuilt with modern standards.

### Directory protocol

| Path        | Purpose                                           |
| :---------- | :------------------------------------------------ |
| `games/`    | Browser games and interactive experiments.        |
| `tools/`    | Small utilities (create when needed).             |
| `projects/` | Public demos and prototypes (create when needed). |

Only `games/` is included in this starter pack. The others are suggestions, not existing directories.

### Publishing something new

1. Create a folder inside `personal-content/public/` in the GitHub repository.
2. Add an `index.html`, another supported file, or a `README.md`.
3. Commit your changes. The index discovers files and their parent directories from the configured Git ref.
4. Visit `/personal/?dir=public` and refresh the directory listing.

**Visibility warning:** anything placed here is available to visitors without signing in. Never commit passwords, API tokens, personal records, or secret configuration.

---

```text
HTTP/1.1 200 OK
X-Network: INTRICT
X-Directory: /public
X-Philosophy: Build things. Leave the door open.
```

*Maintained as part of INTRICT // INDEX. This page is documentation, not a live server status report.*
