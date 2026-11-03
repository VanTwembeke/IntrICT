# INDEX OF /MEMBERS

```text
INTRICT NETWORK                        NODE / 002
──────────────────────────────────────────────────────────
  /personal/members/                   ACCESS: AUTHENTICATED
  DIRECTORY TYPE                       SHARED WORKSPACE
  IDENTITY PROVIDER                    INTRICT SSO / SUPABASE
──────────────────────────────────────────────────────────
```

## Beyond the public index.

You are looking at the members' side of the network: a quieter space for signed-in people, collaborative material and projects that are not intended for anonymous visitors.

No flashing dashboards. No unnecessary ceremony. Just directories, resources and a clear path to the work.

### Access rules

* **Guests** cannot browse this directory through INTRICT // INDEX.
* **Signed-in accounts** can access it when the site's Supabase SSO is configured correctly.
* **Owners** can access it too. The separate `/private/` volume remains owner-only.

**Important:** `members/` is currently shared with *all* authenticated accounts, not isolated per individual member. Do not put personal user data here unless you implement more granular authorization.

### Suggested structure

```text
members/
├── README.md                ← you are here
├── resources/               ← create when needed
├── projects/                ← create when needed
└── releases/                ← create when needed
```

The folders above are examples; they appear only after you add a file inside each one.

### Repository rules

1. Keep this content in a **private GitHub repository** if it must not be publicly accessible through GitHub itself.
2. Do not store access tokens, passwords, credentials or sensitive customer data in commits.
3. Add new folders and supported files under `personal-content/members/`; the index builds the directory tree automatically.
4. Verify access with both a signed-in account and a guest session after deployment.

---

```text
HTTP/1.1 200 OK  (authorized sessions only)
X-Network: INTRICT
X-Directory: /members
X-Rule: Authentication is not the same as authorization.
```

*The headers shown above are illustrative. Real access is enforced by the Next.js route, not this README.*
