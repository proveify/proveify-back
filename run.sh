#!/bin/bash
echo "NODE_ENV: $NODE_ENV";

if [ "$NODE_ENV" == "production" || "$NODE_ENV" == "testing" ]
    then
        echo "start $NODE_ENV mode...";
        npm run start:prod
else
    echo "start dev mode...";
    npm run start:dev
fi