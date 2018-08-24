---
title: Manifest
weight: 40
---

Everything in halfpipe is configured in what we call the manifest.

The manifest __must__

* Be called `.halfpipe.io` or `.halfpipe.io.yml`
* Be placed inside a git repository
* Be valid YAML.


Schema
```yaml
team: required(string)
pipeline: required(string)
slack_channel: optional(string regex '#.+')
on_failure: optional(list)
trigger_interval: optional(string regex '\d+h')
repo: optional(repo)
tasks: required(list)
```

The bare minimum example - run a script in a docker container.
```yaml
team: my-team
pipeline: my-pipeline
tasks:
- type: run
  script: hello-world.sh
  docker:
    image: public-image-from-docker-hub:latest
```

## team
The mandatory field `team` must be set to a valid GitHub team name.

## pipeline
The mandatory field `pipeline` must be set to the name of the pipeline in concourse. If you set pipeline to `wakawaka-hazzah` you **must** upload the pipeline to concourse with `fly .... -p wakawaka-hazzah`

The value of this field is used to construct paths for vault secrets and artifacts.

## slack_channel
The optional field `slack_channel` can be set to enable a notification when any of the tasks fail. Must be a quoted string starting with `#`.

Schema
```yaml
slack_channel: optional(string regex '#.+')
```

Example
```yaml
slack_channel: "#ci-alerts"
```

## on_failure
The optional field `on_failure` can be set to run a task when any of the tasks fail. We support running a run task or a docker-compose task.
Both `slack_channel` and `on_failure` can be set.

