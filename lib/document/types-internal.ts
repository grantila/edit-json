export interface JsonValueBase
{
	sourceParentFlow: boolean | undefined;

	toJS( ): unknown;
}
