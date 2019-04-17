---
title: Artifacts
weight: 41
---

## Downloading build artifacts

When a pipeline has a task that specifies `save_artifacts` or `save_artifacts_on_failure`, these files will be tarred up and uploaded to a google cloud bucket.
The name of the object will be `<YOUR-TEAM>/<YOUR-PIPELINE-NAME>/<GIT-SHA>` or `<YOUR-TEAM>/<YOUR-PIPELINE-NAME>/<GIT-SHA>-failure` where GIT-SHA is the SHA that was used to trigger your pipeline.

The URL to download the artifacts is shown in the Concourse UI. Downloading requires logging in to GCP as a `springernature.com` user.

You can also browse the files at <https://storage.cloud.google.com/halfpipe-io-artifacts>

![artifact-info](/images/artifact-info.png)

## Browsing a builds artifact in a web UI.

When a build have uploaded an artifact we have a nifty web UI that allows you to browse the content of the tar <https://gcs-proxy.springernature.app>
