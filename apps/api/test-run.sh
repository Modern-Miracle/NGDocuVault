#!/bin/bash

# Set environment variables for testing
export NODE_ENV=test

# Run tests with TypeScript compilation check disabled for tests
npx jest --no-cache --detectOpenHandles

# Exit with Jest's exit code
exit $? 
