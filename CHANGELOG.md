# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).


# 2.2.3
### Fixed
- we had a regression where `{{{obj.val}}}` was not coming out as `{TheValue}` which means info window templating was broken. Also Regex--

# 2.2.2 npm registry ate it

# 2.2.1
### Added
- support for `default` values like `Hello my name is {{obj.name||Slim Shady}}`. If `obj.name` is undefined, the default value is used.

# 2.2.0
Yanked

# 2.1.1
### Fixed
- issue with build of 2.1.0

# 2.1.0
### Added
- ability to specify a hierarchy of possible values in order of preference in a template, e.g. `this dataset was last modified {{metadata.some.nested.timestamp||item.modified}}`

# 2.0.0
### Changed
- removed lodash depencencies. Public API remains the same, and all existing tests pass. Should be a drop-in replacement, but bumped to 2.0.0 because we removed the deps which others may be using indirectly.

# 1.1.1
### Fixed
- removed rogue console statements

# 1.1.0
### Fixed
- falsey values were being incorrectly omitted from arrays - i.e. `[255,0,0,155]` would return as `[255,155]`

# 1.0.1
### Added
- un-minfied build output `adlib.js`
- renamed `profiles/dev.js` --> `profiles/umd.js` as it's actually doing umd builds

# 1.0.0
### Added
- `:optional` transform
- `/docs/js` folder that contains simple homepage & current build - mainly for use prototyping stuff in jsbin

# 0.2.0
### Changed
- transform fn signature changed to `fn(key, value, settings)`
- removed need to key|value specifier in the template `{{<key>:<transformFnName>}}`

# 0.1.0
## Added
- optional `transforms` parameter - see `lib/adlib.spec.js` and README.md for details
- support for `{{<key>:<transformFnName>:<type>}}` where `type === 'value' || 'key'`. If not specified, the `value` will be used.

# 0.0.7
## Added
- adlib and tests
