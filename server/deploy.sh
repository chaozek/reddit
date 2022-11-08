#!/bin/bash

echo WHAT VERSION IS THIS
read VERSION
docker build -t pavelkaplan/reddit:$VERSION .
docker push pavelkaplan/reddit:$VERSION
ssh root@164.92.190.39 "docker pull pavelkaplan/reddit:$VERSION && docker tag pavelkaplan/reddit:$VERSION dokku/api:$VERSION && dokku deploy api $VERSION"