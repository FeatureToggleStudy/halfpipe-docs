---
title: Migration from Auto Pipelines
weight: 141
---

So you are about to migrate an app from Auto Pipelines to Halfpipe? Great, but first lets explore some of the similarities and differences between the two systems

## What they have in common

### Abstraction

Both are abstractions on top of CI systems. In Auto Pipeline's case we are abstracting GoCD and in Halfpipe's we are dealing with Concourse

### Configuration

Both use a manifest to different degrees as a means to configure the CI system. For Auto Pipeline this is a requirement as GoCD does not really come with a way to programmatically configure a pipeline(a slight lie, it can take XML, but do you want to spend your days editing that?) and in Halfpipe's case we have a manifest since Concourse's YAML is extremely flexible but also very verbose! The end result is the same though, the systems take a simplified manifest and generates a complex one.


### Common tasks

Both systems tries their best at abstracting common recurring tasks such as building artifacts in a isolated environment, deploying code to Cloud Foundry, building docker images etc.

## How they differ

### System

First and foremost, they use different CI systems. There are as many opinions as there are developers about what the best CI is. GoCD is old, and have limited usage in the wild, Concourse is relatively new but also have limited use in the wild. So why not just continue with GoCD? GoCD is rather annoying to scale(src written in old school way with little regard for "cloud"), it provides no way out of the box to do isolated builds(docker), its hard to configure(xml or clicking around in the UI) and it has a substandard plugin system creating leaky abstractions. Concourse addresses all of these concerns in a nice way. That is why we decided to use it.

### Standards

Halfpipe tries its best to not hide the details of the systems used whereas Auto Pipeline tries to abstracts them. In practice this means for instance that configuration of a CF app is spread out between the `app-anatomy.yml` and the CF `manifest.yml` in the case of Auto Pipeline whereas in Halfpipe all configuration related to CF is done in the CF `manifest.yml`

### Approach

Auto Pipeline is in large part configured via conventions whereas Halfpipe is configured via, well configuration. For instance in Auto Pipeline you are required to have a file in the root of the app called `build` regardless if you need to build something or not. If you just want to test your code before pushing to CF you would have to put your test command in the `build` file. Halfpipe on the other hand takes a different approach, we provide the building blocks to describe what you want to do, when you want to do it. Both approaches have merits but the reason we went with the configuration over conventions is that its much easier to create a deterministic, well documented system without any of hidden complexity which makes Auto Pipelines hard to debug when something goes wrong.

### Secrets
Both Auto Pipeline and Halfpipe provides a way to deal with secrets, in Auto Pipeline's case you are required to use a web-app to encrypt what you want as a secret and stick that value in the `app-anatomy.yml` file. In Halfpipe we use Vault from Hashicorp, this is a much safer approach and allows for easy evaluation and editing of the secrets trough a CLI and web interface.

### Inception
Auto Pipeline's configuration of the CI system happens automagically, which is great! However there is a tight coupling between the act of generating a valid GoCD XML and applying that XML to the CI server. Furthermore there are handful of libraries, external services and caches that are required to actually generate the XML making it difficult, nay, impossible to generate a configuration on localhost. It also provides a big surface area for errors at run time, what happens when one of the caches are out of date? Or what happens when there is a bug in one of the services used? More often than not it results in your pipeline being broken, not because your code fails to test/build/deploy but because the surrounding systems have hiccups.

To make matters worse, implementing a feature often requires changes and deployment to multiple services and libraries concurrently. Halfpipe's approach is to say no to inception as a concept and fully detach the act of generating a pipeline to uploading it. Halfpipe comes as a statically compiled binary that can be run on a developers machine to generate the pipeline. Once a pipeline have been built it has to be manually uploaded to the CI system.

This removes all of the issues with dynamic resolving and generation at runtime but instead creates new ones. For instance, how do we make sure the pipeline config is up to date when a change is made to the manifest if uploading is a required manual step? At the start of the project we were more interested in how to create a rock solid pipeline generator rather than something that kind of worked but automagically uploaded the pipeline, with that said we are currently thinking about how to provide this feature!

