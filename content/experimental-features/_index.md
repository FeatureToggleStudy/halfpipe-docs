---
title: Experimental Features
weight: 140
---

## Auto Updating Pipelines
```
feature_toggles:
- update-pipeline
```
See [Auto Updating Pipelines](/auto-updating-pipelines/)


## Docker Decompose
```
feature_toggles:
- docker-decompose
```

This is a performance optimisation to mitigate the issue that images used in docker-compose are not cached on the Concourse workers.

When `docker-decompose` is enabled, halfpipe will try to convert `docker-compose` tasks into `run` tasks. It will check that the docker-compose file has only one service defined, and that the `working_dir` is set to the same dir as the halfpipe manifest (e.g. not the root of a mono-repo). If these checks fail then halfpipe will leave it as a `docker-compose` task.
