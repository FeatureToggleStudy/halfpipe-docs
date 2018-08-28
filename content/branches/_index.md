---
title: Branches
weight: 41
---

## WIP

Please note that branch support is currently under active development and the support for it is basic!
If you run into any problems or have use cases that are not covered do not hesitate to contact us.

## Magic

There is **no** magic involved.

This means that if you have a branch that deploys to CF and you have not updated the name and routes in CF manifest on
any of the branches that have a pipeline configured you **will** run into a situation where multiple pipelines will 
deploy to the same app name, with the same routes.


## Usage

### halfpipe

`repo.branch` is a required field if you are on any other branch than master and the linter will check that
the field is equal to the branch you are on.

If you execute `halfpipe` on a branch and the linter passes the rendered concourse pipeline will be configured to track the branch
configured under `repo.branch` in the `.halfpipe.io` manifest.


### halfpipe upload

If you execute `halfpipe upload` it works just like normal with two exception

* There will be two security questions to make sure you don't do any mistakes. 
* the name of the pipeline in concourse which will be `$PIPELINE-$BRANCH` where 
  * `$PIPELINE` comes from the `pipeline` field in the `.halfpipe.io` manifest.
  * `$BRANCH` comes from the `repo.branch` field in the `.halfpipe.io` manifest.
  
  
## Example.

[Our example repo](https://github.com/springernature/halfpipe-examples/tree/add-cool-feature/nodejs) contains an example that deploys to cf from a branch.
to CF. [Here is a diff between the it and master](https://github.com/springernature/halfpipe-examples/compare/master...add-cool-feature)

