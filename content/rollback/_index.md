---
title: Rollback
weight: 60
---

## Oeh noes!

Something has gone wrong. How do I roll back a deployment to a previous version?

## Using Git

The simplest way is to revert the commits you don't want, and push.

```bash
$ git revert BaDsHa
$ git push
```

#### Pros
* History in the git repo

#### Cons
* Takes time, your entire pipeline must run through for the deploy to happen

## Using CF

Our deploy plugin makes sure that the last deployed version is kept around in CF.
To rollback the app `myAwesomeApp` simply

```bash
$ cf start myAwesomeApp-OLD
$ cf stop myAwesomeApp
```

#### Pros
* Quickest way to rollback

#### Cons
* No history of what have happened or why.
* If a new commit is made to the repo responsible for the app, the `myAwesomeApp-OLD` will be renamed to `myAwesomeApp-DELETE` and deleted during the deployment. Hopefully the new commit fixes the issue? :)

## Using Concourse

Since Concourse has already built and tested a previous version of the App you can use the Web UI to rollback safely.

{{< vimeo 302051341 >}}

#### Pros
* Quick
* Safe
* Some history stored

#### Cons
* Not as intuitive as the other options.
* Requires clicking around in the web UI.
