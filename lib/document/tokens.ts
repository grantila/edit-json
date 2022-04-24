import {
	AnyPrimitiveToken,
	LexerToken,
	LexerTokens,
	WhitespaceToken,
} from '../types-internal.js'
import { Indentable } from './indentable.js'


export function isPrimitiveToken( token: LexerToken )
: token is AnyPrimitiveToken
{
	return (
		token.type === 'string'
		||
		token.type === 'number'
		||
		token.type === 'literal'
	);
}

export interface ExtractedWhitespace
{
	whitespace: Whitespace;
	consumedTokens: number;
}

export function extractWhitespace( tokens: LexerTokens, pos: number )
: ExtractedWhitespace
{
	const hasWhitespace = tokens[ pos ]?.type === 'whitespace';

	const whitespace =
		hasWhitespace
		? getWhitespace( tokens[ pos ] as WhitespaceToken )
		: { hasNewline: false, indentable: new Indentable( ) };

	return { whitespace, consumedTokens: hasWhitespace ? 1 : 0 };
}

const reWhitespace = /(?:^|(?:.*[\t ])\n)\n*([^\n]+)$/;

// Potentially reconsider the assumption of a tab being 2 spaces
// which is also assumed in Indentable

export interface Whitespace
{
	hasNewline: boolean;
	indentable: Indentable;
}

export function getWhitespace( token: WhitespaceToken ): Whitespace
{
	if ( token.type !== 'whitespace' )
		throw new Error( `Invalid whitespace token: ${token.type}` );

	const hasNewline = token.raw.includes( '\n' );

	const m = token.raw.match( reWhitespace );

	if ( !m || m[ 1 ]!.length === 0 )
		return { hasNewline, indentable: new Indentable( ) };

	const chars = m[ 1 ]!.split( '' );

	const chooseTab = chars[ 0 ] === '\t';

	const numTabs = chars.filter( char => char === '\t' ).length;
	const numSpaces = chars.length - numTabs;

	const numAllSpaces = numSpaces + numTabs * 2;

	if ( chooseTab )
		return {
			hasNewline,
			indentable: new Indentable( numAllSpaces / 2, true ),
		};
	return {
		hasNewline,
		indentable: new Indentable( numAllSpaces, false ),
	};
}
