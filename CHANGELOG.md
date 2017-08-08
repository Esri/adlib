# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

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
