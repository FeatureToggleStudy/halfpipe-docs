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

To generate the pipeline and upload to Concourse run this command from the root of your project (the same directory where your halfpipe manifest is):

```
halfpipe upload
```

This is the same as first generating the pipeline and uploading it with fly:

```bash
halfpipe > pipeline.yml
fly -t <TARGET_NAME> login -c https://concourse.halfpipe.io -n <TEAM_NAME>
fly -t <TARGET_NAME> set-pipeline -p name-of-your-pipeline -c pipeline.yml
```
`TARGET_NAME` is a label you decide on for this login. Normally it is best to use the same as TEAM_NAME

`TEAM_NAME` is the team in Concourse and GitHub
