{
   "team": "engineering-enablement",
   "pipeline": "halfpipe-docs-versioned",
   "feature_toggles": [ 
      "versioned" 
   ],
   "tasks": [
      {
         "type": "run",
         "name": "Build",
         "script": "./build",
         "docker": {
            "image": "eu.gcr.io/halfpipe-io/hugo"
         },
         "save_artifacts": [
            "target/website.zip"
         ]
      },
      {
         "type": "docker-compose",
         "name": "Hello",
         "command": "env"
      },
   ]
}
