---
title: "Overview"
weight: 5
---

Welcome! Glad you decided to check out Halfpipe!

Would you not love to have a pipeline definition looking like this?

```yaml
team: my-team
pipeline: my-pipeline

tasks:
- type: run
  script: ./build
  docker:
    image: openjdk:8-jdk-slim
- type: deploy-cf
  api: ((cloudfoundry.api-live))
  space: live
```

Now you can!

## What is Halfpipe?

Halfpipe is a project that allows you to create Concourse pipelines and store secrets in Vault. Simple really.

The pipelines can do 5 main things:

* Run scripts, like `test.sh`, `ci/build.sh` etc. Your imagination is the limiting factor here.
* Deploy to Cloud Foundry
* Build and push Docker images.
* Run "CDC's"
* Deploy MarkLogic modules

A core design philosophy is that there is **no** runtime resolving or configuration!

## Components

Halfpipe comprises five different components.

### Manifest

The file `.halfpipe.io` is the place where all configuration for the pipeline goes. It hides itself neatly in the root of the repo, so you won't have to pollute your repo with random (visible) files.

The content is simply YAML, and it looks exactly like the example at the top of this page.

### Halfpipe-cli

We have a cli for your app repo and manifest. The cli's role is to make sure that the repo adheres to some strict rules.

The cli is master of the universe and she's pretty friendly at that.

```text
$ halfpipe
Halfpipe (https://docs.halfpipe.io/manifest/#Manifest)
        Errors:
	        * couldn't find any of the allowed [.halfpipe.io .halfpipe.io.yml .halfpipe.io.yaml] files
```

Whoa, a link with up to date information on how to fix the error? NEAT!

The cli does as much up-front validation as it can for all the features in Halfpipe and checks for all sorts of non-obvious stuff that would result in the good ol' fashion "shit this does not work in CI, let me push a fix real quick" loop

### GitHub Auth

Authentication with Concourse and Vault uses GitHub Oauth.

The way things are structured a "team" corresponds to a team in Github, a team in Concourse and a path in Vault.

This means that if you want to see pipelines and secrets for `project X`, your GitHub user **must** be part of the `project X` GitHub team.

### Concourse

Concourse is a neat CI system where **everything** runs in ephemeral Docker containers.

....The thing is that the pipeline definitions can become a tad verbose and confusing at times. That's why Halfpipe was created.

If you have complex needs that cannot be fulfilled by Halfpipe, you can always hand-craft the pipeline, like a true artisan, with the help of the [Concourse Docs](https://concourse-ci.org/) and upload it with the CLI!

### Vault

Aah, secrets management. Don't we all hate it?

Doesn't have to be that way! HashiCorp Vault helps us easily store and read secrets in such a way that **only you** and **your team** can read it...oh and Concourse of course.. :)

### Some sample projects
We have a curated list of [sample applications](https://github.com/springernature/halfpipe-examples)

And here is a bunch of [projects that use Halfpipe](https://github.com/search?q=org%3Aspringernature+filename%3A.halfpipe&type=Code).
