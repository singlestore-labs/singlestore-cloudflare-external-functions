#!/usr/bin/bash
set -eux

# start singlestore
docker run -it \
    --name singlestore \
    -e LICENSE_KEY=$LICENSE_KEY \
    -e ROOT_PASSWORD='root' \
    -p 3306:3306 -p 8080:8080 \
    singlestore/cluster-in-a-box

docker start singlestore
