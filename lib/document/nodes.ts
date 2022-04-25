import { Indentable } from './indentable.js'
import { JsonValueBase } from './types-internal.js';


export class JsonArray extends Indentable implements JsonValueBase
{
	private _elements: Array< JsonNodeType > = [ ];

	public sourceParentFlow: JsonValueBase[ 'sourceParentFlow' ] = undefined;

	public override getChildrenNodes( )
	{
		return this._elements;
	}

	get elements( ): ReadonlyArray< JsonNodeType >
	{
		return this._elements;
	}

	set elements( elements: ReadonlyArray< JsonNodeType > )
	{
		this._elements = [ ...elements ];
	}

	add( value: JsonNodeType )
	{
		this._elements.push( value );
	}

	insert( value: JsonNodeType, beforeIndex: number )
	{
		this._elements.splice( beforeIndex, 0, value );
	}

	get( index: number )
	{
		return this._elements[ index ];
	}

	removeAt( index: number )
	{
		if ( index < 0 || index >= this._elements.length )
			throw new Error( `Can't remove element at ${index}` );
		return this._elements.splice( index, 1 )[ 0 ]!;
	}

	toJS( ): unknown
	{
		return this._elements.map( elem => elem.toJS( ) );
	}
}

interface JsonObjectProperty
{
	name: string;
	value: JsonNodeType;
}

export class JsonObject extends Indentable implements JsonValueBase
{
	private _properties: Array< JsonObjectProperty > = [ ];

	public sourceParentFlow: JsonValueBase[ 'sourceParentFlow' ] = undefined;

	public override getChildrenNodes( )
	{
		return this._properties.map( ( { value } ) => value );
	}

	get properties( ): ReadonlyArray< JsonObjectProperty >
	{
		return this._properties;
	}

	set properties( properties: ReadonlyArray< JsonObjectProperty > )
	{
		const uniq =
			[
				...new Map(
					properties.map( prop => [ prop.name, prop.value ] )
				).entries( )
			]
			.map( ( entry ): JsonObjectProperty => ( {
				name: entry[ 0 ],
				value: entry[ 1 ],
			} ) );

		this._properties = uniq;
	}

	add( name: string, value: JsonNodeType, ordered: boolean )
	{
		const existing = this._properties.find( prop => prop.name === name );
		if ( existing )
			existing.value = value;
		else
		{
			if ( !ordered )
				this._properties.push( { name, value } );
			else
			{
				// Find the first good place to put this property.
				// Since the source object might not be sorted, this is a best
				// effort implementation.
				let i = 0;
				for ( ; i < this._properties.length; ++i )
				{
					const cmp =
						this._properties[ i ]!.name.localeCompare( name );

					if ( cmp === 1 )
						break;
				}
				this._properties.splice( i, 0, { name, value } );
			}
		}
	}

	get( prop: string )
	{
		return this._properties.find( ( { name } ) => name === prop )?.value;
	}

	remove( prop: string )
	{
		const index = this._properties.findIndex( ( { name } ) =>
			name === prop
		);
		if ( index < 0 || index >= this._properties.length )
			throw new Error( `Can't remove property ${prop}, doesn't exist` );

		const value = this._properties[ index ]!.value;
		this._properties.splice( index, 1 );
		return value;
	}

	toJS( ): unknown
	{
		return Object.fromEntries(
			this._properties.map( ( { name, value } ) =>
				[ name, value.toJS( ) ]
			)
		);
	}
}

export class JsonPrimitiveBase< Type > implements JsonValueBase
{
	public sourceParentFlow: JsonValueBase[ 'sourceParentFlow' ] = undefined;

	public constructor( private _value: Type, private _raw: string ) { }

	get value( )
	{
		return this._value;
	}

	set value( value: Type )
	{
		this._value = value;
		this._raw = JSON.stringify( value );
	}

	get raw( )
	{
		return this._raw;
	}

	toJS( ): unknown
	{
		return this.value;
	}
}

export class JsonNull extends JsonPrimitiveBase< null > { }
export class JsonBoolean extends JsonPrimitiveBase< boolean > { }
export class JsonNumber extends JsonPrimitiveBase< number > { }
export class JsonString extends JsonPrimitiveBase< string > { }

export type JsonPrimitive = JsonNull | JsonBoolean | JsonNumber | JsonString;

export type JsonNodeType =
	| JsonArray
	| JsonObject
	| JsonNull
	| JsonBoolean
	| JsonNumber
	| JsonString;

export type JsonNodeTypeNames =
	| 'array'
	| 'object'
	| 'null'
	| 'boolean'
	| 'number'
	| 'string';

export function getNodeTypeName( node: JsonNodeType ): JsonNodeTypeNames
{
	if ( node instanceof JsonArray ) return 'array';
	else if ( node instanceof JsonObject) return 'object';
	else if ( node instanceof JsonNull) return 'null';
	else if ( node instanceof JsonBoolean) return 'boolean';
	else if ( node instanceof JsonNumber) return 'number';
	else if ( node instanceof JsonString) return 'string';
	else throw new Error( `Internal error` );
}

type PrimitiveJSType =
	| undefined
	| Function
	| symbol
	| bigint
	| number
	| string
	| boolean
	| null;

type ComplexJSType = ( Record< any, unknown > ) | ( unknown[ ] );

function isPrimitiveJS( value: unknown ): value is PrimitiveJSType
{
	return (
		typeof value === 'undefined'
		||
		typeof value === 'function'
		||
		typeof value === 'symbol'
		||
		typeof value === 'bigint'
		||
		typeof value === 'number'
		||
		typeof value === 'string'
		||
		typeof value === 'boolean'
		||
		value === null
	);
}

export function nodeFromPrimitiveJS( value: PrimitiveJSType )
: JsonNodeType | undefined
{
	if (
		typeof value === 'undefined'
		||
		typeof value === 'function'
		||
		typeof value === 'symbol'
	)
		return undefined;
	else if ( typeof value === 'bigint' || typeof value === 'number' )
		// Coerces BigInt to Number internally, but keeps JSON resolution
		return new JsonNumber( Number( value ).valueOf( ), `${value}` );
	else if ( typeof value === 'string' )
		return new JsonString( value, JSON.stringify( value ) );
	else if ( typeof value === 'boolean' )
		return new JsonBoolean( value, JSON.stringify( value ) );
	else if ( value === null )
		return new JsonNull( value, JSON.stringify( value ) );
}

export function nodeFromJS( value: unknown ): JsonNodeType | undefined
{
	if ( isPrimitiveJS( value ) )
		return nodeFromPrimitiveJS( value );

	const container = value as ComplexJSType;

	if ( Array.isArray( container ) )
	{
		const ret = new JsonArray( );

		if ( container.length === 0 )
			ret.flow = undefined;

		container.forEach( elem =>
		{
			const node = nodeFromJS( elem );
			if ( node !== undefined )
			{
				ret.add( node );
				node.sourceParentFlow = ret.flow;
			}
		} );

		return ret;
	}

	const ret = new JsonObject( );

	const props = Object.entries( container )
		.map( ( [ key, value ] ) =>
		{
			const node = nodeFromJS( value );

			if ( typeof key !== 'string' || node === undefined )
				return;

			return [ key, node ] as const;
		} )
		.filter( ( v ): v is NonNullable< typeof v > => !!v )
		.sort( ( a, b ) => a[ 0 ].localeCompare( b[ 0 ] ) );

	if ( props.length === 0 )
		ret.flow = undefined;

	props.forEach( ( [ key, node ] ) =>
	{
		ret.add( key, node, false );
		node.sourceParentFlow = ret.flow;
	} );

	return ret;
}
