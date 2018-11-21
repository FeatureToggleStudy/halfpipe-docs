---
title: Getting Started
weight: 10
---

## Sample projects

Before moving on, you can check out some [sample projects](https://github.com/springernature/halfpipe-examples) to get a feel for how Halfpipe works.

## Prerequisites


Start by downloading the latest binaries for Halfpipe, Concourse and Vault. Store them somewhere on your machine that is in your `$PATH`.

- Download the latest Halfpipe release from <https://github.com/springernature/halfpipe/releases>
- Download the Concourse CLI `fly`. Select your OS by clicking the icon in the bottom right of the Concourse interface:  <https://concourse.halfpipe.io>
- Download the latest Vault client from <https://www.vaultproject.io/downloads.html>

## Prerequisites for Windows.

Download all binaries for Windows from the links above.

**Make sure to rename the halfpipe_windows_version.exe to halfpipe.exe** and place all the binaries in a folder that's on the path. I chose `C:\bin`

**Make sure to add that folder to the path if its not already**

![windows](/images/windows.png)

If you updated your path make sure to restart any instance of CMD.

## GitHub

To be able to do anything in Halfpipe your user **must** be part of a team in GitHub. These teams are consitent with current CloudFoundry orgs, as they are also used to push your code in the correct org. Important to get this right! Furthermore your user in Github **must** have a verified primary email otherwise you will not be able to login to Concourse!

[Check if you are part of a specific team](https://github.com/orgs/springernature/teams)

If you are not yet in a team you wish to be part of, ask a friendly person in that team or someone on Slack in `#github-admins` to help you!

Another requirement is that the GitHub team `Springer Nature Read` needs **read** access on your repo.

## Vault

### GitHub token

Big surprise... to authenticate against our Vault we use GitHub auth again, but it works with personal tokens instead.

[Create a new personal token](https://github.com/settings/tokens/new)

Name it something cool, say `vault` and select `read:org` under `admin:org`.

Save the token somewhere secret on your machine, you can always revoke and regenerate your token if you lose it :)

### Authenticate via the CLI
The vault CLI will use the server defined in the environment variable `VAULT_ADDR`, so let's point it to our Vault installation.

 in ~/.zshrc, ~/.zshenv ~/.bashrc or your place where you set your environment variables.
```
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
