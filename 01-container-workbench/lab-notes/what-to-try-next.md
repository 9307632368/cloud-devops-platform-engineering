# Practice ideas after finishing this lab

1. Add a second API service and use Nginx to route `/inventory/` to it.
2. Put the API behind TLS on a test VM (use a secure domain and certificates if publicly exposed).
3. Build the container image in GitHub Actions rather than on the laptop.
4. Compare image size before and after adding unnecessary files to the build context.
5. Make the API write JSON logs and then collect the logs with a logging stack.

My next planned folder is `pipeline-room/`, where I will implement build/test/image-publish workflows.
