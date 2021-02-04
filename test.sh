#!/bin/bash

#set -x 

function sendAuth {

   for filename in ./templates/*.json; do
     sed "s/<txnId>/$1/" $filename >  "data/$(basename "$filename" )"
   done

   curl -X POST http://localhost:3000/collector -d @./data/authStart.json -H "Content-Type: application/json"
   curl -X POST http://localhost:3000/collector -d @./data/riskScore.json -H "Content-Type: application/json"
   curl -X POST http://localhost:3000/collector -d @./data/credential.json -H "Content-Type: application/json"
   curl -X POST http://localhost:3000/collector -d @./data/riskFactor-DIFFICULTTRAVEL.json -H "Content-Type: application/json"
   curl -X POST http://localhost:3000/collector -d @./data/riskFactor-KNOWNFRAUD.json -H "Content-Type: application/json"
   curl -X POST http://localhost:3000/collector -d @./data/riskFactor-RISKYCOUNTRY.json -H "Content-Type: application/json"
   curl -X POST http://localhost:3000/collector -d @./data/riskFactor-DEVICEMFPMISMATCH.json -H "Content-Type: application/json"
   if [ $2 == "success" ]; then
echo "SUCCESS"
      curl -X POST http://localhost:3000/collector -d @./data/loginSuccess.json -H "Content-Type: application/json"
   else
echo "FAILURE"
      curl -X POST http://localhost:3000/collector -d @./data/loginFailure.json -H "Content-Type: application/json"
   fi
}

sendAuth d3802b4c-11af-4266-af0c-2eb8c4afe230 success
sendAuth d3802b4c-11af-4266-af0c-2eb8c4afe231 failure
sendAuth d3802b4c-11af-4266-af0c-2eb8c4afe232 success
sendAuth d3802b4c-11af-4266-af0c-2eb8c4afe233 success
sendAuth d3802b4c-11af-4266-af0c-2eb8c4afe234 success
sendAuth d3802b4c-11af-4266-af0c-2eb8c4afe235 success
sendAuth d3802b4c-11af-4266-af0c-2eb8c4afe236 success
sendAuth d3802b4c-11af-4266-af0c-2eb8c4afe237 success
sendAuth d3802b4c-11af-4266-af0c-2eb8c4afe238 success
sendAuth d3802b4c-11af-4266-af0c-2eb8c4afe239 failure

