REPO_VERSION=$(pnpm pkg get version | sed 's/"//g')
# PUBLISHED_VERSION will be blank if the package is not published yet (404).
PUBLISHED_VERSION=$(pnpm view "$PNPM_PACKAGE_NAME" version)
if [ $REPO_VERSION != "$PUBLISHED_VERSION" ]
  then
    pnpm publish --publish-branch=master --access=public || exit 1
    git tag $PNPM_PACKAGE_NAME@$REPO_VERSION
fi
