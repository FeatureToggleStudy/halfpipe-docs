---
title: Improving Performance
weight: 120
---

### Do less

Does your build stage have to download gradle/sbt/the whole internet every time it runs? Consider using a custom docker image, pre-baked with the dependencies needed. This is better for performance than caching as you will never get a cache miss.

### Worker Cache

Halfpipe provides a cache directory for every task: `/halfpipe-cache`. This directory is unique to the task and Concourse worker the task is running on.

Your build tool should be configured to use this directory, normally this is done by setting an environment variable.

```bash
# gradle example

[ -d /halfpipe-cache ] && export GRADLE_USER_HOME="/halfpipe-cache/.gradle"

./gradlew build
```

```bash
# sbt example (using https://github.com/paulp/sbt-extras)

if [ -d /halfpipe-cache ]; then
    # $HOME/.sbt is hardcoded in sbt wrapper so symlink it
    mkdir -p /halfpipe-cache/.sbt
    rm -rf ~/.sbt
    ln -s /halfpipe-cache/.sbt ~
    SBT_OPTIONS="-ivy /halfpipe-cache/.ivy2"
fi

./sbt ${SBT_OPTIONS} test package zip
```

### Docker Compose

There is currently a limitation in Halfpipe that means docker images used for [`docker-compose`](/manifest#docker-compose) tasks are not cached. We hope to fix this, but for now consider using a [`run`](/manifest#run) task when the task only requires starting one container.

### Docker Compose Cache

If you are using the [`docker-compose`](/manifest#docker-compose) task, you can use a cache, similar to the worker cache, except that this cache is shared between all workers and scoped per team.

The cache dir is: `/var/halfpipe/shared-cache` available to mount as a volume in the docker compose file.

Right now this is the most performant cache solutions for build artifacts, because the cache is persistent also over worker restarts.

```yaml
version: '3'

services:
  app:
    image: my-image:latest
    volumes:
    - .:/app
    - /var/halfpipe/shared-cache:/var/halfpipe/shared-cache
    working_dir: /app
    command: ./build
```

### Run tasks in parallel

Use the [`parallel`](/manifest/#parallel-tasks) option. 

Use the [`pre_promote`](/manifest#deploy-cf) stage of [`deploy-cf`](/manifest#deploy-cf) to run smoke-tests and CDCs. These are automatically run in parallel.


### Vendor dependencies

The build stage of a pipeline normally requires resolving dependencies, so it's a good idea to keep them around for deployment rather than have the Cloud Foundry buildpack download them all over again. It also provides more guarantees that if the build worked so will the deploy. No chance of external dependencies going missing, or changing, or network errors etc.

For example halfpipe pipelines, see the [Go example](https://github.com/springernature/halfpipe-examples/tree/master/golang) and the [Node.js example](https://github.com/springernature/halfpipe-examples/tree/master/nodejs).

Also see the Cloud Foundry buildpack documentation. e.g. [Ruby](https://docs.cloudfoundry.org/buildpacks/ruby/index.html#vendoring), [Node.js](https://docs.cloudfoundry.org/buildpacks/node/index.html#vendoring).
