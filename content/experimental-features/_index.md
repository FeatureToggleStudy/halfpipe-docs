---
title: Experimental Features
weight: 140
---

## Auto Updating Versioned Pipelines

This feature inserts an initial job into the pipeline that updates the pipeline configuration based on the halfpipe manifest in the git repository.

With this feature you only need to run `halfpipe upload` once to initially create the pipeline. After that it will update automatically on every commit.


```yaml
feature_toggles:
- update-pipeline
```

The pipeline will now look something like this:

![update-job](/images/update-pipeline/update-job.png)

New commits to the `git` repository will trigger the `update` job which will increment the pipeline `version` and then run `halfpipe` to update the pipeline.

![update-tasks](/images/update-pipeline/update-tasks.png)

From this screen you can easily see the git commit of the version, which is useful if you want to manually trigger an old version (see below).

### version
`version` keeps track of the build version. It is unique to team name + pipeline name and is stored outside concourse so will persist across re-deployments, upgrades, deletion and recreation of pipelines etc. You cannot change it yourself, e.g. to bump major version - it is the version of the pipeline, not your project.

The environment variable `BUILD_VERSION` is set in halfpipe tasks.

If the pipeline configuration is changed by the update job, the `version` resource will be pinned to the new version, this prevents new or modified tasks running at the previous version. You can see this by clicking on the `version` resource and seeing which versions are enabled.

### Manually triggering old versions
Before manually triggering a task, click on the `version` resource and disable all newer versions than the one you want to use. 

![versions](/images/update-pipeline/versions.png)
