---
title: Docker Registry
weight: 80
---

## Setup
We use the Google Container Registry (`GCR`) as the main private docker registry for Halfpipe projects.
You can also use this registry from your local workstation, to push and pull images. To do so please use the credentials we already provided to you in vault.

Please read about [Vault](https://docs.halfpipe.io/vault) first.

### Docker login
```
$ vault read -field=private_key /springernature/shared/halfpipe-gcr | docker login -u _json_key --password-stdin https://eu.gcr.io
```

### Docker push
```
$ docker build . -t eu.gcr.io/halfpipe-io/[YOUR DOCKER IMAGE NAME]
$ docker push eu.gcr.io/halfpipe-io/[YOUR DOCKER IMAGE NAME]
```

### Docker pull
```
$ docker pull eu.gcr.io/halfpipe-io/[YOUR DOCKER IMAGE NAME]
```

### Example Dockerfile
```
FROM eu.gcr.io/halfpipe-io/[YOUR DOCKER IMAGE NAME]
```

### UI
Accessible with Springer Account: https://console.cloud.google.com/gcr/images/halfpipe-io/EU 

### GCR Auth Issues
There can be authentication issues with GCR on dev machines that also have `gcloud` installed. To reset back to using halfpipe credentials:
```
mv ~/.docker/config.json ~/.docker/config.json.bak
vault read -field=private_key /springernature/shared/halfpipe-gcr | docker login -u _json_key --password-stdin https://eu.gcr.io
```
