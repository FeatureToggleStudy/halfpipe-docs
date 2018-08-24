---
title: Vault
weight: 60
---

## Install CLI

Download the latest Vault client from <https://www.vaultproject.io/downloads.html>

## Login

All authentication with Vault **must** happen with a GitHub token. Be aware that when you have logged in your token will only be valid for 768 hours, after that you will receive a 403 when using the Vault CLI, but this can be solved by periodically running `vault token renew` or by logging in again.

### Acquiring a token

[Create a new GitHub token](https://github.com/settings/tokens/new)

Name it something cool, say `vault` and select `read:org` under `admin:org`.

Save the token somewhere secret on your machine, you can always revoke and regenerate your token if you lose it :)

### Authenticate via the CLI
The vault CLI will use the server defined in the environment variable `VAULT_ADDR`.

```
# in ~/.zshrc, ~/.zshenv ~/.bashrc or your place where you set your environment variables.
$ cat ~/.zshenv | grep VAULT_ADDR
export VAULT_ADDR=https://vault.halfpipe.io
```

Now we can auth!

```
$ vault login -method=github token=....TOKEN_YOU_GOT_FROM_GITHUB....
Successfully authenticated! You are now logged in.
The token below is already saved in the session. You do not
need to "vault auth" again with the token.
token: .....SecretStuff...:)
token_duration: 2764794
token_policies: [default engineering-enablement]
```

### Authenticate via the Web UI

Just click the `Vault` link at the top and authenticate with your GitHub token.

## Pre populated secrets in Vault.

Since we are so nice, we have pre populated some secrets in vault for your pleasure to help with repetative stuff.

### /springernature/YOUR-TEAM/cloudfoundry

The `cloudfoundry` secret contains `username`, `password`, `api-dev`, `api-live`, `api-gcp`. `api-snpaas`. These secrets go very nicely together with the `deploy-cf` task.

### /springernature/YOUR-TEAM/github

The `github` secret contains `private_key`. This is the default private key for git unless you override it so you can clone a git repo without faffing around with deploy keys.

### /springernature/YOUR-TEAM/gcr

The `gcr` secret contains `private_key`. This can be used to push/pull from our private Docker Registry that is hosted by Google.

## Read and write secrets

### Via CLI
As mentioned above you will get a policy for each team you are part of. For example 'team-a', 'team-b'

What this means in practice is that you will have rights to read, write, create and delete under the paths

`/springernature/team-1/*` and `/springernature/team-2/*`

In my example I have access to engineering-enablement

```
$ vault write /springernature/engineering-enablement/ee-rocks for=sure
Success! Data written to: springernature/engineering-enablement/ee-rocks
$ vault read /springernature/engineering-enablement/ee-rocks
Key             	Value
---             	-----
refresh_interval	768h0m0s
for             	sure

# But no access to another team
$ vault write /springernature/oscar/oscar-rocks for=sure
Error writing data to springernature/oscar/oscar-rocks: Error making API request.

URL: PUT https://vault.halfpipe.io/v1/springernature/oscar/oscar-rocks
Code: 403. Errors:

* permission denied
```

## How it works in concourse.

If you have a pipeline `P` in team `T` and that pipeline uses the secret `((secretMap.secretKey))` concourse will try to resolve the value at the paths
`/springernature/T/P/secretMap` and `/springernature/T/secretMap`. The former path have precedence over the latter.

So if you get an error from the halfpipe cli telling you that the secret cannot be found this would be solved by either

```
vault write /springernature/T/P/secretMap secretKey=superSecret
```

or

```
vault write /springernature/T/secretMap secretKey=superSecret

```
