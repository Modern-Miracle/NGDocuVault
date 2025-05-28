import { loadTypeDefs } from '../src';
import { DocumentNode, print } from 'graphql';
import * as fs from 'fs';
import * as path from 'path';

describe('GraphQL Schema', () => {
  let typeDefs: DocumentNode;

  beforeAll(() => {
    typeDefs = loadTypeDefs();
  });

  it('should load and parse schema without errors', () => {
    expect(typeDefs).toBeDefined();
    expect(typeDefs.kind).toBe('Document');
  });

  it('should contain expected type definitions', () => {
    const schemaString = print(typeDefs);
    
    // Check for main types
    expect(schemaString).toContain('type Document');
    expect(schemaString).toContain('type Holder');
    expect(schemaString).toContain('type Issuer');
    expect(schemaString).toContain('type ShareRequest');
    expect(schemaString).toContain('type VerificationRequest');
    expect(schemaString).toContain('type DID');
    
    // Check for enums
    expect(schemaString).toContain('enum DocumentType');
    expect(schemaString).toContain('enum ConsentStatus');
  });

  it('should contain Query and Mutation types', () => {
    const schemaString = print(typeDefs);
    
    // Query type
    expect(schemaString).toContain('type Query');
    expect(schemaString).toContain('document(id: ID!): Document');
    expect(schemaString).toContain('issuer(id: ID!): Issuer');
    
    // Mutation type
    expect(schemaString).toContain('type Mutation');
    expect(schemaString).toContain('ping: String');
  });

  it('should contain custom scalars', () => {
    const schemaString = print(typeDefs);
    
    expect(schemaString).toContain('scalar DateTime');
    expect(schemaString).toContain('scalar BigInt');
    expect(schemaString).toContain('scalar Bytes');
  });

  it('should contain subgraph directives', () => {
    const schemaString = print(typeDefs);
    
    expect(schemaString).toContain('@entity');
    expect(schemaString).toContain('@derivedFrom');
  });

  it('should have all required schema files', () => {
    const graphqlDir = path.join(__dirname, '../graphql');
    
    const requiredFiles = [
      'schema.graphql',
      'custom-scalars.graphql',
      'root-types.graphql',
      'schema-extensions.graphql'
    ];
    
    requiredFiles.forEach(file => {
      const filePath = path.join(graphqlDir, file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  it('should define verification types', () => {
    const schemaString = print(typeDefs);
    
    expect(schemaString).toContain('type AgeVerification');
    expect(schemaString).toContain('type FhirVerification');
    expect(schemaString).toContain('type HashVerification');
    expect(schemaString).toContain('interface Verification');
  });

  it('should define extended types', () => {
    const schemaString = print(typeDefs);
    
    expect(schemaString).toContain('extend type Issuer');
    expect(schemaString).toContain('extend type Holder');
    expect(schemaString).toContain('extend type Query');
  });
});