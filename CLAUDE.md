# ManyTwitch - Developer Guide

Watch multiple Twitch streams simultaneously. PWA built with Node.js/Express.

## Quick Commands

```bash
npm start      # Start server on port 8080
npm test       # Run Mocha tests
```

## Architecture

**Stack:** Express.js backend, vanilla JS frontend, EJS templates, Bootstrap 5 dark theme

**Global Namespace (MT):**
- `MT.manager` - Stream manager modal operations
- `MT.streams` - Stream persistence (localStorage)
- `MT.util` - Utility functions

## Key Files

- `app.js` - Express app, routes, middleware
- `bin/www` - Server entry point
- `public/js/manytwitch.js` - Core client logic (564 lines)
- `public/js/sw.js` - Service Worker (cache-first strategy)
- `public/js/pwa.js` - PWA install/update handling
- `views/*.ejs` - Server-rendered templates

## URL Routing

Streams parsed from URL path: `manytwitch.app/streamer1/streamer2/streamer3`

## Data Storage

localStorage keys:
- `streams` - Current streams (comma-separated)
- `recents` - Recent streams (comma-separated)

## Testing

Tests in `test/` using Mocha + Chai + jsdom. Focus on modal functionality and input handling.

## Environment Variables

- `PORT` - Server port (default: 8080)
- `NODE_ENV` - development/production
- `HEROKU_RELEASE_VERSION` - Build ID for deployments
