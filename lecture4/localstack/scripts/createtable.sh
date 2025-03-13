#!/bin/sh

DYNAMO_DB_ENDPOINT=http://localhost:4566
TABLE_NAME=convert-status-table 

aws --endpoint-url=$DYNAMO_DB_ENDPOINT dynamodb create-table \
    --table-name $TABLE_NAME \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST

