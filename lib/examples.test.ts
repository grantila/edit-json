import { jsonPatch } from './rfc6902.js'
import type { Operation } from './types-rfc6902.js'


describe( 'readme', ( ) =>
{
	it( 'first example', ( ) =>
	{
		const before =
`{
    "x": "non-alphanumerically ordered properties, obviously",
    "foo": [ "same", "line", "array" ],
    "bar": {
        "some": "object"
    }
}`;
		const after =
`{
    "x": "non-alphanumerically ordered properties, obviously",
    "bar": {
        "herenow": [ "same", "line", "array" ],
        "some": "object"
    }
}`;

		const operations: Operation[ ] = [
			{
				"op": "move",
				"from": "/foo",
				"path": "/bar/herenow"
			}
		];

		const res = jsonPatch( before, operations );

		expect( res ).toBe( after );
	} );
} );
