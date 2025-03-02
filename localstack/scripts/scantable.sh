#!/bin/sh

DYNAMO_DB_ENDPOINT=http://localhost:4566
TABLE_NAME=convert-status-table 

aws --endpoint-url=$DYNAMO_DB_ENDPOINT dynamodb scan \
    --table-name $TABLE_NAME
