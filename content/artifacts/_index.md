---
title: Artifacts
weight: 100
---

## Download an artifact from a build locally

When a pipeline has a task that specifies a save_artifacts, these files will at the end of the job be tarred up and uploaded to a google cloud bucket.
The name of the object will be `YOUR-TEAM/YOUR-PIPELINE-NAME/GIT-SHA` where GIT-SHA is the SHA that was used to trigger your pipeline.

## Before you start

If you want to download artifacts locally first make sure you have [Google Cloud SDK](https://cloud.google.com/sdk/docs/) installed. Note that your Python version __MUST__ be `2.7`. If your system version is 3 you can use `pyenv` to use `2.7`.

Once you have the sdk installed you have to authenticate with google, this only needs to be done once.

```
$ vault read -field=private_key /springernature/YOUR-TEAM/gcr > /tmp/key.json
$ gcloud auth activate-service-account --key-file=/tmp/key.json
Activated service account credentials for: [halfpipe-gcr-account@halfpipe-io.iam.gserviceaccount.com]
```

## Enough setup already, let me download an artifact

```
$ gsutil cp gs://halfpipe-io-artifacts/YOUR-TEAM/PIPELINE/GIT-SHA .
$ tar -zxvf GIT-SHA
```

A convenient way of getting the path to the object is to check in the Concourse UI.

![artifact-info](/images/artifact-info.png)
