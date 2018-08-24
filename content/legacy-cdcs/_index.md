---
title: Legacy CDCs
weight: 120
---

To ease migration from the auto-pipeline system, halfpipe has special support for running legacy "CDC" tests.

In the future we hope to provide a proper CDC solution to replace this.

For a working example of a provider and consumer see <https://github.com/springernature/halfpipe-examples>

## Consumers

Consumers run integration tests against their dependencies in the environment they are about to deploy to.

There is nothing special needed in halfpipe to support this, just use a normal run task and set the expected environment variables.

```yaml
- type: run
  name: dev integration tests
  docker:
    image: node:9.5.0-alpine
  script: ci/run-external-and-cdcs-dev
  vars:
    PROVIDER_A_DEPLOYED_HOST: provider-a.dev.private.springernature.io
    PROVIDER_B_DEPLOYED_HOST: provider-b.dev.private.springernature.io

- type: deploy-cf
  name: deploy to dev
  ...
```

## Providers

Unlike auto-pipelines, you have to explicitly configure the consumers in the provider pipeline. The Halfpipe task `consumer-integration-test` takes care of the rest:

* finds out what version of the consumer is running by hitting `http://[consumer-host]/internal/version`
* clones consumer repo at that revision
* runs the consumer cdcs using it's docker-compose configuration

The best place to run the tests is in the `pre_promote` stage. This will use the `TEST_ROUTE` and prevent deployment if the tests fail.

```yaml
tasks:
- type: deploy-cf
  ...
  pre_promote:
  - type: consumer-integration-test
    name: example consumer tests                                # name it what you like
    consumer: consumer-repo/optional-sub-directory              # SpringerNature GitHub repo name / optional-sub-dir
    consumer_host: consumer-a.dev.private.springernature.io     # address of consumer in target env
    script: ci/run-external-and-cdcs-dev                        # consumer's test script to execute
    docker_compose_service: code                                # OPTIONAL service name in consumer's docker-compose. default = code
```

If you want to run the consumer's tests after deployment then you must set the provider host manually

```yaml
- type: consumer-integration-test
  name: example consumer tests                                # name it what you like
  consumer: consumer-repo/optional-sub-directory              # SpringerNature GitHub repo name / optional-sub-dir
  consumer_host: consumer-a.dev.private.springernature.io     # address of consumer in target env
  provider_host: provider-a.dev.private.springernature.io     # address of provider
  script: ci/run-external-and-cdcs-dev                        # consumer's test script to execute
  docker_compose_service: code                                # OPTIONAL service name in consumer's docker-compose. default = code

```
