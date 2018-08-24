---
title: Concourse
weight: 50
---

## Install CLI
Download the Concourse CLI `fly`. Select your OS by clicking the icon in the bottom right of the Concourse interface:

<https://concourse.halfpipe.io>

## Login

### CLI
With the CLI you can login to each GitHub team you are a member off.

```
$ fly -t ci login -c https://concourse.halfpipe.io -n TEAM_I_WANT_TO_LOGIN_TO
logging in to team 'TEAM_I_WANT_TO_LOGIN_TO'

navigate to the following URL in your browser:

    https://concourse.halfpipe.io/auth/github?team_name=TEAM_I_WANT_TO_LOGIN_TO&fly_local_port=53443 <--- Click that bad boyy.

or enter token manually:
target saved
```

Now you can list your pipelines..

```
$ fly -t ci pipelines
name       paused  public
test-repo  no      no
```

[Here](https://concourse-ci.org.org/fly.html) is the documentation of the `fly` CLI

Note that you will **not** be able to login to a team that you are not a member of.

### Web
Head over to `https://concourse.halfpipe.io/login` filter and click on the team you want to login to, click the "login with GitHub" button. Yay, you are logged in.
