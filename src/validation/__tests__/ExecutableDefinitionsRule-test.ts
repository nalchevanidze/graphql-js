import { describe, it } from 'mocha';

import { ExecutableDefinitionsRule } from '../rules/ExecutableDefinitionsRule';

import { expectValidationErrors } from './harness';

function expectErrors(queryStr: string) {
  return expectValidationErrors(ExecutableDefinitionsRule, queryStr);
}

function expectValid(queryStr: string) {
  expectErrors(queryStr).toDeepEqual([]);
}

describe('Validate: Executable definitions', () => {
  it('with only operation', () => {
    expectValid(`
      query Foo {
        dog {
          name
        }
      }
    `);
  });

  it('with operation and fragment', () => {
    expectValid(`
      query Foo {
        dog {
          name
          ...Frag
        }
      }

      fragment Frag on Dog {
        name
      }
    `);
  });

  it('with type definition', () => {
    expectErrors(`
      query Foo {
        dog {
          name
        }
      }

      type Cow {
        name: String
      }

      type Dog {
        color: String
      }
    `).toDeepEqual([
      {
        message: 'The "Cow" definition is not executable.',
        locations: [{ line: 8, column: 7 }],
      },
      {
        message: 'The "Dog" definition is not executable.',
        locations: [{ line: 12, column: 7 }],
      },
    ]);
  });
});
