# Gesture Kombat

A browser-based, camera-controlled 2D fighter. Original characters and arena; camera inference is local and only canonical actions are sent to a match server.

## Play

For local play, start the combined page and match server from the `server/` folder:

```sh
npm install
npm start
```

Then open [http://localhost:8080](http://localhost:8080) in your browser. Do not open `index.html` directly from Finder; the browser blocks its JavaScript module on a `file://` page. Camera access requires HTTPS or `localhost`. Choose **Solo Training** and press **Start Fight** to try the keyboard controls. Enable the camera, allow access, then use **Calibrate** to set your stance before trying gestures.

## Online matches

The GitHub Pages client is static. To enable online play, deploy the WebSocket server in `server/` to a Node 20+ service that supports persistent WebSocket connections. Set the service's start command to `npm start`, then paste its `wss://` address into the Online Match field. Create a room and share its six-character code. The other player enters the same server address and room code, then clicks **Join Room**.

The match server uses a 60 Hz authoritative combat loop, checks sequence and action cooldowns, enforces move startup/recovery, and broadcasts compact game state. It never receives camera frames or pose landmarks. This is a casual prototype: it does not yet include matchmaking, identity, reconnects, or ranked-play anti-cheat.

## Camera controls

The client loads MediaPipe Pose Landmarker v0.10.21 from jsDelivr and the Lite model from Google's public model storage. It tries GPU inference first and falls back to CPU if the GPU delegate is unavailable. The browser requests camera permission explicitly. Pose processing runs on the client; recognizable actions are only sent as small WebSocket messages during an online match. Keyboard play does not require a camera.

## Development

For remote play, host the server behind TLS and use `wss://`.
