// Re-export everything from the generated types
export * from './generated/graphql';

// Export context and model types
export * from './types';

// Export resolvers
export * from './resolvers';

// Export schema
import * as fs from 'fs';
import * as path from 'path';
import { DocumentNode, parse } from 'graphql';

/**
 * Load and parse the full GraphQL schema
 */
export function loadTypeDefs(): DocumentNode {
  // Paths relative to package root
  const schemaPath = path.join(__dirname, '../graphql/schema.graphql');
  const scalarsPath = path.join(__dirname, '../graphql/custom-scalars.graphql');
  const rootTypesPath = path.join(__dirname, '../graphql/root-types.graphql');
  const extensionsPath = path.join(__dirname, '../graphql/schema-extensions.graphql');

  // Read all schema files
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const scalars = fs.readFileSync(scalarsPath, 'utf8');
  const rootTypes = fs.readFileSync(rootTypesPath, 'utf8');
  const extensions = fs.readFileSync(extensionsPath, 'utf8');

  // Combine all schema parts
  const combinedSchema = `
    ${scalars}
    ${schema}
    ${rootTypes}
    ${extensions}
  `;

  return parse(combinedSchema);
}
