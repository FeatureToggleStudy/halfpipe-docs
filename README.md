# Halfpipe Docs

<a href="https://concourse.halfpipe.io/teams/engineering-enablement/pipelines/halfpipe-docs"><img src="http://badger.halfpipe.io/engineering-enablement/halfpipe-docs" title="badge"></a>

It's a static site rendered via [Hugo](https://gohugo.io).

# Run in docker

First ensure the theme submodule is up to date:

```
git submodule update --init
```

```
./run
```

The site should be available at http://localhost:1313/


# Packaging

You can use the `./build` script to render and package the website.
