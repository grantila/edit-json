import { jsonPatch } from './rfc6902.js'
import type { Operation } from './types-rfc6902.js'


describe( 'rfc6902', ( ) =>
{
	describe( 'add', ( ) =>
	{
		it( 'object add ordered (after)', ( ) =>
		{
			const before = `{\n  "foo": "bar"\n}`;
			const after = `{\n  "foo": "bar",\n  "next": 42\n}`;

			const operations: Operation[ ] = [
				{ op: 'add', path: '/next', value: 42 }
			];

			const res = jsonPatch( before, operations );

			expect( res ).toBe( after );
		} );

		it( 'object add ordered (before)', ( ) =>
		{
			const before = `{\n  "foo": "bar"\n}`;
			const after = `{\n  "bar": 42,\n  "foo": "bar"\n}`;

			const operations: Operation[ ] = [
				{ op: 'add', path: '/bar', value: 42 }
			];

			const res = jsonPatch( before, operations );

			expect( res ).toBe( after );
		} );

		it( 'array add at index', ( ) =>
		{
			const before = `[\n  "foo",\n  "bar"\n]`;
			const after = `[\n  "foo",\n  "baz",\n  "bar"\n]`;

			const operations: Operation[ ] = [
				{ op: 'add', path: '/1', value: "baz" }
			];

			const res = jsonPatch( before, operations );

			expect( res ).toBe( after );
		} );

		it( 'array add at the end', ( ) =>
		{
			const before = `[\n  "foo",\n  "bar"\n]`;
			const after = `[\n  "foo",\n  "bar",\n  "baz"\n]`;

			const operations: Operation[ ] = [
				{ op: 'add', path: '/-', value: "baz" }
			];

			const res = jsonPatch( before, operations );

			expect( res ).toBe( after );
		} );

		it( 'array add invalid index', ( ) =>
		{
			const before = `[\n  "foo",\n  "bar"\n]`;

			const operations: Operation[ ] = [
				{ op: 'add', path: '/x', value: "baz" }
			];

			expect( ( ) => jsonPatch( before, operations ) )
				.toThrowError( /invalid numeric index/i );
		} );
	} );

	describe( 'replace', ( ) =>
	{
		it( 'object replace doesn\'t exist', ( ) =>
		{
			const before = `{\n  "foo": "bar"\n}`;

			const operations: Operation[ ] = [
				{ op: 'replace', path: '/next', value: 42 }
			];

			expect( ( ) => jsonPatch( before, operations ) )
				.toThrowError( /since.*previous.*exist/i );
		} );

		it( 'object replace ordered', ( ) =>
		{
			const before = `{\n  "foo": "bar"\n}`;
			const after = `{\n  "foo": 42\n}`;

			const operations: Operation[ ] = [
				{ op: 'replace', path: '/foo', value: 42 }
			];

			const res = jsonPatch( before, operations );

			expect( res ).toBe( after );
		} );

		it( 'array replace at index', ( ) =>
		{
			const before = `[\n  "foo",\n  "bar"\n]`;
			const after = `[\n  "foo",\n  "baz"\n]`;

			const operations: Operation[ ] = [
				{ op: 'replace', path: '/1', value: "baz" }
			];

			const res = jsonPatch( before, operations );

			expect( res ).toBe( after );
		} );

		it( 'array replace at the end', ( ) =>
		{
			const before = `[\n  "foo",\n  "bar"\n]`;

			const operations: Operation[ ] = [
				{ op: 'replace', path: '/-', value: "baz" }
			];

			expect( ( ) => jsonPatch( before, operations ) )
				.toThrowError( /invalid index/i );
		} );

		it( 'array replace out-of-bounds', ( ) =>
		{
			const before = `[\n  "foo",\n  "bar"\n]`;

			const operations: Operation[ ] = [
				{ op: 'replace', path: '/3', value: "baz" }
			];

			expect( ( ) => jsonPatch( before, operations ) )
				.toThrowError( /invalid index/i );
		} );

		it( 'array replace invalid index', ( ) =>
		{
			const before = `[\n  "foo",\n  "bar"\n]`;

			const operations: Operation[ ] = [
				{ op: 'replace', path: '/x', value: "baz" }
			];

			expect( ( ) => jsonPatch( before, operations ) )
				.toThrowError( /invalid numeric index/i );
		} );
	} );

	describe( 'copy', ( ) =>
	{
		it( 'from object to object', ( ) =>
		{
			const before = `{\n  "foo": { "bar": "baz" },\n  "fee": { }\n}`;
			const after =
				`{\n  "foo": { "bar": "baz" },\n  "fee": { "bar": "baz" }\n}`;

			const operations: Operation[ ] = [
				{ op: 'copy', from: '/foo/bar', path: '/fee/bar' }
			];

			const res = jsonPatch( before, operations );

			expect( res ).toBe( after );
		} );

		it( 'from object to array at index', ( ) =>
		{
			const before = `{\n  "foo": { "bar": "baz" },\n  "fee": [ 1 ]\n}`;
			const after =
				`{\n  "foo": { "bar": "baz" },\n  "fee": [ "baz", 1 ]\n}`;

			const operations: Operation[ ] = [
				{ op: 'copy', from: '/foo/bar', path: '/fee/0' }
			];

			const res = jsonPatch( before, operations );

			expect( res ).toBe( after );
		} );

		it( 'from object to array at end', ( ) =>
		{
			const before = `{\n  "foo": { "bar": "baz" },\n  "fee": [ 1 ]\n}`;
			const after =
				`{\n  "foo": { "bar": "baz" },\n  "fee": [ 1, "baz" ]\n}`;

			const operations: Operation[ ] = [
				{ op: 'copy', from: '/foo/bar', path: '/fee/-' }
			];

			const res = jsonPatch( before, operations );

			expect( res ).toBe( after );
		} );

		it( 'from object that doesn\'t exist', ( ) =>
		{
			const before = `{\n  "foo": { "bar": "baz" },\n  "fee": { }\n}`;

			const operations: Operation[ ] = [
				{ op: 'copy', from: '/fxx/bar', path: '/fee/bar' }
			];

			expect( ( ) => jsonPatch( before, operations ) )
				.toThrowError( /which.*doesn.*exist/i );
		} );

		it( 'from object without such property', ( ) =>
		{
			const before = `{\n  "foo": { "bar": "baz" },\n  "fee": { }\n}`;

			const operations: Operation[ ] = [
				{ op: 'copy', from: '/foo/bad', path: '/fee/bar' }
			];

			expect( ( ) => jsonPatch( before, operations ) )
				.toThrowError( /no value found/i );
		} );

		it( 'from array to array', ( ) =>
		{
			const before = `{\n  "foo": [ "bar", "baz" ],\n  "fee": [ ]\n}`;
			const after =
				`{\n  "foo": [ "bar", "baz" ],\n  "fee": [ "bar" ]\n}`;

			const operations: Operation[ ] = [
				{ op: 'copy', from: '/foo/0', path: '/fee/-' }
			];

			const res = jsonPatch( before, operations );

			expect( res ).toBe( after );
		} );

		it( 'from array to object', ( ) =>
		{
			const before = `{\n  "foo": [ "bar", "baz" ],\n  "fee": { }\n}`;
			const after =
				`{\n  "foo": [ "bar", "baz" ],\n  "fee": { "bak": "bar" }\n}`;

			const operations: Operation[ ] = [
				{ op: 'copy', from: '/foo/0', path: '/fee/bak' }
			];

			const res = jsonPatch( before, operations );

			expect( res ).toBe( after );
		} );

		it( 'from array that doesn\'t exist', ( ) =>
		{
			const before = `{\n  "foo": [ "bar", "baz" ],\n  "fee": { }\n}`;

			const operations: Operation[ ] = [
				{ op: 'copy', from: '/fxx/0', path: '/fee/bar' }
			];

			expect( ( ) => jsonPatch( before, operations ) )
				.toThrowError( /which.*doesn.*exist/i );
		} );

		it( 'from array without such element', ( ) =>
		{
			const before = `{\n  "foo": [ "bar", "baz" ],\n  "fee": { }\n}`;

			const operations: Operation[ ] = [
				{ op: 'copy', from: '/foo/4', path: '/fee/bar' }
			];

			expect( ( ) => jsonPatch( before, operations ) )
				.toThrowError( /no value found/i );
		} );
	} );

	describe( 'move', ( ) =>
	{
		it( 'from object to object target flow', ( ) =>
		{
			const before =
				`{\n  "foo": { "bar": "baz" },\n  "fee": { "a": 1 }\n}`;
			const after =
				`{\n  "foo": { },\n  "fee": { "a": 1, "bar": "baz" }\n}`;

			const operations: Operation[ ] = [
				{ op: 'move', from: '/foo/bar', path: '/fee/bar' }
			];

			const res = jsonPatch( before, operations );

			expect( res ).toBe( after );
		} );

		it( 'from object to object target empty source flow', ( ) =>
		{
			const before =
				`{\n  "foo": { "bar": "baz" },\n  "fee": { }\n}`;
			const after =
				`{\n  "foo": { },\n  "fee": { "bar": "baz" }\n}`;

			const operations: Operation[ ] = [
				{ op: 'move', from: '/foo/bar', path: '/fee/bar' }
			];

			const res = jsonPatch( before, operations );

			expect( res ).toBe( after );
		} );

		it( 'from object to object target empty source non-flow', ( ) =>
		{
			const before =
				`{\n  "foo": {\n    "bar": "baz"\n  },\n  "fee": {\n  }\n}`;
			const after =
				`{\n  "foo": { },\n  "fee": {\n    "bar": "baz"\n  }\n}`;

			const operations: Operation[ ] = [
				{ op: 'move', from: '/foo/bar', path: '/fee/bar' }
			];

			const res = jsonPatch( before, operations );

			expect( res ).toBe( after );
		} );

		it( 'from object to object target non-flow', ( ) =>
		{
			const before = `{
  "foo": {
	"bar": "baz"
  },
  "fee": {
    "a": 1
  }
}`;
			const after = `{
  "foo": { },
  "fee": {
    "a": 1,
    "bar": "baz"
  }
}`;

			const operations: Operation[ ] = [
				{ op: 'move', from: '/foo/bar', path: '/fee/bar' }
			];

			const res = jsonPatch( before, operations );

			expect( res ).toBe( after );
		} );

		it( 'from object to object', ( ) =>
		{
			const before = `{\n  "foo": { "bar": "baz" },\n  "fee": { }\n}`;
			const after = `{\n  "foo": { },\n  "fee": { "bar": "baz" }\n}`;

			const operations: Operation[ ] = [
				{ op: 'move', from: '/foo/bar', path: '/fee/bar' }
			];

			const res = jsonPatch( before, operations );

			expect( res ).toBe( after );
		} );

		it( 'from object to array at index', ( ) =>
		{
			const before = `{\n  "foo": { "bar": "baz" },\n  "fee": [ 1 ]\n}`;
			const after = `{\n  "foo": { },\n  "fee": [ "baz", 1 ]\n}`;

			const operations: Operation[ ] = [
				{ op: 'move', from: '/foo/bar', path: '/fee/0' }
			];

			const res = jsonPatch( before, operations );

			expect( res ).toBe( after );
		} );

		it( 'from object to array at end', ( ) =>
		{
			const before = `{\n  "foo": { "bar": "baz" },\n  "fee": [ 1 ]\n}`;
			const after = `{\n  "foo": { },\n  "fee": [ 1, "baz" ]\n}`;

			const operations: Operation[ ] = [
				{ op: 'move', from: '/foo/bar', path: '/fee/-' }
			];

			const res = jsonPatch( before, operations );

			expect( res ).toBe( after );
		} );

		it( 'from object that doesn\'t exist', ( ) =>
		{
			const before = `{\n  "foo": { "bar": "baz" },\n  "fee": { }\n}`;

			const operations: Operation[ ] = [
				{ op: 'move', from: '/fxx/bar', path: '/fee/bar' }
			];

			expect( ( ) => jsonPatch( before, operations ) )
				.toThrowError( /which.*doesn.*exist/i );
		} );

		it( 'from object without such property', ( ) =>
		{
			const before = `{\n  "foo": { "bar": "baz" },\n  "fee": { }\n}`;

			const operations: Operation[ ] = [
				{ op: 'move', from: '/foo/bad', path: '/fee/bar' }
			];

			expect( ( ) => jsonPatch( before, operations ) )
				.toThrowError( /remove property/i );
		} );

		it( 'from array to array', ( ) =>
		{
			const before = `{\n  "foo": [ "bar", "baz" ],\n  "fee": [ ]\n}`;
			const after = `{\n  "foo": [ "baz" ],\n  "fee": [ "bar" ]\n}`;

			const operations: Operation[ ] = [
				{ op: 'move', from: '/foo/0', path: '/fee/-' }
			];

			const res = jsonPatch( before, operations );

			expect( res ).toBe( after );
		} );

		it( 'from non-flow array to array (source becomes empty)', ( ) =>
		{
			const before = `{\n  "foo": [\n    "bar"\n  ],\n  "fee": [ ]\n}`;
			const after = `{\n  "foo": [ ],\n  "fee": [\n    "bar"\n  ]\n}`;

			const operations: Operation[ ] = [
				{ op: 'move', from: '/foo/0', path: '/fee/-' }
			];

			const res = jsonPatch( before, operations );

			expect( res ).toBe( after );
		} );

		it( 'from array to object', ( ) =>
		{
			const before = `{\n  "foo": [ "bar", "baz" ],\n  "fee": { }\n}`;
			const after =
				`{\n  "foo": [ "baz" ],\n  "fee": { "bak": "bar" }\n}`;

			const operations: Operation[ ] = [
				{ op: 'move', from: '/foo/0', path: '/fee/bak' }
			];

			const res = jsonPatch( before, operations );

			expect( res ).toBe( after );
		} );

		it( 'from array that doesn\'t exist', ( ) =>
		{
			const before = `{\n  "foo": [ "bar", "baz" ],\n  "fee": { }\n}`;

			const operations: Operation[ ] = [
				{ op: 'move', from: '/fxx/0', path: '/fee/bar' }
			];

			expect( ( ) => jsonPatch( before, operations ) )
				.toThrowError( /which.*doesn.*exist/i );
		} );

		it( 'from array without such element', ( ) =>
		{
			const before = `{\n  "foo": [ "bar", "baz" ],\n  "fee": { }\n}`;

			const operations: Operation[ ] = [
				{ op: 'move', from: '/foo/4', path: '/fee/bar' }
			];

			expect( ( ) => jsonPatch( before, operations ) )
				.toThrowError( /remove element/i );
		} );

		it( 'move object props deeply (flow source)', ( ) =>
		{
			const before = `{\n  "foo": { "bar": "baz" }\n}`;
			const after = `{\n  "foo": { },\n  "fxx": { "bar": "baz" }\n}`;

			const operations: Operation[ ] = [
				{ op: 'add', path: '/fxx', value: { } },
				{ op: 'move', from: '/foo/bar', path: '/fxx/bar' }
			];

			const res = jsonPatch( before, operations );

			expect( res ).toBe( after );
		} );

		it( 'move object props deeply (non-flow source)', ( ) =>
		{
			const before = `{\n  "foo": {\n    "bar": "baz"\n  }\n}`;
			const after =
				`{\n  "foo": { },\n  "fxx": {\n    "bar": "baz"\n  }\n}`;

			const operations: Operation[ ] = [
				{ op: 'add', path: '/fxx', value: { } },
				{ op: 'move', from: '/foo/bar', path: '/fxx/bar' }
			];

			const res = jsonPatch( before, operations );

			expect( res ).toBe( after );
		} );
	} );
} );
