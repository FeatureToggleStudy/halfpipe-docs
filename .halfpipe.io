{
   "team": "engineering-enablement",
   "pipeline": "halfpipe-docs",
   "slack_channel": "#halfpipe-team",
   "feature_toggles": [ 
      "update-pipeline" 
   ],
   "tasks": [
      {
         "type": "run",
         "name": "build",
         "script": "./build",
         "docker": {
            "image": "eu.gcr.io/halfpipe-io/hugo"
         },
         "save_artifacts": [
            "target/website.zip"
         ]
      },
      {
         "type": "deploy-cf",
         "name": "deploy",
         "api": "((cloudfoundry.api-snpaas))",
         "space": "halfpipe",
         "deploy_artifact": "target/website.zip"
      }
   ]
}
