# Parcel status API

A tiny service I use to test different releases. It has no database, so the data resets when the app restarts. That's fine for this part; I wanted to focus on container rollouts rather than adding another backend project.

```powershell
npm test
npm start
```

Try `/healthz`, `/readyz`, `/version`, `/api/parcels`, and `/api/parcels/PKG-1001`. Set `APP_VERSION` to see version changes when testing rollouts.

The image is built from `Dockerfile` and runs as the non-root `node` user. For a real deployment, the API would need a data store and better telemetry.
