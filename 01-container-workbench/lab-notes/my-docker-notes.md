# Notes I want to remember

I originally thought Docker is mainly about shipping the exact same code. The better way to think about it: it packages the app together with its runtime environment. It does **not** automatically provide data persistence, backups, load balancing or security.

### Image vs container

- Image = the built template from the Dockerfile.
- Container = one running instance of the image.
- Dockerfile = instructions for the image build.
- Compose = a way to start multiple services together.

### My command list

```powershell
docker version
docker image ls
docker container ls -a
docker build -t service-status:2024 .
docker compose config
docker compose up --build -d
docker compose logs -f api
docker compose exec api id
docker compose down
```

### Mistakes I want to avoid

- Putting `.env` and secrets inside a Docker image or GitHub repo.
- Confusing container `localhost` with laptop `localhost`.
- Using `latest` for every image and expecting reproducible builds.
- Publishing internal database/API ports to the whole network unnecessarily.
- Assuming a successful `docker build` means the app is healthy.

The image tags in this lab are **2024-specific**, but the lab is not claiming that the files were originally authored in 2024. Modern production deployments should update unsupported/vulnerable versions.