### Manually scripted pipelines

If your pipeline does not fit into the model that Auto Pipeline operates over, there is a separate system that allows you to define "manually scripted pipeline", in practice this means that you would use a undocumented python library to write a script and stick it in a predefined git repo and if all goes well, you have a pipeline! In Halfpipe this is not needed as in effect everything is a "manually scripted pipeline"! In the case that our "manually scripted pipeline" abstraction doesn't provide what you need, then you have the power to write Concourse YAML and use that instead.

### CF deployment

Both Auto Pipeline and Halfpipe deploys to CF with zero downtime. At the end of the day the end result is the same but the way we get there is very different. Auto Pipeline will use runtime resolving whereas Halfpipe will create a execution list, and then execute it. Another big difference is that the deployment happens with a [CF plugin](/cf-deployment/) in Halfpipe whereas Auto Pipeline simply wraps the CF CLI and parses the output to take decisions.

### Documentation

Last and arguably most important, Halfpipe treats documentation as a first class citizen. We don't want another system that require tribal knowledge, cloning of example apps or `git push` driven feedback loops. If a system is to hard to document its probably also to hard to use.

## What do I need to do to migrate?

First of all, there is no automatic migration script. This is because of a couple of reasons

* Each app is a unique snowflake so its hard to generalize this
* Auto Pipeline required a ton of dynamic runtime resolving to generate a pipeline. This also means that to create a migration script we would have to do a ton of dynamic runtime resolving. If this process isn't deterministic, and it isn't, we cannot guarantee that the pipeline we create would be correct.
* It forces you, the user, to understand what is going on! Don't worry, its not so complicated :)

But here are some pointers to help you on the way

### Migrating old secrets.

Old secrets were manually encrypted using a web-service then stuck into the `app-anatomy.yml`.

```
environment-groups:
  - name: staging
    environments:
    - name: staging
      encrypted-environment-variables:
      - name: MY_SECRET
        value: 6Fi7M8nxqxASdajhjasdjhkjahsdg=
```


To migrate them the easiest way to do so is to simply `cf env APP-DEPLOYED-BY-AUTO-PIPELINES` to read the secrets and then manually add them to Vault. More info on how Vault works can be found [here](/vault/)

### Cloud Foundry manifest.

In Auto Pipeline you were required to add the routes you wanted to be bound to your app in `app-anatomy.yml`. Note that the `needs-to-be-publicly-accessible` would generate a public route at deploy time for you.

```
environment-groups:
  - name: live
    additional-routes:
      - my-cool-route.springer.com
      - another-random-route.domain.com
    needs-to-be-publicly-accessible: true
    manifest: manifest-live.yml
```

In Halfpipe you would instead use the cf manifest directly.

```
applications:
- name: my-app
  routes:
    - route: my-cool-route.springer.com
    - route: another-random-route.domain.com
    - route: the-publicly-availible-route-automatically-generated-by-auto-pipelines.domain.com
```

Similarly the services you want to be bound to your app needs to go in the cf manifest.

During a migration from Auto Pipelines to Halfpipe its safest to copy the old cf manifest and make changes to that rather than make any changes to a manifest that is used by both Auto Pipelines and Halfpipe. If you add routes to the manifest Auto Pipelines *will* fail.

### Cloud Foundry environment variables

Environment variables set by Auto Pipeline:

* `METRICS_PREFIX`
* `TE_COMPONENT_ENV`
* `TE_COMPONENT_NAME`
* `ENVIRONMENT`
* `BUILD_VERSION`
* `GIT_REVISION`

Environment variable set by Halfpipe

* `GIT_REVISION`
* `BUILD_VERSION` (only if using the [update-pipeline](/auto-updating-pipelines/) feature togggle)

As you can see, Halfpipe sets a lot less. To keep using the old Auto Pipeline env vars you can add them to your Cloud Foundry manifest under `env`, or to the `vars` list of the `deploy-cf` task in halfpipe.
