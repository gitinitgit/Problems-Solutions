# DSA Tracker (Gatsby)

630 LeetCode problems across 13 weeks, with a dashboard, weekly tracker and concept/theory modules.

## Run
    npm install
    npm run develop      # http://localhost:8000
    npm run build

## Where things are
- `content/questions.json` – all questions (topics + 13 weeks). Edit/add problems here.
- `src/pages` – Dashboard, Concepts list. `src/templates` – week + concept pages (made in `gatsby-node.js`).
- `src/hooks/useTracker.js` – all progress state, saved in the browser (localStorage).

## Deploy (Netlify)
Push to GitHub, "Import project" on Netlify. `netlify.toml` already sets the build command and publish folder.

## Solutions editor
Click the document icon beside the LeetCode icon on any problem. Posts are listed under **My Solutions**.

## Workspace & tracking
- The solution workspace can be resized by dragging its edges/corner; drag the centre divider (or use ←/→, double-click to reset) to resize the two panels. Turn **Writing mode** off to read the solution full-width.
- **Restart tracking** (Dashboard → Settings) archives solved ticks, sessions and start date into *Past runs*; saved solutions, drafts and solution version history are never touched.
