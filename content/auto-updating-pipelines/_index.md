---
title: Auto Updating Pipelines
weight: 82
---

This feature inserts an initial job into the pipeline that updates the pipeline configuration based on the halfpipe manifest in the git repository.

With this feature you only need to run `halfpipe upload` once to initially create the pipeline. After that it will update automatically on every commit.

### feature toggle

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

If halfpipe update added any new tasks, existing versions of the `version` resource will be disabled. This prevents new tasks running immediately at the previous version (e.g. if you added a new task at the end of the pipeline it will not be triggered for the previous build).
