---
title: Halfpipe CLI
weight: 30
---

## Install
Download the latest cli and put it on your `$PATH`

<https://github.com/springernature/halfpipe/releases/latest>

For example..
```
install ~/Downloads/halfpipe /usr/local/bin
```

## Usage

Simply execute `halfpipe` in the root of your project. If there is a `.halfpipe.io` file and the linters pass it will spit out a Concourse pipeline definition for you!

```
$ cd /Projects/my-project
$ halfpipe > pipeline.yml
```

And there you have it, a Concourse pipeline \o/

To upload it make sure you have logged in with fly then simply.

```
fly -t your-target set-pipeline -p name-of-your-pipeline -c pipeline.yml
```

You can generate and upload the pipeline without saving the intermeditate pipeline YAML file by using the command:

```
halfpipe upload
```
