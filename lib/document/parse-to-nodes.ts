// @ts-expect-error
import lexer from 'json-lexer'

import type { AnyPrimitiveToken, LexerTokens } from '../types-internal.js'
import { isPrimitiveToken, extractWhitespace, Whitespace } from './tokens.js'
import { decideIndentations, Indentable } from './indentable.js'
import {
	JsonObject,
	JsonArray,
	JsonNumber,
	JsonString,
	JsonNull,
	JsonBoolean,
	type JsonPrimitive,
	type JsonNodeType,
} from './nodes.js'


export interface ParseResult
{
	initialIndentation: Indentable;
	root: JsonNodeType;
}

export function parse( json: string ): ParseResult
{
	const tokens = lexer( json );

	const { whitespace: initialWhitespace, consumedTokens: pos } =
		extractWhitespace( tokens, 0 );

	return {
		initialIndentation: initialWhitespace.indentable,
		root: makeJsonAny( tokens, pos ).value,
	};
}

interface ConstructedStep< T extends JsonNodeType >
{
	value: T;
	consumedTokens: number;
}

function makeJsonPrimitive( token: AnyPrimitiveToken ): JsonPrimitive
{
	return token.type === 'string'
		? new JsonString( token.value, token.raw )
		: token.type === 'number'
		? new JsonNumber( token.value, token.raw )
		: typeof token.value === 'boolean'
		? new JsonBoolean( token.value, token.raw )
		: new JsonNull( token.value, token.raw );
}

// tokens begins _inside_ the '{' or '['
function makeJsonObject( tokens: LexerTokens, pos: number )
: ConstructedStep< JsonObject >
{
	const ret = new JsonObject( );

	const whitespaces: Array< Whitespace > = [ ];

	let i = pos;
	for ( ; i < tokens.length; ++i )
	{
		const { whitespace, consumedTokens } = extractWhitespace( tokens, i );

		i += consumedTokens;
		whitespaces.push( whitespace );

		const peekToken = tokens[ i ]!;

		if ( peekToken.type === 'string' )
		{
			// Property name
			const name = peekToken.value;
			++i;

			i += jumpWhitespace( tokens, i );

			if (
				tokens[ i ]!.type !== 'punctuator'
				||
				tokens[ i ]!.value !== ':'
			)
				throw new Error( `Unexpected token ${ tokens[ i ]!.type }` );
			++i;

			i += jumpWhitespace( tokens, i );

			const { value, consumedTokens } = makeJsonAny( tokens, i );

			i += consumedTokens;

			// Jump whitespace until ',' or '}'
			i += jumpWhitespace( tokens, i );

			// Jump back, since looping will ++
			--i;

			ret.add( name, value, false );
		}
		else if ( peekToken.type === 'punctuator' )
		{
			if ( peekToken.value === '}' )
			{
				// End of object
				++i;
				break;
			}
			else if ( peekToken.value !== ',' )
				throw new Error(
					`Unexpected punctuation "${peekToken.value}"`
				);
		}
		else
			throw new Error(
				`Failed to parse JSON. Unexpected ${tokens[ i ]!.type}`
			);
	}

	const hasNewline = whitespaces.some( whitespace => whitespace.hasNewline );
	ret.setIndent(
		decideIndentations(
			whitespaces.map( whitespace => whitespace.indentable )
		)
	);
	ret.flow = !hasNewline;

	return { value: ret, consumedTokens: i - pos + 1 };
}

function makeJsonArray( tokens: LexerTokens, pos: number )
: ConstructedStep< JsonArray >
{
	const ret = new JsonArray( );

	const whitespaces: Array< Whitespace > = [ ];

	let i = pos;
	for ( ; i < tokens.length; ++i )
	{
		const { whitespace, consumedTokens } = extractWhitespace( tokens, i );

		i += consumedTokens;
		whitespaces.push( whitespace );

		const peekToken = tokens[ i ]!;

		if ( peekToken.type === 'punctuator' )
		{
			if ( peekToken.value === ']' )
			{
				// End of array
				++i;
				break;
			}
			else if ( peekToken.value !== ',' )
				throw new Error(
					`Unexpected punctuation "${peekToken.value}"`
				);
		}
		else
		{
			const { value, consumedTokens } = makeJsonAny( tokens, i );
			i += consumedTokens;

			// Jump whitespace until ',' or ']'
			i += jumpWhitespace( tokens, i );

			// Jump back, since looping will ++
			--i;

			ret.add( value );
		}
	}

	const hasNewline = whitespaces.some( whitespace => whitespace.hasNewline );
	ret.setIndent(
		decideIndentations(
			whitespaces.map( whitespace => whitespace.indentable )
		)
	);
	ret.flow = !hasNewline;

	return { value: ret, consumedTokens: i - pos + 1 };
}

function makeJsonAny( tokens: LexerTokens, pos: number )
: ConstructedStep< JsonNodeType >
{
	const firstToken = tokens[ pos ]!;

	if ( isPrimitiveToken( firstToken ) )
		return {
			consumedTokens: 1,
			value: makeJsonPrimitive( firstToken ),
		};
	else if ( firstToken.value === '{' )
		return makeJsonObject( tokens, pos + 1 );
	else if ( firstToken.value === '[' )
		return makeJsonArray( tokens, pos + 1 );

	throw new Error( 'Failed to parse JSON document' );
}

/**
 * Returns 1 if the first token at <pos> is whitespace, otherwise 0
 */
function jumpWhitespace( tokens: LexerTokens, pos: number ): 0 | 1
{
	return tokens[ pos ]?.type === 'whitespace' ? 1 : 0;
}
