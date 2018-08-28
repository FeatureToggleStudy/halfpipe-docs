---
title: CF Deployment
weight: 41
---

Our deployment to CF uses the nifty [halfpipe-cf CF plugin](https://github.com/springernature/halfpipe-cf-plugin).

To simplify the plugin we require a application manifest to have **exactly** one application configured in it

```
# Bad
$ cat manifest.yml
applications:
- name: App-web
- name: App-worker

# Good
$ cat manifest-web.yml
applications:
- name: App-web

$ cat manifest-worker.yml
applications:
- name: App-worker
```

All configuration regarding the app in Cloud Foundry must live in the application manifest, there is no automagical configuration or resolving done by Halfpipe itself. This means, for instance, if you want the routes r1 and r2 mapped to you app your manifest must specify them in the application manifest.

```
applications:
- name: my-app
  routes:
  - route: r1
  - route: r2
```

[Here you can find more information](https://docs.cloudfoundry.org/devguide/deploy-apps/manifest.html) around how to configure your app trough the manifest.

## What happens in Concourse
Inside concourse when you use a `deploy-cf` task it will execute

```
cf halfpipe-push args...
cf halfpipe-promote args...
cf halfpipe-cleanup args...
```

Each of these commands will print out an execution plan before actually executing, so hopefully it should be clear what it does.

```
$ cat manifest-dev.yml
applications:
- name: appName
  routes:
  -route: appName.apps.public.gcp.springernature.io

$ cf apps
Getting apps in org myOrg / space live as myUser...
OK

name                   requested state   instances   memory   disk   urls
appName                started           1/1         20M      50M    appName.apps.public.gcp.springernature.io
appName-OLD            stopped           0/1         20M      50M    appName.apps.public.gcp.springernature.io

$ cf halfpipe-push -manifestPath manifest-dev.yml -appPath . -testDomain apps.gcp.springernature.io -space live
# Planned execution
# CF plugin built from git revision 'xyz'
#	* cf push appName-CANDIDATE -f manifest-dev.yml -p . --no-route --no-start
#	* cf map-route appName-CANDIDATE apps.gcp.springernature.io -n appName-live-CANDIDATE
#	* cf start appName-CANDIDATE
...

$ cf halfpipe-promote -manifestPath manifest-dev.yml -testDomain apps.gcp.springernature.io -space live
# CF plugin built from git revision 'xyz'
# Planned execution
#	* cf map-route appName-CANDIDATE apps.public.gcp.springernature.io -n appName
#	* cf unmap-route appName-CANDIDATE apps.gcp.springernature.io -n appName-live-CANDIDATE
#	* cf rename appName-OLD appName-DELETE
#	* cf rename appName appName-OLD
#	* cf stop appName-OLD
#	* cf rename appName-CANDIDATE appName
...

$ cf halfpipe-cleanup -manifestPath manifest-dev.yml
# CF plugin built from git revision 'f83cdb2711cf375d08a8f9d2c8d6fe8eb245458f'
# Planned execution
#	* cf delete appName-DELETE -f
...
```
