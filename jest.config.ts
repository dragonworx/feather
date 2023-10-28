module.exports = {
	roots: ['./tests'],
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	transform: {
		'^.+\\.svelte$': 'svelte-jester',
		'^.+\\.ts$': 'ts-jest'
	},
	moduleFileExtensions: ['js', 'ts', 'svelte'],
	testMatch: ['**/*.test.ts', '**/*.tests.ts']
};
