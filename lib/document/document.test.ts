import { fileURLToPath } from 'node:url'
import { resolve as resolvePath, dirname } from 'node:path'
import { readFile } from 'node:fs/promises'

import { parseJson } from './document.js'


const __dirname = dirname( fileURLToPath( import.meta.url ) );
const rootDir = resolvePath( __dirname, '..', '..' );

describe( 'document', ( ) =>
{
	describe( 'primitives', ( ) =>
	{
		it( 'null', ( ) =>
		{
			const parsed = parseJson( 'null' );

			expect( parsed.toJSON( ) ).toBe( 'null' );
		} );

		it( 'boolean', ( ) =>
		{
			const parsed = parseJson( 'false' );

			expect( parsed.toJSON( ) ).toBe( 'false' );
		} );

		it( 'boolean with whitespace', ( ) =>
		{
			const parsed = parseJson( '  true ' );

			expect( parsed.toJSON( ) ).toBe( '  true' );
		} );

		it( 'string', ( ) =>
		{
			const parsed = parseJson( ' "foo bar\\nnext line"' );

			expect( parsed.toJSON( ) ).toBe( ' "foo bar\\nnext line"' );
		} );

		it( 'number pos', ( ) =>
		{
			const parsed = parseJson( '3.14' );

			expect( parsed.toJSON( ) ).toBe( '3.14' );
		} );

		it( 'number neg', ( ) =>
		{
			const parsed = parseJson( '-3.14' );

			expect( parsed.toJSON( ) ).toBe( '-3.14' );
		} );

		it( 'number sci pos', ( ) =>
		{
			const parsed = parseJson( '123e5' );

			expect( parsed.toJSON( ) ).toBe( '123e5' );
		} );

		it( 'number sci neg', ( ) =>
		{
			const parsed = parseJson( '-123e5' );

			expect( parsed.toJSON( ) ).toBe( '-123e5' );
		} );
	} );

	describe( 'objects', ( ) =>
	{
		it( 'empty', ( ) =>
		{
			const parsed = parseJson( ' {}' );

			expect( parsed.toJSON( ) ).toBe( ' { }' );
		} );

		it( 'flow', ( ) =>
		{
			const parsed = parseJson( '{ "foo": "bar" }' );

			expect( parsed.toJSON( ) ).toBe( '{ "foo": "bar" }' );
		} );

		it( 'non-flow', ( ) =>
		{
			const parsed = parseJson( '{\n  "foo": "bar"}' );

			expect( parsed.toJSON( ) ).toBe( '{\n  "foo": "bar"\n}' );
		} );

		it( 'self packge.json', async ( ) =>
		{
			const pkgJsonFile = resolvePath( rootDir, 'package.json' );
			const pkgJson = await readFile( pkgJsonFile, 'utf-8' );

			const parsed = parseJson( pkgJson );

			expect( parsed.toJSON( ).trimEnd( ) ).toBe( pkgJson.trimEnd( ) );
		} );
	} );
} );
