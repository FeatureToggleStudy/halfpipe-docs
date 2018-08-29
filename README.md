# Halfpipe Docs

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

## Docker registry
You'll need to setup docker registry before running the app.
you can read more about it in https://docs.halfpipe.io/docker-registry/

# Packaging

You can use the `./build` script to render and package the website.
