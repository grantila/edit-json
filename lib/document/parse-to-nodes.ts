import {
	parse as parseCst,
	CstValueNode,
	CstNodeObject,
	CstNodeArray,
} from 'json-cst'

import {
	isPrimitiveNode,
	Whitespace,
	getWhitespace,
	CstNodePrimitive,
} from './cst.js'
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
import { JsonValueBase } from './types-internal.js'


export interface ParseResult
{
	initialIndentation: Indentable;
	trailingWhitespace: string;
	root: JsonNodeType;
}

export function parse( json: string ): ParseResult
{
	const doc = parseCst( json );

	const initialIndentation =
		doc.whitespaceBefore
		? getWhitespace( doc.whitespaceBefore ).indentable
		: new Indentable( 0 );

	const trailingWhitespace =
		doc.whitespaceAfter?.value ?? '';

	const root = makeJsonAny( doc.root );

	makeRelativeIndentations( root );

	return { initialIndentation, trailingWhitespace, root };
}

function makeRelativeIndentations( node: JsonNodeType )
{
	if ( !( node instanceof Indentable ) )
		return;

	const docTabs = node.tabs ?? false;

	const recurse = ( node: Indentable & JsonValueBase, indent: number ) =>
	{
		const children = node.getChildrenNodes( );

		for ( const child of children )
		{
			if ( child instanceof Indentable )
			{
				const rawDepth = child.depth;
				const depth =
					rawDepth === -1
					// Probably empty object without children, hence no "depth"
					// Rebuild depth as parent + 1 level ( 1 tab or 2 spaces )
					? indent + ( child.tabs ? 1 : 2 )
					: child.depthAs( docTabs );

				child.setIndent( depth - indent, docTabs );

				recurse( child, depth );
			}
		}
	};

	recurse( node, node.depth ?? 0 );
}

function makeJsonPrimitive( node: CstNodePrimitive ): JsonPrimitive
{
	return node.kind === 'string'
		? new JsonString( node.token.value, node.token.raw )
		: node.kind === 'number'
		? new JsonNumber( node.token.value, node.token.raw )
		: typeof node.token.value === 'boolean'
		? new JsonBoolean( node.token.value, node.token.raw )
		: new JsonNull( node.token.value, node.token.raw );
}

function makeJsonObject( node: CstNodeObject ): JsonObject
{
	const ret = new JsonObject( );

	const whitespaces: Array< Whitespace > = [ ];

	const { children, whitespaceAfterChildren } = node;

	children.forEach( prop =>
	{
		ret.add( prop.key, makeJsonAny( prop.valueNode ), false );
		if ( prop.whitespaceBefore )
		{
			whitespaces.push( getWhitespace( prop.whitespaceBefore ) );
		}
	} );

	const hasNewline = [
		...whitespaces,
		...(
			whitespaceAfterChildren
			? [ getWhitespace( whitespaceAfterChildren ) ]
			: [ ]
		),
	].some( whitespace => whitespace.hasNewline );

	ret.setIndent(
		decideIndentations(
			whitespaces.map( whitespace => whitespace.indentable )
		)
	);
	if ( hasNewline || ret.properties.length > 0 )
		// Set the flow, if there are elements (or it's strictly a new-line)
		ret.flow = !hasNewline;
	else
		ret.flow = undefined;
	ret.properties.forEach( ( { value } ) =>
	{
		value.sourceParentFlow = ret.flow;
	} );

	return ret;
}

function makeJsonArray( node: CstNodeArray ): JsonArray
{
	const ret = new JsonArray( );

	const whitespaces: Array< Whitespace > = [ ];

	const { children, whitespaceAfterChildren } = node;

	children.forEach( child =>
	{
		ret.add( makeJsonAny( child.valueNode ) );
		if ( child.whitespaceBefore )
		{
			whitespaces.push( getWhitespace( child.whitespaceBefore ) );
		}
	} );

	const hasNewline = [
		...whitespaces,
		...(
			whitespaceAfterChildren
			? [ getWhitespace( whitespaceAfterChildren ) ]
			: [ ]
		),
	].some( whitespace => whitespace.hasNewline );

	ret.setIndent(
		decideIndentations(
			whitespaces.map( whitespace => whitespace.indentable )
		)
	);
	if ( hasNewline || ret.elements.length > 0 )
		// Set the flow, if there are elements (or it's strictly a new-line)
		ret.flow = !hasNewline;
	else
		ret.flow = undefined;
	ret.elements.forEach( value =>
	{
		value.sourceParentFlow = ret.flow;
	} );

	return ret;
}

function makeJsonAny( node: CstValueNode ): JsonNodeType
{
	if ( isPrimitiveNode( node ) )
		return makeJsonPrimitive( node );
	else if ( node.kind === 'object' )
		return makeJsonObject( node );
	else if ( node.kind === 'array' )
		return makeJsonArray( node );

	throw new Error( 'Failed to parse JSON document' );
}
