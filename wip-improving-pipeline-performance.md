# Improving Pipeline Performance

#### 1. Do less

Does your build stage have to download gradle/sbt/the whole internet every time it runs? Consider using a custom docker image, pre-baked with the dependencies needed. This is better for performance than caching as you will never get a cache miss.

#### 2. Cache more

Halfpipe provides a cache directory for every task: `/halfpipe-cache`. This directory is unique to the task and Concourse worker the task is running on.

Your build tool should be configured to use this directory, normally this is done by setting an environment variable.

For example, to set `GRADLE_HOME` if the halfpipe cache dir exists:

```bash
[ -d /halfpipe-cache ] && GRADLE_HOME="/halfpipe-cache/.gradle"`

./gradlew build
```


#### 3. Avoid Docker Compose tasks where possible

There is currently a limitation in Halfpipe that means docker images used for `docker-compose` tasks are not cached. We hope to fix this, but for now consider using a `run` when the task only requires starting one container.


#### 4. Use the task cache directory with Docker Compose

If you are using the `docker-compose` task, you can still use the task cache directory by adding it as a volume in the `docker-compose.yml` config.

```yaml
version: '3'

services:
  app:
    image: my-image:latest
    volumes:
    - .:/app
    - /halfpipe-cache
    working_dir: /app
```

#### 5. Run tasks in parallel

Use the [`parallel`](/manifest/#parallel-tasks) option. 

Use the [`pre_promote`](/manifest#deploy-cf) stage of [`deploy-cf`](/manifest#deploy-cf) to run smoke-tests and CDCs. These are automatically run in parallel.
