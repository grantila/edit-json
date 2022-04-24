import { parseJsonPointerPath, LocationPath } from 'jsonpos'

export function getJsonPath( path: string | LocationPath ): LocationPath
{
	return Array.isArray( path ) ? path : parseJsonPointerPath( path );
}

export function ensureNumericIndex( val: string | number ): number
{
	if ( typeof val === 'number' )
		return val;

	const num = parseInt( val );

	if ( val !== `${num}` )
		throw new Error( `Not numeric: "${val}"` );

	return num;
}

export function ensureRFC6902ArrayIndex( val: string | number ): number
{
	if ( typeof val === 'number' )
		return val;
	else if ( val === '-' )
		return -1;
	const num = parseInt( val );
	if ( `${num}` !== val )
		throw new Error( `Invalid numeric index: "${val}"` );
	return num;
}
