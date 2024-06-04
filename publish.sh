#!/bin/bash
# Store the current date in yyyy-mm-dd format in a variable
current_date=$(date +%F)
ENV=`sui client active-env`
sui move build # --skip-fetch-latest-git-deps
sui client publish --gas-budget 100000000 --skip-dependency-verification --skip-fetch-latest-git-deps| tee "publish.${ENV}.${current_date}.txt"
