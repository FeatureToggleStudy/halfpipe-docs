---
title: FAQ
weight: 110
---

### Are there any sample projects?

Sure thing!

We have a curated list of sample applications that use Halfpipe <https://github.com/springernature/halfpipe-examples>

And here are a bunch of real projects that [use Halfpipe](https://github.com/search?q=org%3Aspringernature+filename%3A.halfpipe&type=Code).

### How can I access a build container in Concourse?
Concourse allows you to SSH into a failed build in a pipeline, as long as there has not been any subsequent successful runs or more than 30 mins have passed since the failure.

To SSH, use the fly command [`hijack`](https://concourse-ci.org.org/builds.html#fly-intercept).

We have found the most convenient way is to use the `--url` and `--step` flags

![hijack](/images/hijack.png)

```text
$ hostname
MLDEBEHE00-0011
$ fly -t ci hijack --url=https://concourse.halfpipe.io/teams/engineering-enablement/pipelines/my-cool-pipeline/jobs/jobName/builds/1 --step=taskName
$ hostname
456ac93e-1c32-4486-6055-86d1c8ebd7ec
```

Note that by default hijack will try to run `bash` inside the container. If `bash` is not installed in the docker image, the `sh` shell will be availible in most cases.

```text
$ hostname
MLDEBEHE00-0011
$ fly -t ci hijack --url=.. --step=.. "/bin/sh"
# hostname
456ac93e-1c32-4486-6055-86d1c8ebd7ec
```

### How can I download something from a build container?
Sometimes it's useful to download something from the container, a built jar, a test report, etc.

```text
$ fly -t ci hijack --url=.. --step=.. "cat" "git/README.md" > /tmp/README-from-container.md
$ wc -l /tmp/README-from-container.md
37 /tmp/README-from-container.md
```

### How can I get a build number?

Concourse does not provide metadata such as build number, pipeline name etc. This is because its regarded as a anti-pattern that would make it harder to migrate from Concourse to another CI system.

Whilst this is a good design decision from a CI system point of view it can be annoying from a users point of view.

A workaround pointed out by James Shiell would be to count number of commit between `current` and `initial`, effectively getting a incrementing value.

```text
git rev-list --count "$GIT_REVISION"
```

Note that for this to work your docker image __must__ have git installed.

### My Docker image specifies a USER, but all the files in Concourse are owned by root. :(

There are two issues related to this

* https://github.com/concourse/concourse/issues/403
* https://github.com/concourse/git-resource/issues/155

The easy solution is to simply remove the `USER` in the Dockerfile and let everything run as root.

### Im getting a 403 when trying to use Vault, but it used to work!

This most likely means your token have expired. When you do a login you will see

```text
Success! You are now authenticated. The token information displayed below
...

Key                    Value
---                    -----
...
token_duration         768h
...
```

If you have not run a `vault token renew` within that 768h duration your token will expire. To solve simply [`login`](/vault/#Login). again.
