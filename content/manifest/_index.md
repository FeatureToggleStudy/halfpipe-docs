---
title: Halfpipe Manifest
weight: 40
---

Everything in halfpipe is configured in what we call the manifest.

The manifest must

* Be called `.halfpipe.io` or `.halfpipe.io.yml`
* Be placed inside a git repository
* Be valid YAML.


You can get started with a new manifest file by running the command `halfpipe init` inside a git repository.


__Schema__
```yaml
team: required(string)
pipeline: required(string)
slack_channel: optional(string regex '#.+')
triggers: optional(list(trigger)
artifact_config: optional(artifact_config)
feature_toggles: optional(list(string))
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
The optional field `slack_channel` can be set to enable a notification when any of the tasks fail. Must be a quoted as `#` is the mark of a comment in YAML.

__Schema__
```yaml
slack_channel: optional(string regex '#.+')
```

__Example__
```yaml
slack_channel: "#ci-alerts"
```

## triggers

The top level list `triggers` defines what the pipeline should trigger on.

__Schema__
```yaml
triggers:
- type: required(string, git|timer|docker|pipeline)
  ...   [ task specific options ]
```

`type` must be one of the supported task types: `git`, `timer`, `docker`, `pipeline`

__Example__
```yaml
triggers:
- type: git
  ...                # git specific options
- type: timer
  ...                # timer specific options
```

### git
The optional trigger `git` defines which git repo halfpipe will operate on.

__Schema__
```yaml
- type: git
  uri: optional(string, default=resolved from the .git/config within the repo you are executing halfpipe in)
  private_key: optional(string, default="((github.private_key))")
  git_crypt_key: optional(string)
  watched_paths: optional([]string)
  ignored_paths: optional([]string)
  branch: optional(string)
  shallow: optional(bool, default=false)
  manual_trigger: optional(bool, default=false)
```

`uri` controls the git repo the pipeline is operating on, if you leave this field blank halfpipe will try to resolve the uri for you.

`private_key` allows you to specify the private key to use when cloning the repo.

`watched_paths` and `ignored_paths` takes a list of globs or paths. This allows a pipeline to only trigger when there has been changes to a set of predefined paths, or to stop changes to certain paths from triggering the pipeline.

`git_crypt_key` can be used to unlock a encrypted repository. To use this you must base64 encode your git-crypt key and put it in vault and reference it.

`branch` configures the branch that the pipeline will track. This is optional on master but *must* be configured if executing halfpipe on a branch.

`shallow` configures if the repo should be shallow cloned, `git clone ... --depth 1`. This is helpful if your repo is large and you dont need the full history.

`manual_trigger` turns off triggering on commits. Useful where we just want the latest git source but trigger from a `timer` or `docker`.

__Examples__
```yaml
# Override the default uri and private key
triggers:
- type:git
  uri: git@github.com:org/repo.git
  private_key: ((repo-name.private-key))
```
```yaml
# Only trigger the pipeline when there has been changes
# in the `src/main` folder, and unlock the encrypted repo.
# Furthermore clone the repo as shallow.
triggers:
- type:git
  uri: git@github.com:organisation/repo-name.git
  private_key: ((repo-name.private-key))
  git_crypt_key: ((git-crypt-keys.repo-name))
  watched_paths:
  - src/main
  shallow: true
```

### timer

