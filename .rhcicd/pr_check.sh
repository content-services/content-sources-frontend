#!/bin/bash

# --------------------------------------------
# Export vars for helper scripts to use
# --------------------------------------------
export APP_NAME="content-sources"  # name of app-sre "application" folder this component lives in
export COMPONENT_NAME="content-sources-backend"  # name of resourceTemplate component for deploy
# IMAGE should match the quay repo set by app.yaml in app-interface
export IMAGE="quay.io/cloudservices/content-sources-frontend"
export WORKSPACE=${WORKSPACE:-$APP_ROOT} # if running in jenkins, use the build's workspace
export APP_ROOT=$(pwd)

# set NODE_BUILD_VERSION based on nvmrc or default to 16
if test -f "${APP_ROOT}/.nvmrc"; then
    # -P for perl, look-behind for v, match the major version number, look ahead for .
    # -o output only matched major version number, don't output (?=) groups
    export NODE_BUILD_VERSION=$(grep -Po '(?<=v)[0-9]+(?=\.)' .nvmrc)
else
    export NODE_BUILD_VERSION=16
fi

COMMON_BUILDER=https://raw.githubusercontent.com/RedHatInsights/insights-frontend-builder-common/master

# --------------------------------------------
# Options that must be configured by app owner
# --------------------------------------------
IQE_PLUGINS="hms-content"
IQE_MARKER_EXPRESSION="smoke"
IQE_FILTER_EXPRESSION=""

set -exv
# source is preferred to | bash -s in this case to avoid a subshell
source <(curl -sSL $COMMON_BUILDER/src/frontend-build.sh)
BUILD_RESULTS=$?

# Stubbed out for now
mkdir -p $WORKSPACE/artifacts
cat << EOF > $WORKSPACE/artifacts/junit-dummy.xml
<testsuite tests="1">
    <testcase classname="dummy" name="dummytest"/>
</testsuite>
EOF

# teardown_docker
exit $BUILD_RESULTS
