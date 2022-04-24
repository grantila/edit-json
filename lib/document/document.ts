import type { LocationPath } from 'jsonpos'

import {
	JsonArray,
	JsonNodeType,
	JsonObject,
	JsonPrimitiveBase,
} from './nodes.js'
import { Indentable } from './indentable.js'
import { parse } from './parse-to-nodes.js'
import { ensureNumericIndex } from '../utils.js'
import { type JsonDocumentOptions } from './types.js'
import { getDocumentOptions } from './utils.js'


export class JsonDocument extends Indentable
{
	public readonly options: JsonDocumentOptions;

	constructor(
		private json: string,
		public root: JsonNodeType,
		private rootIndentation: Indentable,
		options?: Partial< JsonDocumentOptions >
	)
	{
		super( );

		this.options = getDocumentOptions( options );
	}

	public getAt( path: LocationPath ): JsonNodeType | undefined
	{
		if ( path.length === 0 )
			return this.root;

		return path.reduce(
			( prev: JsonNodeType | undefined, cur ) =>
			{
				if ( !prev )
					return undefined;

				if ( prev instanceof JsonObject )
				{
					const prop = `${cur}`;

					return prev.properties
						.find( entry => entry.name === prop )
						?.value;
				}
				else if ( prev instanceof JsonArray )
				{
					const index = ensureNumericIndex( cur );

					return prev.elements[ index ];
				}

				return undefined;
			},
			this.root
		);
	}

	toString( ): string
	{
		const chooseTabs = this.#useTabs(
			this.root instanceof Indentable
			? this.root.tabs
			: undefined
		);

		const rootIndent =
			this.rootIndentation.indentString( chooseTabs );

		if ( this.root instanceof JsonPrimitiveBase )
			return rootIndent + this.root.raw;

		const stringify = ( node: JsonNodeType, parentIndent: string ) =>
		{
			if ( node instanceof JsonPrimitiveBase )
				return node.raw;

			const indent = node.flow ? '' : node.indentString( chooseTabs );

			if ( node instanceof JsonArray )
			{
				const ret = [ node.flow ? '[ ' : '[\n' ];

				node.elements.forEach( ( element, i ) =>
				{
					ret.push( indent + stringify( element, indent ) );

					if ( i < node.elements.length - 1 )
						ret.push( node.flow ? ', ' : ',\n' );
					else
						ret.push( node.flow ? ' ' : `\n${parentIndent}` );
				} );

				ret.push( ']' );
				return ret.join( '' );
			}
			else if ( node instanceof JsonObject )
			{
				const ret = [ node.flow ? '{ ' : '{\n' ];

				node.properties.forEach( ( prop, i ) =>
				{
					ret.push(
						indent
						+ JSON.stringify( prop.name )
						+ ': '
						+ stringify( prop.value, indent )
					);

					if ( i < node.properties.length - 1 )
						ret.push( node.flow ? ', ' : ',\n' );
					else
						ret.push( node.flow ? ' ' : `\n${parentIndent}` );
				} );

				ret.push( '}' );
				return ret.join( '' );
			}
			else
				throw new Error( `Unexpected node type` );
		};

		return rootIndent + stringify( this.root, rootIndent );
	}

	toJSON( ): string
	{
		return this.toString( );
	}

	// Detect whether to use tabs or spaces by looking at the input JSON
	#useTabs( tabs?: boolean )
	{
		if ( tabs === true || tabs === false )
			return tabs;

		const partition = this.json
			.split( '\n' )
			.map( line =>
				line.startsWith( '\t' )
				? true
				: line.startsWith( ' ' )
				? false
				: undefined
			)
			.filter( ( v ): v is NonNullable< typeof v > => v !== undefined );

		if ( partition.length === 0 )
			return undefined;

		if ( partition.filter( val => val ).length * 2 > partition.length )
			return true;
		return false;
	}
}

export function parseJson( json: string, options?: JsonDocumentOptions )
{
	const parsed = parse( json );

	return new JsonDocument(
		json,
		parsed.root,
		parsed.initialIndentation,
		{
			whitespace: 'auto',
			...options,
		}
	);
}
