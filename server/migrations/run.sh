#!/bin/bash
#
# Script: migrations/run.sh
# Description: Automated schema migration for PostgreSQL
# Usage: ./migrations/run.sh DATABASE
#
# Details:
# 	Just store the .sql migrations scripts in a folder, file
# 	names must be incremental numbers (1.sql, 2.sql, ...).
# 	The script stores current version in a ".version" file
# 	and logs PostgreSQL output to a ".migrations.log" file,
# 	both stored in the same folder as the scripts.
#

cd $(dirname "${BASH_SOURCE[0]}")

ENV_PATH="../../.env"
VERSION_FILE=".version"
CURRENT_VERSION="`cat $VERSION_FILE 2>/dev/null || echo 0`"
USAGE="Usage: $0 [--fix]"
LOG_FILE_PATH=".migrations.log"
TMP_ERR_FILE_PATH=".tmp.err"

# Load the .env file
if [ ! -f "$ENV_PATH" ]
then
  echo "WARN: .env file was not found in root, aborting migrations"
  exit 1
else
  export $(grep -v '^#' $ENV_PATH | xargs)
  if [[ ! -n $DATABASE_URL ]]; then
    echo "WARN: DATABASE_URL variable was not found in .env, aborting migrations"
    exit 1
  fi
fi

echo -e "logs for last migration run -- \"$(date)\"\n" > $LOG_FILE_PATH

# Check if psql is installed
which psql &>/dev/null
if [ $? -ne 0 ]; then
	echo "WARN: psql is not installed, aborting migrations"
	exit 1
fi

while [[ $# -gt 0 ]]; do
case "$1" in
    --fix)
    FIX=YES
    shift
    ;;
	*)
	echo $USAGE
	exit 1
    ;;
esac; done;

for FNAME in `ls *.sql | sort -n`; do
	SCRIPT_VERSION="${FNAME:: 8}"
	if [ "$SCRIPT_VERSION" -gt "$CURRENT_VERSION" ]; then
		SCRIPT_PATH="$FNAME"

		if [[ ! -n $FIX ]]; then
			BLACK=$'\e[40;97m'
			YELLOW=$'\e[103;30m'
			GREEN=$'\e[92;40m'
			NC=$'\e[0m'
			echo "███    ███ ██  ██████  ██████   █████  ████████ ███████ ██ "
			echo "████  ████ ██ ██       ██   ██ ██   ██    ██    ██      ██ "
			echo "██ ████ ██ ██ ██   ███ ██████  ███████    ██    █████   ██ "
			echo "██  ██  ██ ██ ██    ██ ██   ██ ██   ██    ██    ██         "
			echo "██      ██ ██  ██████  ██   ██ ██   ██    ██    ███████ ██ "
			echo ""
			echo "${BLACK}db${NC} ${YELLOW}WARN${NC} Please run migrations with ${GREEN}$0 --fix${NC}"
			echo ""
			exit 0
    else
      read -p "Do you want to run migration \"$SCRIPT_PATH\"? (y/N) " -n 1 -r MIGRATE; echo;
			if [[ ! $MIGRATE =~ ^[Yy]$ ]]; then exit 0; fi
		fi

		# Load the .sql file
		echo -n "$SCRIPT_PATH ... "
    PSQL=$(psql -1 -v ON_ERROR_STOP=1 -a $DATABASE_URL -f $SCRIPT_PATH 2>$TMP_ERR_FILE_PATH)
		RET_CODE=$?
		echo -e "$SCRIPT_PATH\n$PSQL" >> $LOG_FILE_PATH

		# Handle potential PostgreSQL errors
    cat $TMP_ERR_FILE_PATH >> $LOG_FILE_PATH
		if [ $RET_CODE -ne 0 ]; then
			echo "ERR $RET_CODE"
			echo "- ERR $RET_CODE" >> $LOG_FILE_PATH
		else
			echo "OK"
			echo "- OK" >> $LOG_FILE_PATH
		fi

		echo "" >> $LOG_FILE_PATH

		# Update current migration version
		echo $SCRIPT_VERSION > $VERSION_FILE
	fi
done

rm -f $TMP_ERR_FILE_PATH
