import type { JsonDocumentOptions } from './types.js'


export function getDocumentOptions( options?: Partial< JsonDocumentOptions > )
: JsonDocumentOptions
{
	return {
		ordered: true,
		whitespace: 'auto',
		...options,
	};
}
