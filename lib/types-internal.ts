export type LexerTokenType =
	| 'whitespace'
	| 'punctuator'
	| 'string'
	| 'number'
	| 'literal';

export type NonPrimitiveLexerTokenType =
	Exclude< LexerTokenType, 'string' | 'number' >;

export type PunctuationOpen = '{' | '[';
export type PunctuationClose = '}' | ']';
export type PunctuationColon = ':';
export type PunctuationNext = ',';
export type Punctuation =
	| PunctuationOpen
	| PunctuationClose
	| PunctuationColon
	| PunctuationNext;

export type WhitespaceToken =
	{ type: 'whitespace', value: string, raw: string };
export type PunctuatorToken =
	{ type: 'punctuator', value: Punctuation, raw: string };
export type StringToken =
	{ type: 'string', value: string, raw: string };
export type NumberToken =
	{ type: 'number', value: number, raw: string };
export type LiteralToken =
	{ type: 'literal', value: boolean | null, raw: string };

export type AnyPrimitiveToken = StringToken | NumberToken | LiteralToken;

export type LexerToken =
| WhitespaceToken
| PunctuatorToken
| StringToken
| NumberToken
| LiteralToken;

export type NonWhitespaceToken = Exclude< LexerToken, WhitespaceToken >;

export type LexerTokens = Array< LexerToken >;
