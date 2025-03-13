#!/bin/sh

DYNAMO_DB_ENDPOINT=http://localhost:4566
TABLE_NAME=keyword-store

aws --endpoint-url=$DYNAMO_DB_ENDPOINT dynamodb scan \
    --table-name $TABLE_NAME