See [tasks](#tasks) for the schema of a run-task or docker-compose task.

Schema
```yaml
on_failure: optional(list)
```

Example
```yaml
on_failure:
- type: run
  name: run tests
  ...                # task specific options
```

## trigger_interval
The optional field `trigger_interval` can be set to run the pipeline on a timer. The interval must be specified in hours:

Schema
```yaml
trigger_interval: optional(string regex '\d+h')
```

Example
```yaml
trigger_interval: 24h
```


## repo
The optional top level dict `repo` dictates which git repo halfpipe will operate on.

By default, if no repo.uri is defined the halfpipe-cli will try to resolve the git uri for you.

If `uri` points to a private repository you may also need to set `private_key`. If no private key is specified, Halfpipe will default to your team's GitHub key `((github.private_key))` which is pre-populated in Vault. See [Vault](/docs/vault/#pre-populated-secrets-in-vault) for more info.

`watched_paths` and `ignored_paths` takes a list of globs or paths. This allows a pipeline to only trigger when there has been changes to a set of predefined paths, or to stop changes to certain paths from triggering the pipeline.

`git_crypt_key` can be used to unlock a encrypted repository. To use this you must base64 encode your git-crypt key and put it in vault and reference it

Schema
```yaml
repo:
  uri: optional(string)
  private_key: optional(string)
  git_crypt_key: optional(string)
  watched_paths: optional([]string)
  ignored_paths: optional([]string)
```

Examples
```yaml
# Override the default uri and private key
repo:
  uri: git@github.com:org/repo.git
  private_key: ((repo-name.private-key))
```
```yaml
# Only trigger the pipeline when there has been changes
# in the `src/main` folder, and unlock the encrypted repo.
repo:
  uri: git@github.com:organisation/repo-name.git
  private_key: ((repo-name.private-key))
  git_crypt_key: ((git-crypt-keys.repo-name))
  watched_paths:
  - src/main
```

## Tasks
The top level dict `tasks` dictates what halfpipe should do.

Schema
```yaml
tasks:
  - type: required(string)
    name: optional(string)
    ...      [ task specific options ]
```

`type` must be one of the supported task types: `run`, `docker-compose`, `deploy-cf`, `docker-push` or `consumer-integration-test`.

`name` is an optional name for the task, which will be displayed in the Concourse interface.

Example
```yaml
tasks:
- type: run
  name: run tests
  ...                # task specific options
- type: deploy-cf
  name: deploy to live
  ...                # task specific options
```


### run
Run is the most generic piece of work you can do. It represents a job in a Concourse
pipeline where a script will be run in a docker container. If the script returns a non-zero
exit code the task will be considered failed and any subsequent tasks will not run.

Schema
```yaml
- type: run
  name: optional(string)
  manual_trigger: optional(bool, default=false)
  script: required(string)
  docker:
    image: required(string)
    username: optional(string)
    password: optional(string)
  vars: optional(hashmap(string, string))
  save_artifacts: optional(list(string))
  restore_artifacts: optional(bool, default=false)
  parallel: optional(bool, default=false)
```

`script` is a path to a shell script to be executed relative to `.halfpipe.io` file. Alternatively if you want to run a system command prefix the command with `\`, i.e `\make`

`docker` is a hashmap that has the following fields:
  `image` is the image that the run script will run inside. If it is a public repo, this is all you need.
  If it is pointing to a private docker registry, the fields `username` and `password` are required.

  We provide the Google Container Registry for halfpipe projects. If you are pointing to any docker image on `eu.gcr.io/halfpipe-io/`, username and password are not needed.

`vars` is a hashmap of environment variables that will be available to the `script`

`save_artifacts` is a list of paths to directories or files that you want to make available to future tasks. For example, an artifact created by a build task which you want to deploy. Use `.` to save the entire working directory (e.g. for node.js or ruby apps). See `deploy_artifact` in the `deploy-cf` task for using a saved artifact.

`restore_artifacts` restores all previously saved artifacts into the working dir of the job. I.e if you have saved `build/my/thing` and `some/other/path` in a run/docker-compose task, and you set `restore_artifacts: true` in a subsequent task the files `build/my/thing` and `some/other/path` will be present.

`parallel` run the task in parallel with other tasks. See [parallel tasks](#parallel-tasks).

Examples
```yaml
# Minimal
- type: run
  script: test.sh
  docker:
    image: golang
```
```yaml
# More complex
- type: run
  name: run tests
  script: test.sh
  docker:
    image: golang
    username: user1
    password: very-secret
  vars:
    TEST_API: https://test-api.com
  save_artifacts:
  - target/distribution/artifact.zip
- type: run
  script: build.sh
  docker:
    image: eu.gcr.io/halfpipe-io/your-private-image
  restore_artifacts: true
- type: run
  name: Run uptime from the container
  script: \uptime
  docker:
    image: eu.gcr.io/halfpipe-io/your-private-image
  restore_artifacts: true

```

### docker-compose
This task will execute docker-compose based on `docker-compose.yml`. This file must be present in the same directory as the halfpipe manifest.

Schema
```yaml
- type: docker-compose
  name: optional(string)
  service: optional(string, default='app')
  command: optional(string)
  manual_trigger: optional(bool, default=false)
  vars: optional(hashmap(string, string))
  save_artifacts: optional(list(string))
  restore_artifacts: optional(bool, default=false)
  parallel: optional(bool, default=false)

```

`service` the name of the docker-compose.yml service to run.

`command` if specified then this command will be run against the service; otherwise the default command for the service will be executed.

`vars` is a hashmap of environment variables that will be available to docker-compose

`save_artifacts` see the `run` task for description.

`restore_artifacts` see the `run` task for description.

`parallel` run the task in parallel with other tasks. See [parallel tasks](#parallel-tasks).

Examples
```yaml
# Minimal
- type: docker-compose
```
```yaml
# More complex
- type: docker-compose
  name: run tests
  vars:
    TEST_API: https://test-api.com
```

### deploy-cf
deploy-cf is surprise, surprise used to deployed an app to Cloud Foundry.

[Here you can find more information](/docs/cf-deployment/) about how deploy-cf works under the hood!

Schema
```yaml
- type: deploy-cf
  name: optional(string)
  manual_trigger: optional(bool, default=false)
  api: required(string)
  space: required(string)
  org: optional(string, default=team)
  username: optional(string, default="((cloudfoundry.username))")
  password: optional(string, default="((cloudfoundry.password))")
  test_domain: optional(string, default="derived from the api")
  manifest: optional(string, default="manifest.yml relative to the halfpipe.io file")
  vars: optional(hashmap(string, string))
  deploy_artifact: optional(string)
  pre_promote: optional(list(run-task))
  parallel: optional(bool, default=false)
  timeout: optional(duration, default="5m")
```

If `org` is not set it will be set to the value of top level key `team`.

`vars` is a hash map of environment variables that will be available to the `app` in CF

`test_domain` sets the domain that should be used when pushing the app as a candidate. By default this is derived for you based on the API you use.

`deploy_artifact` the path to a file or directory to push to CF, which has been saved in a previous `run` or `docker-compose` task with `save_artifacts`.

`pre_promote` is a list of run tasks, that will be executed after the app has been deployed as a candidate but before the app gets promoted to live. The pre promote jobs will get the environment variable `TEST_ROUTE` injected with the route to the candidate app.

`parallel` run the task in parallel with other tasks. See [parallel tasks](#parallel-tasks).

`timeout` sets the timeout for the halfpipe deployment. If a command does not finish within this timeframe the task will fail.

In your team's vault you will find the map `cloudfoundry` containing the values: `username`, `password`, `api-dev`, `api-live`, `api-gcp`, `api-snpaas`.

Examples
```yaml
# Minimal
- type: deploy-cf
  api: ((cloudfoundry.api-snpaas))
  space: test
```
```yaml
# More complex
- type: deploy-cf
  name: deploy to live
  api: ((cloudfoundry.api-snpaas))
  org: engineering-enablement
  space: live
  manifest: ci/manifest.yml
  vars:
    API_ENDPOINT: https://api.com
    SKIP_SSL_CHECK: true
  deploy_artifact: target/distribution/artifact.zip
  pre_promote:
  - type: run
    name: run-smoke-tests
    script: ./smoke.sh
    docker:
      image: alpine
```

### docker-push
Allows you to build a Docker image and push it to a docker registry, currently
the `Dockerfile` is __required__ to reside in the same directory as the halfpipe manifest.

Schema
```yaml
- type: docker-push
  name: optional(string)
  manual_trigger: optional(bool, default=false)
  username: optional(string)
  password: optional(string)
  image: required(string)
  restore_artifacts: optional(bool, default=false)
  parallel: optional(bool, default=false)
```

`restore_artifacts` see the `run` task for description.

`parallel` run the task in parallel with other tasks. See [parallel tasks](#parallel-tasks).

Example using the [Halfpipe Private Registry](/docs/docker-registry/) - username and password are not required.

```yaml
- type: docker-push
  image: eu.gcr.io/halfpipe-io/your-image-name
```

Example using official Docker Registry
```yaml
- type: docker-push
  name: push to docker hub
  username: myusername
  password: ((my.password))
  image: myusername/your-image-name
```


### consumer-integration-test

This task is designed to run in a `producer's` pipeline. It helps running a `consumer's` legacy app-anatomy/auto-pipeline style CDC tests.

For more information about migrating CDCs from auto-pipelines see [legacy CDCs](/docs/legacy-cdcs)

Schema
```yaml
- type: consumer-integration-test
  name: optional(string)
  consumer: required(string)
  consumer_host: required(string)
  provider_host: optional(string, default=$TEST_ROUTE)
  script: required(string)
  docker_compose_service: optional(string, default="code")
  vars: optional(hashmap(string, string))
  parallel: optional(bool, default=false)
```

`name` overrides the default task name shown in the Concourse interface.

`consumer` is the SpringerNature GitHub repository name, with optional sub-directory for apps in a monorepo. e.g. `repo-name` or `monorepo-name/dir`.

`consumer_host` is the address of the consumer application in the same environment as the provider.

`provider_host` is the address of the provider application to test. This field will default to `$TEST_ROUTE` when the task is part of the `pre_promote` stage of `deploy-cf`.

`script` is the consumer's test script to execute

`docker_compose_service` is the service name in the consumer's docker-compose. Defaults to `code`.

`vars` is a hashmap of environment variables that will be available to the docker-compose service used for the task

`parallel` run the task in parallel with other tasks. See [Running tasks in parallel](#parallel-tasks).

Examples

The best place to run the consumer integration tests is in the `pre_promote` stage. This will use the `TEST_ROUTE` and prevent deployment if the tests fail.

```yaml
tasks:
- type: deploy-cf
  ...
  pre_promote:
  - type: consumer-integration-test
    name: example consumer tests
    consumer: consumer-repo/optional-sub-directory
    consumer_host: consumer-a.dev.private.springernature.io
    script: ci/run-external-and-cdcs-dev
    docker_compose_service: app
```

If you want to run the consumer's tests after deployment then you must set the provider host manually

```yaml
- type: consumer-integration-test
  name: example consumer tests
  consumer: consumer-repo/optional-sub-directory
  consumer_host: consumer-a.dev.private.springernature.io
  provider_host: provider-a.dev.private.springernature.io
  script: ci/run-external-and-cdcs-dev
```

### deploy-ml-zip

This task deploys local XQuery files to MarkLogic using [ml-deploy](https://github.com/springernature/ml-deploy).

Schema
```yaml
- type: deploy-ml-zip
  name: optional(string)
  deploy_zip: required(string)
  app_name: optional(string, default=pipeline name)
  app_version: optional(string, default=$GIT_REVISION)
  targets: required(list(string))
  parallel: optional(bool, default=false)
  manual_trigger: optional(bool, default=false)
```

`name` overrides the default task name shown in the Concourse interface.

`deploy_zip` path to zip containing xquery source files. Usually created in a build task and included in `saved_artifacts`.

`app_name` the app name in MarkLogic. Defaults to the name of the pipeline.

`app_version` the app version in MarkLogic. Defaults to git revision.

`targets` a list of MarkLogic instances to deploy to.

`parallel` run the task in parallel with other tasks.

`manual_trigger` require manual triggering of task in Concourse.

Minimal example

Deployed code will be available at `http://ml.dev.springer-sbm.com:7654/[pipeline name]/[GIT_REVISION]/...`
```yaml
tasks:
- type: deploy-ml-zip
  deploy_zip: target/xquery.zip # zip of xquery files
  targets:                      # list of MarkLogic instances to deploy to
  - ml.dev.springer-sbm.com
```

Complete example

Deployed code will be available at `http://ml.dev.springer-sbm.com:7654/example-app/v1/...`
```yaml
- type: deploy-ml-zip
  name: deploy xquery - dev     # optional. defaults to auto-generated name
  deploy_zip: target/xquery.zip # zip of xquery files
  app_name: example-app         # optional. defaults to pipeline name
  app_version: v1               # optional. defaults to GIT_REVISION
  targets:                      # list of MarkLogic instances to deploy to
  - ml.dev.springer-sbm.com
  - ml.qa1.springer-sbm.com
  - ml.write.live.sl.i.springer.com
  parallel: false               # optional. default false
  manual_trigger: false         # optional. default false
```

### deploy-ml-modules

This task deploys a version of the shared [ml modules library](https://github.com/springernature/ml) from [artifactory](https://springernature.jfrog.io/springernature/simple/libs-release-local/com/springer/ml-modules/)

Schema
```yaml
- type: deploy-ml-modules
  name: optional(string)
  ml_modules_version: required(string)
  app_name: optional(string, default=pipeline name)
  app_version: optional(string, default=$GIT_REVISION)
  targets: required(list(string))
  parallel: optional(bool, default=false)
  manual_trigger: optional(bool, default=false)
```

`name` overrides the default task name shown in the Concourse interface.

`ml_modules_version` version of published artifact in [artifactory](https://springernature.jfrog.io/springernature/simple/libs-release-local/com/springer/ml-modules/).

`app_name` the app name in MarkLogic. Defaults to the name of the pipeline.

`app_version` the app version in MarkLogic. Defaults to git revision.

`targets` a list of MarkLogic instances to deploy to.

`parallel` run the task in parallel with other tasks.

`manual_trigger` require manual triggering of task in Concourse.

Minimal example

Deployed code will be available at `http://ml.dev.springer-sbm.com:7654/[pipeline name]/[GIT_REVISION]/...`
```yaml
tasks:
- type: deploy-ml-modules
  ml_modules_version: "2.1428"  # version in artifactory
  targets:                      # list of MarkLogic instances to deploy to
  - ml.dev.springer-sbm.com
```

Complete example

Deployed code will be available at `http://ml.dev.springer-sbm.com:7654/example-app/v1/...`
```yaml
- type: deploy-ml-modules
  name: deploy xquery - dev     # optional. defaults to auto-generated name
  ml_modules_version: "2.1428"  # version in artifactory
  app_name: example-app         # optional. defaults to pipeline name
  app_version: v1               # optional. defaults to GIT_REVISION
  targets:                      # list of MarkLogic instances to deploy to
  - ml.dev.springer-sbm.com
  - ml.qa1.springer-sbm.com
  - ml.write.live.sl.i.springer.com
  parallel: false               # optional. default false
  manual_trigger: false         # optional. default false
```


### Parallel Tasks

By default tasks are run in serial top to bottom, with each task only running if the previous task was successful. Two or more adjacent tasks can be configured to run in parallel by setting `parallel: true`.

Example
```yaml
tasks:
- type: run
  name: build
  ...
- type: deploy-cf
  name: deploy to dev
  parallel: true
  ...
- type: deploy-cf
  name: deploy to QA
  parallel: true
  ...
- type: deploy-cf
  name: deploy live
  ...
```

This would create a pipeline that runs the build, then deploys to dev and QA in parallel, and then - if both tasks are successful - will deploy to live.
