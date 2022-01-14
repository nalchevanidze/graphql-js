import { describe, it } from 'mocha';

import type { GraphQLSchema } from '../../type/schema';

import { UniqueEnumValueNamesRule } from '../rules/UniqueEnumValueNamesRule';

import { expectSDLValidationErrors } from './harness';

function expectSDLErrors(sdlStr: string, schema?: GraphQLSchema) {
  return expectSDLValidationErrors(schema, UniqueEnumValueNamesRule, sdlStr);
}

function expectValidSDL(sdlStr: string, schema?: GraphQLSchema) {
  expectSDLErrors(sdlStr, schema).toDeepEqual([]);
}

describe('Validate: Unique enum value names', () => {
  it('no values', () => {
    expectValidSDL(`
      enum SomeEnum
    `);
  });

  it('one value', () => {
    expectValidSDL(`
      enum SomeEnum {
        FOO
      }
    `);
  });

  it('multiple values', () => {
    expectValidSDL(`
      enum SomeEnum {
        FOO
        BAR
      }
    `);
  });

  it('duplicate values inside the same enum definition', () => {
    expectSDLErrors(`
      enum SomeEnum {
        FOO
        BAR
        FOO
      }
    `).toDeepEqual([
      {
        message: 'Enum value "SomeEnum.FOO" can only be defined once.',
        locations: [
          { line: 3, column: 9 },
          { line: 5, column: 9 },
        ],
      },
    ]);
  });
});
