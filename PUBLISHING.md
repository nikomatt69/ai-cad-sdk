# Publishing Guide

This monorepo uses [Changesets](https://github.com/changesets/changesets) to manage versions, create changelogs, and publish to npm.

## Publishing Process

1. First, make sure you're logged in to npm:
   ```bash
   npm login
   ```

2. Create a new changeset (documents what changes will be published):
   ```bash
   yarn changeset
   ```
   - Select the packages you want to publish
   - Choose the version bump type (major, minor, patch)
   - Add a description of the changes

3. Version the packages (updates package.json files and changelogs):
   ```bash
   yarn version-packages
   ```

4. Review the changes and make sure everything looks correct

5. Publish the packages to npm:
   ```bash
   yarn release
   ```

## Version Bump Types

- `major` (1.0.0 -> 2.0.0): Breaking changes
- `minor` (1.0.0 -> 1.1.0): New features (backwards compatible)
- `patch` (1.0.0 -> 1.0.1): Bug fixes and minor changes

## Package Dependencies

The monorepo packages are:
- @ai-cad-sdk/types
- @ai-cad-sdk/utils
- @ai-cad-sdk/core
- @ai-cad-sdk/adapters
- @ai-cad-sdk/react

Dependencies between packages are managed automatically by Changesets.

## Troubleshooting

If you encounter issues during publishing:

1. Make sure you're logged in to npm with the correct account
2. Check that all packages build successfully: `yarn build`
3. Verify that all tests pass: `yarn test`
4. Ensure your working directory is clean (no uncommitted changes)
5. Check that the version numbers in package.json files are correct
6. Make sure you have the necessary npm permissions for the @ai-cad-sdk organization

## CI/CD

The repository is configured to:
1. Build and test packages on every PR
2. Create release PRs when changesets are added
3. Publish to npm when release PRs are merged

For more information, see the [Changesets documentation](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md).
