---
title: How do i do x?
weight: 6
---

## How do I get started?

If you are trying to use Halfpipe for the first time the [getting started](/getting-started/) guide is a good place to start :) If you are migrating from Auto Pipelines the [migration docs](/migration/) contains some useful information.

As soon as you have all the binaries installed

```
$ cd ~/path/to/my/git/repo
$ halfpipe init
Generated sample configuration at /home/user/path/to/my/git/repo/.halfpipe.io
```

Take a look at the content in `.halfpipe.io`, then adapt it with the help of the [manifest schema](/manifest/) and finally run `halfpipe upload` to upload it to Concourse!

## How do I use secrets in my build/app?

We use [vault](/vault), so make sure that is setup and working before continuing.

Once you have it installed you can write a secret like so

```
$ vault write /springernature/my-team/myApp dbUsername=readUser dbPassword=superSecret
```

And to use simply put
```
vars:
  DB_USER: ((myApp.dbUsername))
  DB_PASSWORD: ((myApp.dbPassword))
```

in a [run](/manifest/#run), [docker-compose](manifest/#docker-compose) or [deploy-cf](/manifest/#deploy-cf) task in the `.halfpipe.io` manifest. This way the secrets will be available as the environment variables `DB_USER` and `DB_PASSWORD`.

Check out this [example](https://github.com/springernature/halfpipe-examples/blob/master/golang/.halfpipe.io) for an actual pipeline that uses secrets

## How do I do something with docker-compose?

Simple, make sure `docker-compose run app` does what you want it to do localhost then put the following task in the halfpipe [manifest](/manifest/#docker-compose)

```
- type: docker-compose
```

## How do I get an artifact?

[check this out](/artifacts/)
