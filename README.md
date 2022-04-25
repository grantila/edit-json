[![npm version][npm-image]][npm-url]
[![downloads][downloads-image]][npm-url]
[![build status][build-image]][build-url]
[![coverage status][coverage-image]][coverage-url]
[![Language grade: JavaScript][lgtm-image]][lgtm-url]


# edit-json

Edit a _textual_ JSON (not a JavaScript object) for a minimal diff, either programatically or by applying a [_JSON Patch_ (RFC6902)](https://www.rfc-editor.org/rfc/rfc6902).

When serializing the result down to a string, it'll resemble the source JSON as much as possible with regards to property order, whitespace (indentation) and _flow types_ (arrays and objects on one line).

Editing JSON is easy, just `JSON.parse()` and play around, then `JSON.stringify()`. To apply a _JSON Patch_, there are [several](https://www.npmjs.com/package/fast-json-patch) [packages](https://www.npmjs.com/package/rfc6902) [out](https://www.npmjs.com/package/json-bigint-patch) [there](https://www.npmjs.com/package/jsonpatch).

This package focuses not on working with JSON as a JavaScript object, but as its textual representation. The package parses the JSON string (as e.g. from a file) as tokens, builds up a logical representation of it, and then applies transformations to that representation. Whitespace (tabs, spaces) as well as multi-line or single-line arrays/objects are remembered.

To do the same with YAML, check out [yaml-diff-patch](https://www.npmjs.com/package/yaml-diff-patch).


# Example

Given:

```json
{
    "x": "non-alphanumerically ordered properties, obviously",
    "foo": [ "same", "line", "array" ],
    "bar": {
        "some": "object"
    }
}
```

Applying the JSON Patch:

```json
[ {
    "op": "move",
    "from": "/foo",
    "path": "/bar/herenow"
} ]
```

Produces:

```json
{
    "x": "non-alphanumerically ordered properties, obviously",
    "bar": {
        "herenow": [ "same", "line", "array" ],
        "some": "object"
    }
}
```

Properties aren't re-ordered ("x" is still first), but by default, it will try to _insert_ properties orderly, such as when creating "herenow" in "bar". It'll be added before "some", "h" < "s". This is done with a best effort, since it's not always possible (the object might have unordered properties).

Note also that the array is not split into multiple lines, which would happen with default `JSON.stringify` (unless the whole document is one line of course). The source format is kept if possible.


# Install

`npm i edit-json` or `yarn add edit-json`

This is a [pure ESM][pure-esm] package, and requires Node.js >=14.13.1


# Simple usage

### Exports

The package exports `parseJson` (to be documented) and `jsonPatch`.

### Definition

`jsonPatch( json: string, operations: Operations[], options: Options ): string`

Applies a list of _JSON Patch_ operations to the source `json` and returns the new json string.

The options are:

  - `whitespace` ('auto' | 'tabs' | number): Specifies whitespace strategy. Defaults to 'auto'. Force tabs using 'tabs' or spaces using number (e.g. 2 or 4).
  - `ordered` (boolean): Try to insert new properties in order.

### RFC6902

By the spec RFC6902, the `path` property of an operation (and the `from` in `move` and `copy` operations) must be a well-formed JSON Pointer, with encoded path segments. [`jsonpos`](https://github.com/grantila/jsonpos/#json-pointer-paths) exposes helpers for this.

To be more practical for programmatic usage, this package allows not only JSON Pointer strings as paths, but also arrays of (raw unencoded) strings. So you can use e.g. `"/foo/bar"` or `["foo", "bar"]`, whichever you prefer. For path segments containing e.g. a slash, it would be `"/f~1o~1o/bar"` or `["f/o/o", "bar"]`.


[npm-image]: https://img.shields.io/npm/v/edit-json.svg
[npm-url]: https://npmjs.org/package/edit-json
[downloads-image]: https://img.shields.io/npm/dm/edit-json.svg
[build-image]: https://img.shields.io/github/workflow/status/grantila/edit-json/Master.svg
[build-url]: https://github.com/grantila/edit-json/actions?query=workflow%3AMaster
[coverage-image]: https://coveralls.io/repos/github/grantila/edit-json/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/grantila/edit-json?branch=master
[lgtm-image]: https://img.shields.io/lgtm/grade/javascript/g/grantila/edit-json.svg?logo=lgtm&logoWidth=18
[lgtm-url]: https://lgtm.com/projects/g/grantila/edit-json/context:javascript
[pure-esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
