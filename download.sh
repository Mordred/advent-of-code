#!/bin/bash

SESSION=$1

if [ -z "$SESSION" ];
then
  echo "Missing session id"
  exit 1
fi

YEAR=$2

if [ -z "$YEAR" ];
then
  echo "Missing year: "$(ls -d 20*)
  exit 1
fi

for dir in `ls -d $YEAR/*`; do
  day=${dir#$YEAR/}
  day_i=$(expr $day + 0)
  if [ ! -f $dir/input.txt ];
  then
    curl "https://adventofcode.com/$YEAR/day/$day_i/input" \
      -H 'authority: adventofcode.com' \
      -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9' \
      -H 'accept-language: sk,en-US;q=0.9,en;q=0.8,sk-SK;q=0.7,cs;q=0.6' \
      -H 'cache-control: max-age=0' \
      -H "cookie: session=$1" \
      -H "referer: https://adventofcode.com/$YEAR/day/$day_i" \
      -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' \
      --compressed >$dir/input.txt
  fi
done
