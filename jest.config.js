export default {
  // The test environment
  testEnvironment: 'node',

  // Directories where Jest should look for tests
  roots: ['<rootDir>/tests'],

  // File extensions that Jest will look for
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],

  // Transform files with babel-jest
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },

  // Ignore node_modules when running tests
  transformIgnorePatterns: ['/node_modules/'],

  // Setup files before running the test suites
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!<rootDir>/node_modules/'],
};
