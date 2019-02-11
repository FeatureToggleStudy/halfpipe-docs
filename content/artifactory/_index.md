---
title: Artifactory
weight: 81
---

We have a hosted JFrog Artifactory instance available for all development teams.

<https://springernature.jfrog.io>

Artifactory acts both as a cache for other repositories as well as a storage for our own internal artifacts. If you need remote repositories to be added to it, please ask in slack `#artifactory-admins`.

In general, configuring `https://springernature.jfrog.io/springernature/libs-release` as your repository should be enough, as it bundles all configured repositories into one.


## Authentication

Sign in to the web interface using GitHub auth `SN GitHub`. You must be a member of the Springer Nature organistion in GitHub.

<https://springernature.jfrog.io/springernature/webapp/#/login>

Halfpipe injects the environment variables `ARTIFACTORY_USERNAME`, `ARTIFACTORY_PASSWORD` and `ARTIFACTORY_URL` into your build containers.

If you need credentials outside of halfpipe, you can generate an api key in your (or a shared team users) profile page in artifactory. You can also find the credentials that are used by halfpipe in [vault](/vault/#springernature-your-team-artifactory) under `springernature/<team-name>/artifactory`.

To use the same script locally and in halfpipe, this script reads the values from vault if they are not already set.

```bash
VAULT_PATH="springernature/<team-name>/artifactory"
ARTIFACTORY_URL="${ARTIFACTORY_URL:-$(vault read -field=url $VAULT_PATH)}"
ARTIFACTORY_USERNAME="${ARTIFACTORY_USERNAME:-$(vault read -field=username $VAULT_PATH)}"
ARTIFACTORY_PASSWORD="${ARTIFACTORY_PASSWORD:-$(vault read -field=password $VAULT_PATH)}"
```

## Examples

Set up environment variables `ARTIFACTORY_USERNAME` and `ARTIFACTORY_PASSWORD`. 
 
### Gradle

```
repositories {
    maven {
        url "https://springernature.jfrog.io/springernature/libs-release/"
        credentials {
            username "$System.env.ARTIFACTORY_USERNAME"
            password "$System.env.ARTIFACTORY_PASSWORD"
        }
    }
}
```

Intellij IDEA is not able to work with repositories with credentials, so use `./gradlew clean build` to build the project and IDEA will reimport project automatically.

### Sbt
   
```
(sys.env.get("ARTIFACTORY_USERNAME"), sys.env.get("ARTIFACTORY_PASSWORD")) match {
  case (Some(username), Some(password)) =>
    credentials += Credentials("Artifactory Realm", "springernature.jfrog.io", username, password)
  case _ =>
    println("USERNAME and/or PASSWORD is missing")
    credentials ++= Seq()
}

resolvers := Seq(
  Resolver.defaultLocal,
  Resolver.mavenLocal,
  MavenRepository("Artifactory Realm", "https://springernature.jfrog.io/springernature/libs-release/"),
)

externalResolvers := resolvers.value
```                                                                            
