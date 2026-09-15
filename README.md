# RePlay – Buy. Sell. Play Again.

## Project Overview

RePlay is an educational HTTP/REST game based on a fictional marketplace for second-hand sports equipment.

Players construct real HTTP requests against a Node.js and Express REST API. Each challenge focuses on a different REST operation, request detail, or response status. The browser sends requests to the server and receives the server's real JSON responses.

The project uses in-memory server data seeded from JSON files. It does not use a database.

## Topics Practiced

- GET
- POST
- PUT
- PATCH
- DELETE
- Route Parameters
- Query Parameters
- Request Body
- JSON
- HTTP Status Codes
- REST
- AJAX / Fetch
- SSR with EJS

## Technologies

- Node.js
- Express
- EJS
- Vanilla JavaScript
- CSS
- Fetch API

## Installation

```bash
git clone https://github.com/feklerhadar/replay-rest-game.git
cd replay-rest-game
npm install
```

## Running the Project

Start the server with:

```bash
npm start
```

The server listens on port `3000` by default.

For development with automatic restart on file changes, use:

```bash
npm run dev
```

Open the game in a browser at:

[http://localhost:3000](http://localhost:3000)

The schemas page is available at:

[http://localhost:3000/schemas](http://localhost:3000/schemas)

## Project Structure

```text
.
├── data/       JSON seed data for listings and offers
├── game/       Private stage definitions and server-side validation
├── public/     External CSS and browser JavaScript
├── routes/     Express REST API routes
├── views/      EJS server-rendered pages
├── server.js   Express application entry point
└── package.json
```

## API Resources

The REST API is available under `/api` and includes:

- Listings
- Offers
- Nested listing-offer relationship routes
- Public game-stage metadata

All game solutions remain server-side. The browser receives only public scenario metadata and learns whether an attempt is valid from the server response.

## License

This project is an educational university assignment.
