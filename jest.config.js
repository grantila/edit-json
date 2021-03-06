export default {
	resolver: 'ts-jest-resolver',
	testEnvironment: 'node',
	testMatch: [
		'<rootDir>/lib/**/*.test.ts',
	],
	modulePathIgnorePatterns: [],
	collectCoverageFrom: ['<rootDir>/lib/**/*.ts', 'index.ts'],
	coveragePathIgnorePatterns: [ '/node_modules/' ],
	coverageReporters: ['lcov', 'text', 'html'],
	collectCoverage: true,
	extensionsToTreatAsEsm: ['.ts'],
}
