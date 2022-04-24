export interface JsonDocumentOptions
{
	/**
	 * Whitespace strategy
	 *
	 *  - 'auto': Try to maintain the whitespace strategy from the source
	 *  - 'tabs': Force tabs
	 *  - [number]: Force [number] spaces
	 *
	 * @default 'auto'
	 */
	whitespace: 'auto' | 'tabs' | number;

	/**
	 * Try to insert new properties in order
	 */
	ordered: boolean;
}
