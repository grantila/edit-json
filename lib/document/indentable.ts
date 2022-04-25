import { JsonValueBase } from './types-internal.js'


interface IndentStringOptions
{
	tabs?: boolean;
	fallback?: boolean;
}

export class Indentable
{
	private _flow: boolean | undefined = false;

	constructor( private _depth = -1, private _tabs?: boolean | undefined )
	{
	}

	public getChildrenNodes( )
	: ReadonlyArray< JsonValueBase & ( Indentable | { } ) >
	{
		return [ ];
	}

	/**
	 * Flow means a one-line object/array.
	 *
	 * Defaults to undefined, and is only set if set by
	 */
	get flow( )
	{
		return this._flow;
	}

	set flow( flow: boolean | undefined )
	{
		this._flow = flow;
	}

	/**
	 * Returns the flow, or if undefined, false if _any_ child node is false
	 * (i.e. comes from a source with a non-flow container). Fallbacks to true.
	 */
	get calculatedFlow( )
	{
		const recurseChildrenFlow = () =>
		{
			const recurse = ( node: Indentable ): false | undefined =>
			{
				const children = node.getChildrenNodes( );

				for ( const child of children )
				{
					if ( child.sourceParentFlow === false )
						return false;
				}

				for ( const child of children )
				{
					if ( child instanceof Indentable )
						return recurse( child );
				}

				return undefined;
			}

			return recurse( this );
		};

		return recurseChildrenFlow( ) ?? this.flow ?? true;
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
	 * Get the depth, and if not set, fallback to default depth if chosen
	 */
	getDepth( fallback = true )
	{
		return ( this.depth === -1 && fallback )
			? this.tabs
				? 1
				: 2
			: this.depth;
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

	setIndent( depth: number, tabs?: boolean ): void;
	setIndent( from: Indentable ): void;

	setIndent( depth: number | Indentable, tabs?: boolean )
	{
		if ( typeof depth === 'number' )
		{
			this._depth = depth;
			this._tabs = tabs ?? this.tabs;
		}
		else
		{
			this._depth = depth.depth;
			this._tabs = depth.tabs;
		}
	}

	/**
	 * Return the depth as if it was tabs or spaces
	 */
	depthAs( asTabs: boolean ): number
	{
		const tabs = this.tabs ?? false;

		return asTabs === tabs
			? this.depth
			: asTabs
			? this.depth / 2
			: this.depth * 2;
	}

	/**
	 * Gets the indentation string given the indentable settings.
	 *
	 * If `tabs` is set to true or false, this will overwrite the settings in
	 * this indentable, and change tabs into spaces or vice versa.
	 */
	indentString( options?: IndentStringOptions )
	{
		const { tabs, fallback = true } = options ?? { };
		const curDepth = Math.max( 0, this.getDepth( fallback ) );

		const char = tabs === true ? '\t' : tabs === false ? ' ' : this.char;
		const depth =
			( tabs === undefined || !tabs === !this.tabs )
			? curDepth
			: tabs === true ? curDepth / 2 : curDepth * 2;

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
