---
title: "Overview"
weight: 5
---

## What is Halfpipe?

Halfpipe is a CLI tool that allows you to create complex Concourse pipelines based on a simple yaml configuration.

Halfpipe pipelines can do 5 main things:

* Run scripts, like `test.sh`, `ci/build.sh` etc. Your imagination is the limiting factor here.
* Deploy to Cloud Foundry
* Build and push Docker images
* Run auto-pipeline style CDC tests
* Deploy MarkLogic modules

A core design philosophy is that there is **no** runtime resolving or configuration!


### Halfpipe Manifest

The manifest file `.halfpipe.io` (or `.halfpipe.io.yml` if you prefer) is where all configuration for the pipeline goes. A simple pipeline that runs tests and then deploys to Cloud Foundry might look like something like this:

```yaml
team: my-team
pipeline: my-pipeline

tasks:
- type: run
  script: ./test
  docker:
    image: openjdk:8-jdk-slim
- type: deploy-cf
  api: ((cloudfoundry.api-snpaas))
  space: live
```

### Halfpipe CLI

The halfpipe CLI's main job it to convert the halfpipe manifest file into a valid Concourse pipeline. It checks your project for lots of common configuration errors to give immediate feedback and minimise the dreaded `commit -> wait -> build fails -> commit fix` loop.

The CLI also makes uploading pipelines to Concourse easy with the `halfpipe upload` command. This command is a shortcut for generating the pipeline file and then using `fly` to login to Concourse and set the pipeline.


### Concourse

[Concourse](https://concourse-ci.org/) is an open-source CI system where **everything** runs in ephemeral Docker containers. Concourse has its own CLI called `fly` and a web interface at https://concourse.halfpipe.io.

If you have complex needs that cannot be fulfilled by Halfpipe, you can always hand-craft the pipeline, like a true artisan, with the help of the [Concourse Docs](https://concourse-ci.org/) and upload it with the CLI!


### Vault

Aah, secrets management. Don't we all hate it? Doesn't have to be that way! HashiCorp Vault helps us easily store and read secrets in such a way that **only you** and **your team** can read it.. oh and Concourse of course.. :)


### Team Based Access

Authentication with Concourse and Vault uses GitHub OAuth. A team is defined and managed in Github, with a corresponding team in Concourse and sub-directory in Vault. This means that if you want to see pipelines and secrets for `team X`, your GitHub user must be part of the `team X` GitHub team.


### Sample projects
We have a curated list of [sample applications](https://github.com/springernature/halfpipe-examples), and here are a bunch of [projects that use Halfpipe](https://github.com/search?q=org%3Aspringernature+filename%3A.halfpipe&type=Code).