The optional trigger `timer` can be set to run the pipeline on a timer. The expression must be a valid cron expression:
[Online Cron Tester](https://crontab.guru/)


__Schema__
```yaml
- type: timer
  cron: required(string cron expression)
```

__Example__
```yaml
- type: timer
  cron: "*/10 * * * 1-5"
```

### docker
The optional trigger `docker` can be set to run the pipeline when a docker image has been updated.

__Schema__
```yaml
- type: docker
  image: required(string)
  username: optional(string)
  password: optional(string)
```

__Example__
```yaml
- type: docker
  image: "eu.gcr.io/halfpipe-io/halfpipe-example-docker"
```

### pipeline
The optional trigger `pipeline` can be set to trigger a pipeline when a another pipeline/job has succeeded.

Note that you cannot trigger on pipelines from another team.

__Schema__
```yaml
- type: pipeline
  pipeline: required(string)
  job: required(string)
  status: optional(string, succeeded|failed|errored|aborted, default="succeeded")
```

__Example__
```yaml
- type: pipeline
  pipeline: my-cool-pipeline
  job: Deploy to Live (SNPaaS)
  status: failed
```

## artifact_config
By default all artifacts saved and retrieved will be placed in a shared Google bucket.

The optional top level dict `artifact_config` dictates what bucket will be used when storing and retrieving artifacts. This is useful if your project have strict security requirements.

__Schema__
```yaml
artifact_config:
  bucket: required(string)
  json_key: required(string)
```

`bucket` controls the bucket in Google cloud that will be used for storing artifacts.

`json_key` is the JSON key for a service account that have read/write rights to the bucket.

To use this feature

* Create your bucket.
* Create a service account.
* Create a JSON key for the service account.
* Save the key in vault under a path and make sure it looks similar to the key under `/springernature/shared/halfpipe-gcr`.
* Make sure you grant the service account `Storage Legacy Bucket Owner` permission on the bucket.

__Examples__
```yaml
# Override the artifact configuration
artifact_config:
  bucket: ((artifactConfig.bucket))
  private_key: ((artifactConfig.json_key))
```

## feature_toggles
This list of strings turns on experimental features.

## Tasks
The top level dict `tasks` dictates what halfpipe should do.

__Schema__
```yaml
tasks:
  - type: required(string)
    name: optional(string)
    ...      [ task specific options ]
```

`type` must be one of the supported task types: `run`, `docker-compose`, `deploy-cf`, `docker-push` or `consumer-integration-test`.

`name` is an optional name for the task, which will be displayed in the Concourse interface.

__Example__
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

__Schema__
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
  save_artifacts_on_failure: optional(list(string))
  restore_artifacts: optional(bool, default=false)
  privileged: optional(bool, default=false)
  retries: optional(int, default=0)
  notify_on_success: optional(bool, default=false)
  notifications: optional(notifications)
  timeout: optional(duration, default="1h")
```

`script` is a path to a shell script to be executed relative to `.halfpipe.io` file. Alternatively if you want to run a system command prefix the command with `\`, i.e `\make`.

`docker` is a hashmap that has the following fields:
  `image` is the image that the run script will run inside. If it is a public repo, this is all you need.
  If it is pointing to a private docker registry, the fields `username` and `password` are required.

  We provide the Google Container Registry for halfpipe projects. If you are pointing to any docker image on `eu.gcr.io/halfpipe-io/`, username and password are not needed.

`vars` is a hashmap of environment variables that will be available to the `script`.

`save_artifacts` is a list of paths to directories or files that you want to make available to future tasks. For example, an artifact created by a build task which you want to deploy. Use `.` to save the entire working directory (e.g. for node.js or ruby apps). See `deploy_artifact` in the `deploy-cf` task for using a saved artifact.

`save_artifacts_on_failure` is a list of paths to directories or files that you want to save if the provided script fails. This is useful for test reports and such.

`restore_artifacts` restores all previously saved artifacts into the working dir of the job. I.e if you have saved `build/my/thing` and `some/other/path` in a run/docker-compose task, and you set `restore_artifacts: true` in a subsequent task the files `build/my/thing` and `some/other/path` will be present.

`privileged` run the task as root. not recommended but sometimes necessary e.g. when using docker-in-docker

`retries` the number of times the task will be retried if it fails.

`notify_on_success` sends a message to the top level defined `slack_channel` if this task succeeds.

`notifications` please see [slack-notifications](#slack-notifications)


`timeout` sets the timeout for task. If a command does not finish within this timeframe the task will fail.

__Examples__
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
    MY_SECRET: ((myapp.my-secret-in-vault))
  save_artifacts:
  - target/distribution/artifact.zip
  save_artifacts_on_failure:
  - testReports
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

__Schema__
```yaml
- type: docker-compose
  name: optional(string)
  service: optional(string, default='app')
  command: optional(string)
  compose_file: optional(string, default='docker-compose.yml')
  manual_trigger: optional(bool, default=false)
  vars: optional(hashmap(string, string))
  save_artifacts: optional(list(string))
  save_artifacts_on_failure: optional(list(string))
  restore_artifacts: optional(bool, default=false)
  retries: optional(int, default=0)
  notify_on_success: optional(bool, default=false)
  notifications: optional(notifications)
  timeout: optional(duration, default="1h")
```

`service` the name of the docker-compose.yml service to run.

`command` if specified then this command will be run against the service; otherwise the default command for the service will be executed.

`compose_file` optional path to docker-compose file. defaults to `docker-compose.yml`.

`vars` is a hashmap of environment variables that will be available to docker-compose.

`save_artifacts` see the `run` task for description.

`restore_artifacts` see the `run` task for description.

`save_artifacts_on_failure` see the `run` task for description.

`retries` the number of times the task will be retried if it fails.

`notify_on_success` sends a message to the top level defined `slack_channel` if this task succeeds.

`notifications` please see [slack-notifications](#slack-notifications)

`timeout` sets the timeout for task. If a command does not finish within this timeframe the task will fail.

__Examples__
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
    MY_SECRET: ((my-app.my-secret-in-vault))
```

### deploy-cf
deploy-cf is used to deploy an app to Cloud Foundry with zero downtime.

[Here you can find more information](/cf-deployment/) about how deploy-cf works under the hood!

__Schema__
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
  manifest: optional(string, default="manifest.yml")
  vars: optional(hashmap(string, string))
  deploy_artifact: optional(string)
  pre_promote: optional(list(run-task))
  pre_start: optional(list(string))
  retries: optional(int, default=1)
  notify_on_success: optional(bool, default=false)
  notifications: optional(notifications)
  timeout: optional(duration, default="1h")
```

`api` is the CF api endpoint to target. See [default values in vault](/cf-deployment/#default-values-in-vault) for how this affects default values for `username`, `password` and `org`.

`org` is the CF organisation. Defaults to the value of the top level key `team` or `((cloudfoundry.org-snpaas))` depending on the CF api set.

`vars` is a hash map of environment variables that will be available to the `app` in CF.

`test_domain` sets the domain that should be used when pushing the app as a candidate. By default this is derived for you based on the API you use.

`deploy_artifact` the path to a file or directory to push to CF, which has been saved in a previous `run` or `docker-compose` task with `save_artifacts`. The path must be relative to the `.halfpipe.io` file.

`manifest` defaults to `manifest.yml`, relative to the `.halfpipe.io` file. If you have generated a manifest in a previous task that you wish to you you must use the path `../artifacts/<path-to-saved-manifest>`.

`pre_promote` is a list of run tasks, that will be executed after the app has been deployed as a candidate but before the app gets promoted to live. The pre promote jobs will get the environment variable `TEST_ROUTE` injected with the route to the candidate app.

`pre_start` is an optional list of cf commands to run as part of [cf halfpipe-push](/cf-deployment/#what-happens-in-concourse) immediately before the candidate app is started. Useful for applying configuration that is not supported in the CF manifest. e.g. `cf add-network-policy ...`

`timeout` sets the timeout for task. If a command does not finish within this timeframe the task will fail.

`retries` the number of times the task will be retried if it fails.

`notify_on_success` sends a message to the top level defined `slack_channel` if this task succeeds.

`notifications` please see [slack-notifications](#slack-notifications)


In your team's vault you will find the map `cloudfoundry` containing entries for our Cloud Foundry environments. See [default values in vault](/cf-deployment/#default-values-in-vault) for more information about how optional parameters are set to default values.

__Examples__
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
    APP_SECRET: ((myapp.app_secret_name))
  deploy_artifact: target/distribution/artifact.zip
  pre_start: 
  - cf add-network-policy myapp-CANDIDATE --destination-app myapp-CANDIDATE --protocol tcp --port 7600
  - cf events myapp-CANDIDATE
  pre_promote:
  - type: run
    name: run-smoke-tests
    script: ./smoke.sh
    docker:
      image: alpine
```

### docker-push
Allows you to build a Docker image and push it to a docker registry
The docker image will be tagged with the `latest` tag by default.

__Schema__
```yaml
- type: docker-push
  name: optional(string)
  dockerfile_path: optional(string, default="Dockerfile")
  build_path: optional(string, default=working directory)
  manual_trigger: optional(bool, default=false)
  username: optional(string)
  password: optional(string)
  image: required(string)
  restore_artifacts: optional(bool, default=false)
  retries: optional(int, default=0)
  notify_on_success: optional(bool, default=false)
  notifications: optional(notifications)
  timeout: optional(duration, default="1h")
  vars: optional(hashmap(string, string))
```
`dockerfile_path` path to Dockerfile, relative to the .halfpipe.io file.

`build_path` path to folder to build docker iamge in, relative to .halfpipe.io file.

`restore_artifacts` see the `run` task for description.

`retries` the number of times the task will be retried if it fails.

`notify_on_success` sends a message to the top level defined `slack_channel` if this task succeeds.

`notifications` please see [slack-notifications](#slack-notifications)


`timeout` sets the timeout for task. If a command does not finish within this timeframe the task will fail.

`vars` is a hash map of Docker build-time variables. These will be available as environment variables during the Docker build.

Example using the [Halfpipe Private Registry](/docker-registry/) - username and password are not required.

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

Example using relative paths for build dir and Dockerfile
```yaml
- type: docker-push
  name: push to docker hub
  build_path: buildFolder
  dockerfile_path: ../ops/dockerfiles/Dockerfile
  username: myusername
  password: ((my.password))
  image: myusername/your-image-name
```

To tag the docker image with the build version, enable the `update-pipeline` feature toggle.
```yaml
feature_toggles:
- update-pipeline
```

### consumer-integration-test

This task is designed to run in a `producer's` pipeline. It helps running a `consumer's` legacy app-anatomy/auto-pipeline style CDC tests.

For more information about migrating CDCs from auto-pipelines see [legacy CDCs](/legacy-cdcs)

__Schema__
```yaml
- type: consumer-integration-test
  name: optional(string)
  consumer: required(string)
  consumer_host: required(string)
  provider_host: optional(string, default=$TEST_ROUTE)
  script: required(string)
  docker_compose_service: optional(string, default="code")
  git_clone_options: optional(string, default="")
  vars: optional(hashmap(string, string))
  retries: optional(int, default=0)
  notify_on_success: optional(bool, default=false)
  notifications: optional(notifications)
  timeout: optional(duration, default="1h")
```

`name` overrides the default task name shown in the Concourse interface.

`consumer` is the SpringerNature GitHub repository name, with optional sub-directory for apps in a monorepo. e.g. `repo-name` or `monorepo-name/dir`.

`consumer_host` is the address of the consumer application in the same environment as the provider.

`provider_host` is the address of the provider application to test. This field will default to `$TEST_ROUTE` when the task is part of the `pre_promote` stage of `deploy-cf`.

`script` is the consumer's test script to execute

`docker_compose_service` is the service name in the consumer's docker-compose. Defaults to `code`.

`git_clone_options` custom options for the `git clone` of the consumer repository. e.g. `--depth 100`. For valid options see <https://git-scm.com/docs/git-clone>.

`vars` is a hashmap of environment variables that will be available to the docker-compose service used for the task

`retries` the number of times the task will be retried if it fails.

`notify_on_success` sends a message to the top level defined `slack_channel` if this task succeeds.

`notifications` please see [slack-notifications](#slack-notifications)


`timeout` sets the timeout for task. If a command does not finish within this timeframe the task will fail.

__Examples__

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

__Schema__
```yaml
- type: deploy-ml-zip
  name: optional(string)
  deploy_zip: required(string)
  app_name: optional(string, default=pipeline name)
  app_version: optional(string, default=$GIT_REVISION)
  use_build_version: optional(bool, default=false)
  targets: required(list(string))
  manual_trigger: optional(bool, default=false)
  retries: optional(int, default=0)
  notify_on_success: optional(bool, default=false)
  notifications: optional(notifications)
  timeout: optional(duration, default="1h")
```

`name` overrides the default task name shown in the Concourse interface.

`deploy_zip` path to zip containing xquery source files. Usually created in a build task and included in `saved_artifacts`.

`app_name` the app name in MarkLogic. Defaults to the name of the pipeline.

`app_version` the app version in MarkLogic. Defaults to git revision. Cannot be set if `use_build_version` is set to `true`.

`use_build_version` use `$BUILD_VERSION` set by the [update-pipeline feature](/experimental-features/#version) instead of `$GIT_REVISION`. Cannot be set if `app_version` is set.

`targets` a list of MarkLogic instances to deploy to.

`manual_trigger` require manual triggering of task in Concourse.

`retries` the number of times the task will be retried if it fails.

`notify_on_success` sends a message to the top level defined `slack_channel` if this task succeeds.

`notifications` please see [slack-notifications](#slack-notifications)


`timeout` sets the timeout for task. If a command does not finish within this timeframe the task will fail.

__Minimal example__

Deployed code will be available at `http://marklogic.host:7654/[pipeline name]/[GIT_REVISION]/...`
```yaml
tasks:
- type: deploy-ml-zip
  deploy_zip: target/xquery.zip # zip of xquery files
  targets:                      # list of MarkLogic instances to deploy to
  - marklogic.host
```

__Complete example__

Deployed code will be available at `http://<marklogic.host>:7654/example-app/v1/...`
```yaml
- type: deploy-ml-zip
  name: deploy xquery - dev     # optional. defaults to auto-generated name
  deploy_zip: target/xquery.zip # zip of xquery files
  app_name: example-app         # optional. defaults to pipeline name
  app_version: v1               # optional. defaults to GIT_REVISION
  targets:                      # list of MarkLogic instances to deploy to
  - marklogic.dev.host
  - marklogic.qa.host
  - marklogic.live.host
  manual_trigger: false         # optional. default false
```

### deploy-ml-modules

This task deploys a version of the shared [ml modules library](https://github.com/springernature/ml) from [artifactory](https://springernature.jfrog.io/springernature/simple/libs-release-local/com/springer/ml-modules/)

The task fetches the artifact from the [hosted Artifactory](/artifactory) and *not the old internal artifactory*.

[List of available versions](https://springernature.jfrog.io/springernature/simple/libs-release-local/com/springer/ml-modules/)

Basic auth credentials are provided in vault `vault read springernature/shared/artifactory`.

__Schema__
```yaml
- type: deploy-ml-modules
  name: optional(string)
  ml_modules_version: required(string)
  app_name: optional(string, default=pipeline name)
  app_version: optional(string, default=$GIT_REVISION)
  use_build_version: optional(bool, default=false)
  targets: required(list(string))
  manual_trigger: optional(bool, default=false)
  retries: optional(int, default=0)
  notify_on_success: optional(bool, default=false)
  notifications: optional(notifications)
  timeout: optional(duration, default="1h")
```

`name` overrides the default task name shown in the Concourse interface.

`ml_modules_version` version of published artifact in [artifactory](https://springernature.jfrog.io/springernature/simple/libs-release-local/com/springer/ml-modules/).

`app_name` the app name in MarkLogic. Defaults to the name of the pipeline.

`app_version` the app version in MarkLogic. Defaults to git revision. Cannot be set if `use_build_version` is set to `true`.

`use_build_version` use `$BUILD_VERSION` set by the [update-pipeline feature](/experimental-features/#version) instead of `$GIT_REVISION`. Cannot be set if `app_version` is set.

`targets` a list of MarkLogic instances to deploy to.

`manual_trigger` require manual triggering of task in Concourse.

`retries` the number of times the task will be retried if it fails.

`notify_on_success` sends a message to the top level defined `slack_channel` if this task succeeds.

`notifications` please see [slack-notifications](#slack-notifications)


`timeout` sets the timeout for task. If a command does not finish within this timeframe the task will fail.

__Minimal example__

Deployed code will be available at `http://<marklogic.host>:7654/[pipeline name]/[GIT_REVISION]/...`
```yaml
tasks:
- type: deploy-ml-modules
  ml_modules_version: "2.1428"  # version in artifactory
  targets:                      # list of MarkLogic instances to deploy to
  - marklogic.host
```

__Complete example__

Deployed code will be available at `http://<marklogic.host>:7654/example-app/v1/...`
```yaml
- type: deploy-ml-modules
  name: deploy xquery - dev     # optional. defaults to auto-generated name
  ml_modules_version: "2.1428"  # version in artifactory
  app_name: example-app         # optional. defaults to pipeline name
  app_version: v1               # optional. defaults to GIT_REVISION
  targets:                      # list of MarkLogic instances to deploy to
  - marklogic.dev.host
  - marklogic.qa.host
  - marklogic.live.host
  manual_trigger: false         # optional. default false
```

### parallel

This task enables you to run tasks in parallel.

__Schema__
```yaml
- type: parallel
  tasks: required(list(task))
```

__Example__
```yaml
tasks:
- type: run
  name: build
  ...
- type: parallel
  tasks:
  - type: deploy-cf
    name: deploy to dev
    ...
  - type: deploy-cf
    name: deploy to QA
    ...
- type: parallel
  tasks:
  - type: deploy-cf
    name: deploy live staging
    ...
  - type: deploy-cf
    name: deploy live
```

This would create a pipeline that runs the build, then deploys to dev and QA in parallel, and then - if both tasks are successful - will deploy to live-staging and live in parallel.

### sequence

This task enables you to run tasks in sequence.

It can only be used inside a parallel task!

__Schema__
```yaml
- type: sequence
  tasks: required(list(task))
```

__Example__
```yaml
tasks:
- type: run
  name: a
- type: parallel
  tasks:
  - type: sequence
    tasks:
    - type: run
      name: b1
    - type: run
      name: b2
  - type: sequence
    tasks:
    - type: run
      name: c1
    - type: run
      name: c2
    - type: run
      name: c3
  - type: run
    name: d
- type: run
  name: e
```

This would create a pipeline that looks like
```
       +----b1----b2----\                            
       |                 \                           
       |                  \                          
 a-----|----c1----c2----c3 ----e                     
       |                  /                          
       |                 /                           
       +----d-----------/    
```
 
i.e after `a` has run `b1`, `c1`, `d` will all start to execute in parallel. After `b1` has finished `b2` will start executing. After `c1` has finished `c2` then finally `c3` will execute. Once `b2`, `c3` and `d` have finished `e` will start executing.

## Slack notifications

Sometimes you might need more fine grained controls over the slack notifications. In this case you can use the `notifications` configuration in your tasks.

Note that if you set this it will override the normal notification behaviour for the task.

__Schema__
```yaml
notifications:
  on_success: optional(list(string), default=[])
  on_success_message: optional(string, default="Pipeline PIPELINE-NAME, task TASK-NAME succeeded URL")
  on_failure: optional(list(string), default=[])
  on_failure_message: optional(string, default="Pipeline PIPELINE-NAME, task TASK-NAME failed URL")
```

`on_success` configures which slack channels should be notified with the `on_success_message` if the task succeeds.

`on_failure` configures which slack channels should be notified with the `on_failure_message` if the task fails.
