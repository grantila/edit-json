interface OperationBase
{
	/**
	 * An extended RFC6901 path which is either a JSON Pointer, or an array of
	 * unencoded path segments.
	 */
	path: string | string[ ];
}

export interface AddOperation extends OperationBase
{
	op: 'add';
	value: any;
}

export interface RemoveOperation extends OperationBase
{
	op: 'remove';
}

export interface ReplaceOperation extends OperationBase
{
	op: 'replace';
	value: any;
}

export interface MoveOperation extends OperationBase
{
	op: 'move';
	from: string;
}

export interface CopyOperation extends OperationBase
{
	op: 'copy';
	from: string;
}

export interface TestOperation extends OperationBase
{
	op: 'test';
	value: any;
}

export type Operation =
	| AddOperation
	| RemoveOperation
	| ReplaceOperation
	| MoveOperation
	| CopyOperation
	| TestOperation;
