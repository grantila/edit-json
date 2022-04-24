export class Indentable
{
	constructor( private _depth = -1, private _tabs?: boolean | undefined )
	{
	}

	/**
	 * The indentation depth of this collection.
	 *
	 * Could be zero, and -1 if no depth detected (e.g. empty object/array or
	 * flow collection).
	 */
	get depth( )
	{
		return this._depth;
	}

	/**
	 * Whether tabs or spaces are used.
	 *
	 * True means tabs, false means spaces, and undefined means unknown.
	 */
	get tabs( )
	{
		return this._tabs;
	}

	get char( )
	{
		return this.tabs ? '\t' : ' ';
	}

	setIndent( depth: number, tabs: boolean ): void;
	setIndent( from: Indentable ): void;

	setIndent( depth: number | Indentable, tabs?: boolean )
	{
		if ( typeof depth === 'number' )
		{
			this._depth = depth;
			this._tabs = tabs!;
		}
		else
		{
			this._depth = depth.depth;
			this._tabs = depth.tabs;
		}
	}

	/**
	 * Gets the indentation string given the indentable settings.
	 *
	 * If `tabs` is set to true or false, this will overwrite the settings in
	 * this indentable, and change tabs into spaces or vice versa.
	 */
	indentString( tabs?: boolean )
	{
		if ( this.depth <= 0 )
			return '';

		const char = tabs === true ? '\t' : tabs === false ? ' ' : this.char;
		const depth =
			( tabs === undefined || !!tabs === this.tabs )
			? this.depth
			: tabs === true ? this.depth / 2 : this.depth * 2;

		return char.repeat( depth );
	}
}

/**
 * Takes a set of Indentables and figures out the most common one
 */
export function decideIndentations( indentations: Indentable[ ] ): Indentable
{
	// TODO: Implement
	return indentations[ 0 ] ?? new Indentable( );
}
