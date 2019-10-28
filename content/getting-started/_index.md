---
title: Getting Started
weight: 10
---

Check out some [sample projects](https://github.com/springernature/halfpipe-examples) to get a feel for how Halfpipe works.

To use Halfpipe we need to join a GitHub team and install the CLIs for Halfpipe, Concourse (called "fly"), and Vault. They are all distributed as binaries which need to be executable and saved somewhere on your system's `PATH` (e.g. `/usr/local/bin`).

## GitHub
Your user must be part of a team in the [SpringerNature GitHub Organisation](https://github.com/orgs/springernature/teams). These teams align with teams in Concourse and Vault. Your user must have a verified primary email otherwise you will not be able to login to Concourse. If you are not yet in a team you wish to be part of, ask a friendly person in that team or on Slack in `#github-admins`.

You should now be able to login to Concourse using GitHub Auth: <https://concourse.halfpipe.io>

The GitHub team `Springer Nature Read` needs **read access** to your repository for Concourse to be able to clone it.

## Halfpipe
1. Download the binary for your OS from<br>
  <https://github.com/springernature/halfpipe/releases/latest>
2. Install the binary somewhere on your path<br>
  `install halfpipe_darwin_3.23.0 /usr/local/bin/halfpipe`
3. Check it works<br>
  `halfpipe --help`

## Fly
1. Download the binary for your OS from the bottom right of the Concourse interface<br/>
  https://concourse.halfpipe.io
2. Install the binary somewhere on your path<br>
  `install fly /usr/local/bin`
3. Login to Concourse<br>
  `fly -t ci login -c https://concourse.halfpipe.io -n <MY-TEAM>`

## Vault
1. Download the binary for your OS from<br>
  https://www.vaultproject.io/downloads.html
2. Install the binary somewhere on your path<br>
  `install vault /usr/local/bin`
3. Create a personal token in GitHub at https://github.com/settings/tokens/new<br>
  Name it something cool, say `vault`, and select `read:org` under `admin:org`.<br>
  Save the token somewhere secret on your machine, you can always revoke and regenerate your token if you lose it :)
4. Configure Vault Server<br>
The vault CLI will use the server defined in the environment variable `VAULT_ADDR`, so let's point it to our Vault installation.
  `echo "export VAULT_ADDR=https://vault.halfpipe.io" >> ~/.bashrc`
5. Login to Vault<br>
  `vault login -method=github token=$(cat ~/.my-vault-token)`
