# ManyTwitch Tests

This directory contains the test suite for ManyTwitch.

## Running Tests

To run all tests:

```bash
npm test
```

## Test Structure

### `streamManagerModal.test.js`

Tests for the Stream Manager Modal functionality, specifically:

- **Enter key submission**: Verifies that pressing Enter in the new stream input field properly submits the stream name
- **Button state management**: Ensures the add button is enabled/disabled based on input value
- **Form validation**: Prevents submission when input is empty
- **Autocomplete functionality**: Tests that autocomplete triggers on input events

## Test Framework

- **Mocha**: Test runner
- **Chai**: Assertion library
- **jsdom**: DOM simulation for testing browser-based JavaScript

## Writing New Tests

When adding new tests:

1. Create a new `.test.js` file in this directory
2. Use the existing test structure as a template
3. Mock any external dependencies (like `MT` namespace, `Handlebars`, etc.)
4. Ensure tests are isolated and don't depend on external state

## Coverage

Current test coverage focuses on:
- User input handling
- Keyboard event handling
- Button state management
- Form submission prevention

## Notes

- Tests use jsdom to simulate a browser environment
- Some warnings about missing elements in the DOM are expected and can be ignored
- The EJS template is parsed and converted to HTML for testing
