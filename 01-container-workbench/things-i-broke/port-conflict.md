# Drill: port 8088 is already in use

**Goal:** Find a host-port conflict without deleting containers or random processes.

1. Start Compose normally and confirm that `http://127.0.0.1:8088` works.
2. Edit `compose-demo/.env` to `APP_PORT=8088` if necessary.
3. Stop the stack. In another PowerShell session, start a local server using `node -e "require('node:http').createServer((q,r)=>r.end('busy')).listen(8088)"`.
4. Try `docker compose up -d` again. Docker should report that the port is taken.
5. Find the process (`Get-NetTCPConnection -LocalPort 8088 | Select-Object LocalAddress,OwningProcess`), stop the **specific test server** with Ctrl+C, and retry.

**Lesson:** Host port `8088` and container port `80` are different things. Don't indiscriminately kill processes or delete containers.
