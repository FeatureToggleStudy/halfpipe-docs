---
title: Improving Performance
weight: 120
---

### Do less

Does your build stage have to download gradle/sbt/the whole internet every time it runs? Consider using a custom docker image, pre-baked with the dependencies needed. This is better for performance than caching as you will never get a cache miss.

### Worker Cache

Halfpipe provides a cache directory for every task: `/var/halfpipe/cache`. This directory is unique to the task and Concourse worker the task is running on.

Your build tool should be configured to use this directory, normally this is done by setting an environment variable.

```bash
# gradle example

[ -d /var/halfpipe/cache ] && export GRADLE_USER_HOME="/var/halfpipe/cache/.gradle"

./gradlew build
```

```bash
# sbt example (using https://github.com/paulp/sbt-extras)

if [ -d /var/halfpipe/cache ]; then
    # $HOME/.sbt is hardcoded in sbt wrapper so symlink it
    mkdir -p /var/halfpipe/cache/.sbt
    rm -rf ~/.sbt
    ln -s /var/halfpipe/cache/.sbt ~
    SBT_OPTIONS="-ivy /var/halfpipe/cache/.ivy2"
fi

./sbt ${SBT_OPTIONS} test package zip
```

### Docker Compose Cache

If you are using the [`docker-compose`](/manifest#docker-compose) task, we will mount a cache for you, similar to the worker cache, except that this cache is shared between all workers and scoped per team. No configuration of `docker-compose.yml` is needed to mount the cache into your container.

Right now this is the most performant cache solutions, because it persistent over worker restarts and is shared between all workers.

Your build tool should be configured to use this directory, normally this is done by setting an environment variable.

```bash
# gradle example

[ -d /var/halfpipe/shared-cache ] && export GRADLE_USER_HOME="/var/halfpipe/shared-cache/PIPELINE-NAME/.gradle"

./gradlew build
```

```bash
# sbt example (using https://github.com/paulp/sbt-extras)

if [ -d /var/halfpipe/shared-cache ]; then
    # $HOME/.sbt is hardcoded in sbt wrapper so symlink it
    mkdir -p /var/halfpipe/shared-cache/PIPELINE-NAME/.sbt
    rm -rf ~/.sbt
    ln -s /var/halfpipe/shared-cache/PIPELINE-NAME/.sbt ~
    SBT_OPTIONS="-ivy /var/halfpipe/shared-cache/.ivy2"
fi

./sbt ${SBT_OPTIONS} test package zip
```

### Gradle Remote Build Cache

We offer a Gradle Build Cache Node, which can be used to cache various outputs of a Gradle build.

Web UI: <http://gradle-cache.halfpipe.io>

Cache URI: <http://gradle-cache.halfpipe.io/cache/>

The Cache Node is running internally, next to our Concourse instance. To enabled the cache just add

```
buildCache {
    remote(HttpBuildCache) {
        url = "http://gradle-cache.halfpipe.io/cache/"
        push = true
    }
}
```

and run your builds with `--build-cache` or put `org.gradle.caching=true` in your gradle.properties.

Gradle Build Cache Docs: <https://docs.gradle.org/current/userguide/build_cache.html>

See the Oscar project for inspiration: <https://github.com/springernature/oscar/blob/master/settings.gradle#L57> 


### Docker Compose

There is currently a limitation that means docker images used for [`docker-compose`](/manifest#docker-compose) tasks are not cached. We hope to fix this, but for now consider using a [`run`](/manifest#run) task when the task only requires starting one container. Alternatively look at the [`docker-decompose`](/experimental-features/#docker-decompose) feature.


### Run tasks in parallel

Use the [`parallel`](/manifest/#parallel) and [`sequence`](/manifest/#sequence) options.

Use the [`pre_promote`](/manifest#deploy-cf) stage of [`deploy-cf`](/manifest#deploy-cf) to run smoke-tests and CDCs. These are automatically run in parallel.


### Vendor dependencies

The build stage of a pipeline normally requires resolving dependencies, so it's a good idea to keep them around for deployment rather than have the Cloud Foundry buildpack download them all over again. It also provides more guarantees that if the build worked so will the deploy. No chance of external dependencies going missing, or changing, or network errors etc.

For example halfpipe pipelines, see the [Go example](https://github.com/springernature/halfpipe-examples/tree/master/golang) and the [Node.js example](https://github.com/springernature/halfpipe-examples/tree/master/nodejs).

Also see the Cloud Foundry buildpack documentation. e.g. [Ruby](https://docs.cloudfoundry.org/buildpacks/ruby/index.html#vendoring), [Node.js](https://docs.cloudfoundry.org/buildpacks/node/index.html#vendoring).
