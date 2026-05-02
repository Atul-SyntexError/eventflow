#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

EVENTFLOW_CONFIG_FILE="${EVENTFLOW_CONFIG_FILE:-${HOME}/.config/eventflow/eventflow.properties}"
TOMCAT_HOME="${TOMCAT_HOME:-/opt/homebrew/opt/tomcat@10/libexec}"
SKIP_SEED="${SKIP_SEED:-0}"
SKIP_REDEPLOY="${SKIP_REDEPLOY:-0}"

if [[ ! -f "$EVENTFLOW_CONFIG_FILE" ]]; then
  echo "Missing external config file: $EVENTFLOW_CONFIG_FILE" >&2
  echo "Set EVENTFLOW_CONFIG_FILE to a valid properties file before bootstrapping." >&2
  exit 1
fi

if [[ "$SKIP_SEED" != "1" ]]; then
  echo "Running local database seed"
  EVENTFLOW_CONFIG_FILE="$EVENTFLOW_CONFIG_FILE" "$ROOT_DIR/scripts/seed-local-db.sh"
else
  echo "Skipping database seed because SKIP_SEED=1"
fi

echo "Packaging application"
(cd "$ROOT_DIR" && ./mvnw -q -DskipTests package)

if [[ "$SKIP_REDEPLOY" == "1" ]]; then
  echo "Skipping Tomcat redeploy because SKIP_REDEPLOY=1"
  echo "WAR ready at: $ROOT_DIR/target/event-flow.war"
  exit 0
fi

if [[ ! -d "$TOMCAT_HOME" ]]; then
  echo "Tomcat home does not exist: $TOMCAT_HOME" >&2
  exit 1
fi

echo "Redeploying WAR to Tomcat at $TOMCAT_HOME"
rm -rf "$TOMCAT_HOME/webapps/event-flow"
rm -f "$TOMCAT_HOME/webapps/event-flow.war"
rm -rf "$TOMCAT_HOME/work/Catalina/localhost"/event-flow*
rm -rf "$TOMCAT_HOME/temp"/*
cp "$ROOT_DIR/target/event-flow.war" "$TOMCAT_HOME/webapps/event-flow.war"

echo "Bootstrap complete. Wait for readiness before running smoke checks:"
echo "curl -I http://localhost:8080/event-flow/login.jsp"
