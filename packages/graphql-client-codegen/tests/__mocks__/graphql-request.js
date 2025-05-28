module.exports = {
  GraphQLClient: jest.fn().mockImplementation(() => ({
    request: jest.fn(),
    requestConfig: {
      headers: {},
      fetch: undefined,
      url: 'http://localhost:8000/graphql'
    }
  }))
};