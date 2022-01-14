import { describe, it } from 'mocha';

import type { GraphQLSchema } from '../../type/schema';

import { UniqueOperationTypesRule } from '../rules/UniqueOperationTypesRule';

import { expectSDLValidationErrors } from './harness';

function expectSDLErrors(sdlStr: string, schema?: GraphQLSchema) {
  return expectSDLValidationErrors(schema, UniqueOperationTypesRule, sdlStr);
}

function expectValidSDL(sdlStr: string, schema?: GraphQLSchema) {
  expectSDLErrors(sdlStr, schema).toDeepEqual([]);
}

describe('Validate: Unique operation types', () => {
  it('no schema definition', () => {
    expectValidSDL(`
      type Foo
    `);
  });

  it('schema definition with all types', () => {
    expectValidSDL(`
      type Foo

      schema {
        query: Foo
        mutation: Foo
        subscription: Foo
      }
    `);
  });

  it('duplicate operation types inside single schema definition', () => {
    expectSDLErrors(`
      type Foo

      schema {
        query: Foo
        mutation: Foo
        subscription: Foo

        query: Foo
        mutation: Foo
        subscription: Foo
      }
    `).toDeepEqual([
      {
        message: 'There can be only one query type in schema.',
        locations: [
          { line: 5, column: 9 },
          { line: 9, column: 9 },
        ],
      },
      {
        message: 'There can be only one mutation type in schema.',
        locations: [
          { line: 6, column: 9 },
          { line: 10, column: 9 },
        ],
      },
      {
        message: 'There can be only one subscription type in schema.',
        locations: [
          { line: 7, column: 9 },
          { line: 11, column: 9 },
        ],
      },
    ]);
  });



});
