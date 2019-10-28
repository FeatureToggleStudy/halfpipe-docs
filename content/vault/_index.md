---
title: Vault
weight: 60
---

See [Getting Started](/getting-started#vault) for installation and login instructions.

As well as the CLI, Vault also has a web interface: [vault.halfpipe.io](https://vault.halfpipe.io/ui/vault/auth?with=github)

## Provided secrets

Since we are so nice, we have pre-populated some secrets in Vault for each team. To read them:
```
vault list /springernature/<YOUR-TEAM>
vault list /springernature/shared
vault read /springernature/<YOUR-TEAM>/cloudfoundry
```

### Cloud Foundry
`/springernature/<YOUR-TEAM>/cloudfoundry` contains `username`, `password`, `api-dev`, `api-live`, `api-gcp`. `api-snpaas`. These secrets are used as default values by the `deploy-cf` task.

### Concourse 
`/springernature/<YOUR-TEAM>/concourse` contains `username`, `password`, `team` and `host`. These secrets can be used to login to Concourse with basic auth.

### Artifactory
`/springernature/shared/artifactory` contains `username`, `password` and `host`. These secrets can be used to access our [Artifactory](/artifactory) instance.

### Halfpipe GitHub 
`/springernature/shared/halfpipe-github` contains `private_key`. This is the default private key for git cloning.

### Halfpipe GCR 
`/springernature/shared/halfpipe-gcr` contains `private_key`. This can be used to push and pull from our private Docker Registry that is hosted at https://eu.gcr.io/halfpipe-io

## Writing Secrets

You can store your own secrets under your team path `/springernature/<YOUR-TEAM>/...`.

See `vault write -h` for full details!

```
$ vault write /springernature/engineering-enablement/ee-rocks for=sure another=key
Success! Data written to: springernature/engineering-enablement/ee-rocks
$ vault read /springernature/engineering-enablement/ee-rocks
Key             	Value
---             	-----
refresh_interval	768h0m0s
for             	sure
another                 key
```

Note: If you want to write several keys into the secret map, you need to it all in one operation.
`vault write` overrides all the keys that existed before!

The web interface can also be used to manage secrets: <https://vault.halfpipe.io>

## Secrets in Concourse

Secrets can be referenced in the Halfpipe manifest or in Concourse pipelines using the syntax `((<map>.<key>))`.

If you have a pipeline `P` in team `T` and that pipeline uses the secret `((secretMap.secretKey))` concourse will try to resolve the value at the following paths, in order of precedence:

`/springernature/T/P/secretMap`<br>
`/springernature/T/secretMap`<br>
`/springernature/shared/secretMap`

So if you get an error from the halfpipe cli telling you that the secret cannot be found this would be solved by either

`vault write /springernature/T/P/secretMap secretKey=superSecret`<br>
or<br>
`vault write /springernature/T/secretMap secretKey=superSecret`
