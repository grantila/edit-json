type ExtendedPath = string | string[ ];

interface OperationBase
{
	/**
	 * An extended RFC6901 path which is either a JSON Pointer, or an array of
	 * unencoded path segments.
	 */
	path: ExtendedPath;
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
	/**
	 * An extended RFC6901 path which is either a JSON Pointer, or an array of
	 * unencoded path segments.
	 */
	from: ExtendedPath;
}

export interface CopyOperation extends OperationBase
{
	op: 'copy';
	/**
	 * An extended RFC6901 path which is either a JSON Pointer, or an array of
	 * unencoded path segments.
	 */
	from: ExtendedPath;
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
