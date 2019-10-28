---
title: Halfpipe CLI
weight: 30
---

See [Getting Started](/getting-started#halfpipe) for installation instructions.

The primary function of the halfpipe CLI is to generate a valid Concourse pipeline from your [halfpipe manifest](/halfpipe-manifest). Try running `halfpipe` with no arguments in the same directory as your halfpipe manifest file. If there are no errors or warnings you will see a Concourse pipeline output to STDOUT. If Halfpipe found any issues it will list them and link to documentation to help resolve them.

To see all options run `halfpipe --help`.

### halfpipe upload

`halfpipe upload` is a convenience function that combines a number of steps into one:

1. generate the concourse pipeline
2. use fly to log in to Concourse with fly using the team from the halfpipe manifest
3. use fly to upload the pipeline to Concourse with the name from the halfpipe manifest

If you are using the [update-pipeline](/auto-updating-pipelines/) feature, you will only need to upload the pipeline once, and from then on it will self-update.

### halfpipe init
`halfpipe init` gets a new project started with a template halfpipe manifest file.

### halfpipe migrate
`halfpipe migrate` updates the halfpipe manifest to the latest schema.

### halfpipe sync
`halfpipe sync` updates halfpipe to the latest version.

### halfpipe url
`halfpipe url` prints the url to the pipeline in the Concourse interface. Especially handy: `open $(halfpipe url)`.
