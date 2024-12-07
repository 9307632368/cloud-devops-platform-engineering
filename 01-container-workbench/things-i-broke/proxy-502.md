# Drill: Nginx cannot find the API

**Goal:** Learn that Compose service names provide DNS names on the Compose network.

1. Start the normal stack and run the smoke test once.
2. Change `proxy_pass http://api:8080;` to `proxy_pass http://wrong-service:8080;` in `compose-demo/nginx/default.conf`.
3. Recreate the proxy container: `docker compose up -d --force-recreate proxy`.
4. Check `docker compose logs proxy`. Depending on Nginx DNS resolution, the proxy may fail to start with a host resolution error; if it starts, requests may fail with a 502.
5. Restore `proxy_pass http://api:8080;` and recreate the proxy.

**Lesson:** A name like `api` works inside the Compose network; it is not a hostname Windows automatically knows about.
