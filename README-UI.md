# SkillTracker UI

Modern, resilient UI for the SkillTracker Spring project. The UI lives in `src/main/resources/static/skilltracker-ui` and is built to keep working even if backend endpoints fail.

## Quick Start
- Open `src/main/resources/static/skilltracker-ui/index.html` directly in a browser, or
- Run your Spring app and visit `http://localhost:8080/skilltracker-ui/index.html`.

## Features Showcased
- Register user (`POST /skill-tracker/register`)
- Login with Basic Auth (`GET /skill-tracker/login`)
- Get, update, delete user (`/skill-tracker/user/id/{id}`)
- Create, list, update, delete skills (`/skill-tracker/skill/...`)
- Demo mode with local data + auto-fallback on API errors

## Notes
- Base URL defaults to the current origin. Set it in the UI if the API runs elsewhere.
- Demo mode keeps the UI interactive if the backend is unavailable.
