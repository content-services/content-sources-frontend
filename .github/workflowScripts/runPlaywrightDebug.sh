#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: runPlaywrightDebug.sh --grep PATTERN [--repeat-each N] [--interval DURATION] [--workers N]

Runs matching Playwright tests with browser console capture enabled.
Tests run serially with one worker by default to avoid cross-run cleanup collisions.
Cleanup is based on a prefix so collisions are expected if tests are run in parallel.

Options:
  --grep PATTERN       Playwright --grep pattern (required)
  --repeat-each N      Number of runs (default: 3, max: 20)
  --interval DURATION  Wait between runs, e.g. 1m or 1h. When set, runs are spaced
                       out in a loop instead of Playwright's immediate --repeat-each.
  --workers N          Number of parallel Playwright workers (default: 1, max: 10)

Examples:
  runPlaywrightDebug.sh --grep "Upload Repositories" --repeat-each 5
  runPlaywrightDebug.sh --grep "Upload Repositories" --repeat-each 5 --interval 1m
  runPlaywrightDebug.sh --grep "Upload Repositories" --repeat-each 3 --interval 1h
  runPlaywrightDebug.sh --grep "Upload Repositories" --repeat-each 2 --workers 2
EOF
}

GREP=""
REPEAT_EACH=3
INTERVAL=""
WORKERS=1

while [[ $# -gt 0 ]]; do
  case "$1" in
    --grep)
      GREP="${2:-}"
      shift 2
      ;;
    --repeat-each)
      REPEAT_EACH="${2:-}"
      shift 2
      ;;
    --interval)
      INTERVAL="${2:-}"
      shift 2
      ;;
    --workers)
      WORKERS="${2:-}"
      shift 2
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$GREP" ]]; then
  echo "Error: --grep is required" >&2
  usage
  exit 1
fi

if ! [[ "$REPEAT_EACH" =~ ^[0-9]+$ ]] || [[ "$REPEAT_EACH" -lt 1 ]] || [[ "$REPEAT_EACH" -gt 20 ]]; then
  echo "Error: --repeat-each must be an integer between 1 and 20" >&2
  exit 1
fi

if ! [[ "$WORKERS" =~ ^[0-9]+$ ]] || [[ "$WORKERS" -lt 1 ]] || [[ "$WORKERS" -gt 10 ]]; then
  echo "Error: --workers must be an integer between 1 and 10" >&2
  exit 1
fi

interval_to_seconds() {
  local duration="$1"

  if [[ "$duration" =~ ^([0-9]+)m$ ]]; then
    echo $((${BASH_REMATCH[1]} * 60))
    return 0
  fi

  if [[ "$duration" =~ ^([0-9]+)h$ ]]; then
    echo $((${BASH_REMATCH[1]} * 3600))
    return 0
  fi

  echo "Error: --interval must be in the form Nm or Nh (e.g. 1m, 1h)" >&2
  return 1
}

INTERVAL_SECONDS=""
if [[ -n "$INTERVAL" ]]; then
  if [[ "$REPEAT_EACH" -lt 2 ]]; then
    echo "Error: --interval requires --repeat-each to be at least 2" >&2
    exit 1
  fi

  INTERVAL_SECONDS="$(interval_to_seconds "$INTERVAL")" || exit 1

  MAX_TOTAL_WAIT_SECONDS=$((6 * 3600))
  TOTAL_WAIT_SECONDS=$(((REPEAT_EACH - 1) * INTERVAL_SECONDS))
  if [[ "$TOTAL_WAIT_SECONDS" -gt "$MAX_TOTAL_WAIT_SECONDS" ]]; then
    echo "Error: total scheduled wait (${TOTAL_WAIT_SECONDS}s) exceeds maximum (${MAX_TOTAL_WAIT_SECONDS}s)" >&2
    exit 1
  fi
fi

export CAPTURE_BROWSER_CONSOLE=true

archive_run_artifacts() {
  local run_number="$1"
  local archive_root="playwright-debug-runs/run-${run_number}"

  mkdir -p "$archive_root"

  if [[ -d test-results ]]; then
    cp -R test-results "${archive_root}/test-results"
  fi

  if [[ -d playwright-report ]]; then
    cp -R playwright-report "${archive_root}/playwright-report"
  fi
}

run_playwright() {
  yarn playwright test --grep "$GREP" --retries=0 --workers="$WORKERS" "$@"
}

echo "Running grep: ${GREP}"
echo "Repeat each: ${REPEAT_EACH}"
echo "Workers: ${WORKERS}"

if [[ -z "$INTERVAL" ]]; then
  echo "Mode: immediate repeats (Playwright --repeat-each)"
  run_playwright --repeat-each="$REPEAT_EACH"
  exit $?
fi

echo "Mode: periodic repeats every ${INTERVAL} (${INTERVAL_SECONDS}s)"
rm -rf playwright-debug-runs
mkdir -p playwright-debug-runs

FAILURES=0
for ((run = 1; run <= REPEAT_EACH; run++)); do
  echo ""
  echo "=== Debug run ${run} of ${REPEAT_EACH} at $(date -u +"%Y-%m-%dT%H:%M:%SZ") ==="

  set +e
  run_playwright
  RUN_EXIT=$?
  set -e

  archive_run_artifacts "$run"

  if [[ "$RUN_EXIT" -ne 0 ]]; then
    FAILURES=$((FAILURES + 1))
    echo "Run ${run} failed with exit code ${RUN_EXIT}"
  else
    echo "Run ${run} passed"
  fi

  if [[ "$run" -lt "$REPEAT_EACH" ]]; then
    echo "Waiting ${INTERVAL} (${INTERVAL_SECONDS}s) before next run..."
    sleep "$INTERVAL_SECONDS"
  fi
done

echo ""
echo "Completed ${REPEAT_EACH} runs: $((REPEAT_EACH - FAILURES)) passed, ${FAILURES} failed"

if [[ "$FAILURES" -gt 0 ]]; then
  exit 1
fi

exit 0
