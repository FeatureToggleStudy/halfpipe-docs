team: engineering-enablement
pipeline: halfpipe-docs

tasks:
- type: run
  name: Build
  script: ./build
  docker:
    image: eu.gcr.io/halfpipe-io/hugo
  save_artifacts:
  - target/website.zip

- type: deploy-cf
  name: Deploy
  api: ((cloudfoundry.api-snpaas))
  space: halfpipe
  deploy_artifact: target/website.zip
