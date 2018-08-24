---
title: Development
weight: 130
---

## Repos

### Halfpipe CLI
<https://github.com/springernature/halfpipe>

The halfpipe cli. The meat of the project.

### Halfpipe Website
<https://github.com/springernature/halfpipe-website>

This website, i.e the docs.

### Halfpipe Infrastructure
<https://github.com/springernature/halfpipe-infra>

All the deployment stuff for Halfpipe.

### CloudFoundry deployment
<https://github.com/springernature/halfpipe-cf-plugin>

Our CloudFoundry plugin and Concourse resource to do cool deployments.

### GCP Resource
<https://github.com/springernature/gcp-resource>

Our Concourse resource for uploading and downloading files from a GCP bucket.


### Halfpipe Examples
<https://github.com/springernature/halfpipe-examples>

A mono-repo with some example projects demonstrating different features of Halfpipe.

## Deployment of Halfpipe as a thing.

### CLI

[The pipeline is here](https://concourse.halfpipe.io/teams/engineering-enablement/pipelines/halfpipe-cli)

When we want a new release cut we simply trigger "Bump Major", "Bump Minor", "Bump Patch."

This will build the binaries, tag the commit with the version and upload a new release to Github.

### Concourse / Vault

The `halfpipe-infra` repo is used to setup GCP networks/k8s with terraform.

There is some scripts around automating setup of Concourse and Vault with the use of helm

### DB Migration.

In case we need to do a DB restore, or deploy an entirely new environment from scratch but want to keep the DB there is one thing to keep in mind.

The Vault DB was able to restore from the managed UI in GCP but the Concourse DB was not.

To circumvent this, just download the dump to localhost and restore with psql.

```
psql postgres://username:password@host:port/concourse < path/to/dump
```
