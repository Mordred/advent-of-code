#!/usr/bin/env bash

# Usage: ./run.sh <path> [args...]
# If the first argument does not already end with "index.ts", append "/index.ts"
# and forward the rest of the arguments to node.

set -euo pipefail

if [ "$#" -lt 1 ]; then
	echo "Usage: $0 <path> [args...]"
	exit 1
fi

first="$1"
shift || true

# Remove any trailing slash from the first argument
first="${first%/}"

# If the first argument already ends with index.ts, run from its directory.
if [[ "$first" == *index.ts ]]; then
	dir="$(dirname "$first")"
else
	dir="$first"
fi

if [ ! -d "$dir" ]; then
	echo "Directory '$dir' not found"
	exit 2
fi

# Change working directory so relative imports/paths resolve from the target module
cd "$dir"

exec node --experimental-strip-types ./index.ts "$@"
