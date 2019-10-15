---
title: Branches
weight: 41
---

Please note that branch support is quite limited - if you run into any problems or have use cases that are not covered do not hesitate to contact us.

## Generated app name and app routes

Halfpipe **does not** automatically generate app name or routes, so it **will not** prevent conflicts with existing live apps.

This means that if you have a branch that deploys to CF and you have not updated the name and routes in the CF manifests on
any of the branches that have a pipeline configured you **will** run into a situation where multiple pipelines will
deploy to the same app name, with the same routes.


## Usage

### halfpipe

In the [Git trigger](/manifest/#git) you must specify the `branch`. The linter will check that the field matches the branch you are actually on.

```yaml
triggers:
- type: git
  branch: my-branch
```

If you execute `halfpipe` on a branch and the linter passes, the Concourse pipeline will be configured to track the branch
configured under `triggers.git.branch` in the `.halfpipe.io` manifest.


### halfpipe upload

When you execute `halfpipe upload` there will be two questions to help confirm you are not making a mistake:

1. Have you made sure any Cloud Foundry manifests you are using in deploy-cf tasks have different app name and routes than on the master branch? And have you read the docs at https://docs.halfpipe.io/branches [y/N]

    This is to help guard against accidentally creating branch pipelines that would clash with deployments of the master branch.

2. What will be the name of the pipeline in concourse?

    This is to make sure you've read the docs!


### branch pipeline name

The name of the pipeline in concourse will be `$PIPELINE-$BRANCH` where

  * `$PIPELINE` comes from the `pipeline` field in the `.halfpipe.io` manifest.
  * `$BRANCH` comes from the `triggers.git.branch` field in the `.halfpipe.io` manifest.


## Example

[Our example repo](https://github.com/springernature/halfpipe-examples/tree/feature-xyz/nodejs) contains an example that deploys to cf from a branch.
to CF. [Here is a diff between the branch and master](https://github.com/springernature/halfpipe-examples/compare/master...feature-xyz)
