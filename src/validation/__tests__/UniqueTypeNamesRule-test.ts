import { describe, it } from 'mocha';

import type { GraphQLSchema } from '../../type/schema';

import { buildSchema } from '../../utilities/buildASTSchema';

import { UniqueTypeNamesRule } from '../rules/UniqueTypeNamesRule';

import { expectSDLValidationErrors } from './harness';

function expectSDLErrors(sdlStr: string, schema?: GraphQLSchema) {
  return expectSDLValidationErrors(schema, UniqueTypeNamesRule, sdlStr);
}

function expectValidSDL(sdlStr: string, schema?: GraphQLSchema) {
  expectSDLErrors(sdlStr, schema).toDeepEqual([]);
}

describe('Validate: Unique type names', () => {
  it('no types', () => {
    expectValidSDL(`
      directive @test on SCHEMA
    `);
  });

  it('one type', () => {
    expectValidSDL(`
      type Foo
    `);
  });

  it('many types', () => {
    expectValidSDL(`
      type Foo
      type Bar
      type Baz
    `);
  });

  it('type and non-type definitions named the same', () => {
    expectValidSDL(`
      query Foo { __typename }
      fragment Foo on Query { __typename }
      directive @Foo on SCHEMA

      type Foo
    `);
  });

  it('types named the same', () => {
    expectSDLErrors(`
      resolver Foo
      scalar Foo
      data Foo
    `).toDeepEqual([
      {
        message: 'There can be only one type named "Foo".',
        locations: [
          { line: 2, column: 16 },
          { line: 3, column: 14 },
        ],
      },
      {
        message: 'There can be only one type named "Foo".',
        locations: [
          { line: 2, column: 16 },
          { line: 4, column: 12 },
        ],
      }
    ]);
  });

});
