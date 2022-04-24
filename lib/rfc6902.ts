import { encodeJsonPointerPath } from 'jsonpos'
import deepEqual from 'fast-deep-equal'

import { type JsonDocument, parseJson } from './document/document.js'
import {
	JsonArray,
	JsonObject,
	getNodeTypeName,
	nodeFromJS,
} from './document/nodes.js'
import { type JsonDocumentOptions } from './document/types.js'
import { getDocumentOptions } from './document/utils.js'
import { type Operation } from './types-rfc6902.js'
import { ensureRFC6902ArrayIndex, getJsonPath } from './utils.js'


export function jsonPatch(
	json: string,
	operations: ReadonlyArray< Operation >,
	options?: Partial< JsonDocumentOptions >
): string;

export function jsonPatch(
	doc: JsonDocument,
	operations: ReadonlyArray< Operation >,
	options?: Partial< JsonDocumentOptions >
): JsonDocument;

export function jsonPatch(
	jsonOrDoc: string | JsonDocument,
	operations: ReadonlyArray< Operation >,
	_options?: Partial< JsonDocumentOptions >
)
: string | JsonDocument
{
	const options = getDocumentOptions( _options );
	const { ordered } = options;

	const doc =
		typeof jsonOrDoc === 'string'
		? parseJson( jsonOrDoc, options )
		: jsonOrDoc;

	operations.forEach( operation =>
	{
		const path = getJsonPath( operation.path );

		if ( operation.op === 'add' || operation.op === 'replace' )
		{
			const child = path.pop( );

			const parent = doc.getAt( path );

			const { op } = operation;

			if ( child === undefined )
				throw new Error(
					`Can't ${op} value to "${child}" at ` +
					`${encodeJsonPointerPath( path )} `
				);

			if ( !parent )
				throw new Error(
					`Can't ${op} value at ${encodeJsonPointerPath( path )} ` +
					`which doesn't exist.`
				);

			const node = nodeFromJS( operation.value );
			if ( node === undefined )
				return;

			if (
				!( parent instanceof JsonObject )
				&&
				!( parent instanceof JsonArray )
			)
				throw new Error(
					`Can't ${op} value at ${encodeJsonPointerPath( path )} ` +
					`of type ${getNodeTypeName( parent )}`
				);

			if ( parent instanceof JsonObject )
			{
				const cur = parent.properties.find( ( { name } ) =>
					name === `${child}`
				);

				if ( op === 'replace' && !cur )
					throw new Error(
						`Can't ${op} value at ` +
						`${encodeJsonPointerPath( [ ...path, child ] )} ` +
						`since no previous value exist`
					);

				parent.add( `${child}`, node, ordered );
			}
			else
			{
				const index = ensureRFC6902ArrayIndex( child );

				if (
					op === 'replace'
					&&
					( index === -1 || index >= parent.elements.length )
				)
					throw new Error(
						`Can't ${op} value at ` +
						`${encodeJsonPointerPath( [ ...path, child ] )},` +
						` either invalid index, or no previous value exist`
					);

				if ( op === 'replace' )
					// Remove last
					parent.removeAt( index );

				if ( index === -1 )
					parent.add( node );
				else
					parent.insert( node, index );
			}
		}
		else if ( operation.op === 'copy' || operation.op === 'move' )
		{
			const fromPath = getJsonPath( operation.from );
			const fromChild = fromPath.pop( );
			const toChild = path.pop( );

			const fromParent = doc.getAt( fromPath );
			const toParent = doc.getAt( path );

			const { op } = operation;

			if ( fromChild === undefined )
				throw new Error(
					`Can't ${op} value from "${fromChild}" at ` +
					`${encodeJsonPointerPath( fromPath )} `
				);

			if ( toChild === undefined )
				throw new Error(
					`Can't ${op} value to "${toChild}" at ` +
					`${encodeJsonPointerPath( path )} `
				);

			if ( !fromParent )
				throw new Error(
					`Can't ${op} value from ${encodeJsonPointerPath( fromPath )}` +
					` which doesn't exist.`
				);

			if ( !toParent )
				throw new Error(
					`Can't ${op} value to ${encodeJsonPointerPath( path )}` +
					` which doesn't exist.`
				);

			if (
				!( fromParent instanceof JsonObject )
				&&
				!( fromParent instanceof JsonArray )
			)
				throw new Error(
					`Can't ${op} value from ${encodeJsonPointerPath( path )}` +
					` of type ${getNodeTypeName( fromParent )}`
				);

			if (
				!( toParent instanceof JsonObject )
				&&
				!( toParent instanceof JsonArray )
			)
				throw new Error(
					`Can't ${op} value to ${encodeJsonPointerPath( path )}` +
					` of type ${getNodeTypeName( toParent )}`
				);

			const node =
				fromParent instanceof JsonArray
				? op === 'move'
				? fromParent.removeAt( ensureRFC6902ArrayIndex( fromChild ) )
				: fromParent.get( ensureRFC6902ArrayIndex( fromChild ) )
				: op === 'move'
				? fromParent.remove( `${fromChild}` )
				: fromParent.get( `${fromChild}` );

			if ( node === undefined )
				throw new Error(
					`Can't ${op} from ` +
					encodeJsonPointerPath( [ ...fromPath, fromChild ] ) +
					`: no value found`
				);

			if ( toParent instanceof JsonObject )
			{
				toParent.add( `${toChild}`, node, ordered );
			}
			else
			{
				const index = ensureRFC6902ArrayIndex( toChild );
				if ( index === -1 )
					toParent.add( node );
				else
					toParent.insert( node, index );
			}
		}
		else if ( operation.op === 'remove' )
		{
			const child = path.pop( );

			const parent = doc.getAt( path );

			if ( child === undefined )
				throw new Error(
					`Can't remove value "${child}" at ` +
					`${encodeJsonPointerPath( path )}, doesn't exist`
				);

			if ( !parent )
				throw new Error(
					`Can't remove value at ${encodeJsonPointerPath( path )} ` +
					`which doesn't exist.`
				);

			if (
				!( parent instanceof JsonObject )
				&&
				!( parent instanceof JsonArray )
			)
				throw new Error(
					`Can't remove value at ${encodeJsonPointerPath( path )} ` +
					`of type ${getNodeTypeName( parent )}`
				);

			if ( parent instanceof JsonObject )
			{
				parent.remove( `${child}` );
			}
			else
			{
				const index = ensureRFC6902ArrayIndex( child );
				parent.removeAt( index );
			}
		}
		else if ( operation.op === 'test' )
		{
			const child = path.pop( );

			const parent = doc.getAt( path );

			if ( child === undefined )
				throw new Error(
					`Can't test value "${child}" at ` +
					`${encodeJsonPointerPath( path )}, doesn't exist`
				);

			if ( !parent )
				throw new Error(
					`Can't test value at ${encodeJsonPointerPath( path )} ` +
					`which doesn't exist.`
				);

			if (
				!( parent instanceof JsonObject )
				&&
				!( parent instanceof JsonArray )
			)
				throw new Error(
					`Can't test value at ${encodeJsonPointerPath( path )} ` +
					`of type ${getNodeTypeName( parent )}`
				);

			const node =
				parent instanceof JsonArray
				? parent.get( ensureRFC6902ArrayIndex( child ) )
				: parent.get( `${child}` );

			if ( node === undefined )
				throw new Error(
					`Can't test value at ` +
					encodeJsonPointerPath( [ ...path, child ] ) +
					`: no value found`
				);

			if ( !deepEqual( node.toJS( ), operation.value ) )
				throw new Error( `test operation failed, values mismatch` );
		}
	} );

	return typeof jsonOrDoc === 'string' ? `${doc}` : doc;
}
