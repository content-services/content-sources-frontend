#!/bin/bash

# Default values for URL and target string
DEFAULT_URL="https://gitlab.cee.redhat.com/service/app-interface/-/raw/master/data/services/insights/content-sources/deploy.yml"
DEFAULT_TARGET_STRING="/services/insights/content-sources/namespaces/content-sources-prod.yml"

# Use defaults for URL and target string
url=$DEFAULT_URL
target_string=$DEFAULT_TARGET_STRING

# Download the YAML file, ignoring certificate requirements
yaml_file="downloaded_file.yml"
curl -k -s -o $yaml_file $url

# Check if curl command was successful
if [ $? -ne 0 ]; then
  echo "Failed to download the file from $url"
  exit 1
fi

# Check if the downloaded file is empty or not found
if [ ! -s $yaml_file ]; then
  echo "The file is empty or not found."
  exit 1
fi

# Parse the YAML file to find the target string and return the next line without "ref: "
commit_hash=$(awk -v target="$target_string" '
{
    if ($0 ~ target) {
        getline
        if ($0 ~ /^ *ref: /) {
            sub(/^ *ref: /, "", $0)
            print $0
            exit
        }
    }
}' $yaml_file)

# Check if the commit hash was found
if [ -z "$commit_hash" ]; then
  echo "The specified target string was not found in the YAML file."
  exit 1
else
  echo "The commit hash is: $commit_hash"
fi

# Clean up
rm $yaml_file

# Variables for cloning the repo
REPO_URL="https://github.com/content-services/content-sources-backend.git"
FOLDER_PATH="API"
LOCAL_DIR="_playwright-tests/Integration"
rm -rf $TEMP_DIR
# Create a temporary directory
TEMP_DIR=./temp_backend
mkdir $TEMP_DIR

# Remove the existing folder in the local directory if it exists
rm -rf $LOCAL_DIR/$FOLDER_PATH

# Clone the repo and checkout the specific commit
git clone $REPO_URL $TEMP_DIR
cd $TEMP_DIR
git checkout $commit_hash

# Copy the specific folder to the local directory
cp -r _playwright-tests/tests/$FOLDER_PATH ../$LOCAL_DIR

cp -r $TEMP_DIR/_playwright-tests/test-utils/ ./

# Clean up the temporary directory
cd ../
rm -rf $TEMP_DIR

echo "Folder copied to $LOCAL_DIR/$FOLDER_PATH"
