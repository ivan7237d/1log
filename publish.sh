REPO_VERSION=$(pnpm pkg get version | sed 's/"//g')
PUBLISHED_VERSION=$(pnpm view "$PNPM_PACKAGE_NAME" version)
echo $REPO_VERSION $PUBLISHED_VERSION
if [ $REPO_VERSION = $PUBLISHED_VERSION ]
  then
    # pnpm publish
    # git tag $PNPM_PACKAGE_NAME@$REPO_VERSION
    echo $PNPM_PACKAGE_NAME@$REPO_VERSION
fi
