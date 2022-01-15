import { describe, it } from 'mocha';

import type { GraphQLSchema } from '../../type/schema';

import { buildSchema } from '../../utilities/buildASTSchema';

import { KnownDirectivesRule } from '../rules/KnownDirectivesRule';

import {
  expectSDLValidationErrors,
  expectValidationErrorsWithSchema,
} from './harness';

function expectErrors(queryStr: string) {
  return expectValidationErrorsWithSchema(
    schemaWithDirectives,
    KnownDirectivesRule,
    queryStr,
  );
}

function expectValid(queryStr: string) {
  expectErrors(queryStr).toDeepEqual([]);
}

function expectSDLErrors(sdlStr: string, schema?: GraphQLSchema) {
  return expectSDLValidationErrors(schema, KnownDirectivesRule, sdlStr);
}

function expectValidSDL(sdlStr: string, schema?: GraphQLSchema) {
  expectSDLErrors(sdlStr, schema).toDeepEqual([]);
}

const schemaWithDirectives = buildSchema(`
  type Query {
    dummy: String
  }

  directive @onQuery on QUERY
  directive @onMutation on MUTATION
  directive @onSubscription on SUBSCRIPTION
  directive @onField on FIELD
  directive @onFragmentDefinition on FRAGMENT_DEFINITION
  directive @onFragmentSpread on FRAGMENT_SPREAD
  directive @onInlineFragment on INLINE_FRAGMENT
  directive @onVariableDefinition on VARIABLE_DEFINITION
`);

const schemaWithSDLDirectives = buildSchema(`
  directive @onSchema on SCHEMA
  directive @onScalar on SCALAR
  directive @onObject on OBJECT
  directive @onFieldDefinition on FIELD_DEFINITION
  directive @onArgumentDefinition on ARGUMENT_DEFINITION
  directive @onInterface on INTERFACE
  directive @onUnion on UNION
  directive @onEnum on ENUM
  directive @onEnumValue on ENUM_VALUE
  directive @onInputObject on INPUT_OBJECT
  directive @onInputFieldDefinition on INPUT_FIELD_DEFINITION
`);

describe('Validate: Known directives', () => {
  it('with no directives', () => {
    expectValid(`
      query Foo {
        name
        ...Frag
      }

      fragment Frag on Dog {
        name
      }
    `);
  });

  it('with standard directives', () => {
    expectValid(`
      {
        human @skip(if: false) {
          name
          pets {
            ... on Dog @include(if: true) {
              name
            }
          }
        }
      }
    `);
  });

  it('with unknown directive', () => {
    expectErrors(`
      {
        human @unknown(directive: "value") {
          name
        }
      }
    `).toDeepEqual([
      {
        message: 'Unknown directive "@unknown".',
        locations: [{ line: 3, column: 15 }],
      },
    ]);
  });

  it('with many unknown directives', () => {
    expectErrors(`
      {
        __typename @unknown
        human @unknown {
          name
          pets @unknown {
            name
          }
        }
      }
    `).toDeepEqual([
      {
        message: 'Unknown directive "@unknown".',
        locations: [{ line: 3, column: 20 }],
      },
      {
        message: 'Unknown directive "@unknown".',
        locations: [{ line: 4, column: 15 }],
      },
      {
        message: 'Unknown directive "@unknown".',
        locations: [{ line: 6, column: 16 }],
      },
    ]);
  });

  it('with well placed directives', () => {
    expectValid(`
      query ($var: Boolean @onVariableDefinition) @onQuery {
        human @onField {
          ...Frag @onFragmentSpread
          ... @onInlineFragment {
            name @onField
          }
        }
      }

      mutation @onMutation {
        someField @onField
      }

      subscription @onSubscription {
        someField @onField
      }

      fragment Frag on Human @onFragmentDefinition {
        name @onField
      }
    `);
  });

  it('with misplaced directives', () => {
    expectErrors(`
      query ($var: Boolean @onQuery) @onMutation {
        human @onQuery {
          ...Frag @onQuery
          ... @onQuery {
            name @onQuery
          }
        }
      }

      mutation @onQuery {
        someField @onQuery
      }

      subscription @onQuery {
        someField @onQuery
      }

      fragment Frag on Human @onQuery {
        name @onQuery
      }
    `).toDeepEqual([
      {
        message: 'Directive "@onQuery" may not be used on VARIABLE_DEFINITION.',
        locations: [{ line: 2, column: 28 }],
      },
      {
        message: 'Directive "@onMutation" may not be used on QUERY.',
        locations: [{ line: 2, column: 38 }],
      },
      {
        message: 'Directive "@onQuery" may not be used on FIELD.',
        locations: [{ line: 3, column: 15 }],
      },
      {
        message: 'Directive "@onQuery" may not be used on FRAGMENT_SPREAD.',
        locations: [{ line: 4, column: 19 }],
      },
      {
        message: 'Directive "@onQuery" may not be used on INLINE_FRAGMENT.',
        locations: [{ line: 5, column: 15 }],
      },
      {
        message: 'Directive "@onQuery" may not be used on FIELD.',
        locations: [{ line: 6, column: 18 }],
      },
      {
        message: 'Directive "@onQuery" may not be used on MUTATION.',
        locations: [{ line: 11, column: 16 }],
      },
      {
        message: 'Directive "@onQuery" may not be used on FIELD.',
        locations: [{ column: 19, line: 12 }],
      },
      {
        message: 'Directive "@onQuery" may not be used on SUBSCRIPTION.',
        locations: [{ column: 20, line: 15 }],
      },
      {
        message: 'Directive "@onQuery" may not be used on FIELD.',
        locations: [{ column: 19, line: 16 }],
      },
      {
        message: 'Directive "@onQuery" may not be used on FRAGMENT_DEFINITION.',
        locations: [{ column: 30, line: 19 }],
      },
      {
        message: 'Directive "@onQuery" may not be used on FIELD.',
        locations: [{ column: 14, line: 20 }],
      },
    ]);
  });

  describe('within SDL', () => {
    it('with directive defined inside SDL', () => {
      expectValidSDL(`
        type Query {
          foo: String @test
        }

        directive @test on FIELD_DEFINITION
      `);
    });

    it('with standard directive', () => {
      expectValidSDL(`
        type Query {
          foo: String @deprecated
        }
      `);
    });

    it('with overridden standard directive', () => {
      expectValidSDL(`
        schema @deprecated {
          query: Query
        }
        directive @deprecated on SCHEMA
      `);
    });


    // it('with well placed directives', () => {
    //   expectValidSDL(
    //     `
    //       type MyObj implements MyInterface @onObject {
    //         myField(myArg: Int @onArgumentDefinition): String @onFieldDefinition
    //       }

    //       scalar MyScalar @onScalar

    //       interface MyInterface @onInterface {
    //         myField(myArg: Int @onArgumentDefinition): String @onFieldDefinition
    //       }

    //       resolver MyUnion @onUnion = MyObj | Other

    //       data MyEnum @onEnum = MY_VALUE @onEnumValue

    //       data MyInput @onInputObject {
    //         myField: Int @onInputFieldDefinition
    //       }

    //       schema @onSchema {
    //         query: MyQuery
    //       }
    //     `,
    //     schemaWithSDLDirectives,
    //   );
    // });

    // it('with misplaced directives', () => {
    //   expectSDLErrors(
    //     `
    //       type MyObj implements MyInterface @onInterface {
    //         myField(myArg: Int @onInputFieldDefinition): String @onInputFieldDefinition
    //       }

    //       scalar MyScalar @onEnum

    //       interface MyInterface @onObject {
    //         myField(myArg: Int @onInputFieldDefinition): String @onInputFieldDefinition
    //       }

    //       resolver MyUnion @onEnumValue = MyObj | Other

    //       data MyEnum @onScalar = MY_VALUE @onUnion

    //       data MyInput @onEnum {
    //         myField: Int @onArgumentDefinition
    //       }

    //       schema @onObject {
    //         query: MyQuery
    //       }
    //     `,
    //     schemaWithSDLDirectives,
    //   ).toDeepEqual([
    //     {
    //       message: 'Directive "@onInterface" may not be used on OBJECT.',
    //       locations: [{ line: 2, column: 45 }],
    //     },
    //     {
    //       message:
    //         'Directive "@onInputFieldDefinition" may not be used on ARGUMENT_DEFINITION.',
    //       locations: [{ line: 3, column: 32 }],
    //     },
    //     {
    //       message:
    //         'Directive "@onInputFieldDefinition" may not be used on FIELD_DEFINITION.',
    //       locations: [{ line: 3, column: 65 }],
    //     },
    //     {
    //       message: 'Directive "@onEnum" may not be used on SCALAR.',
    //       locations: [{ line: 6, column: 27 }],
    //     },
    //     {
    //       message: 'Directive "@onObject" may not be used on INTERFACE.',
    //       locations: [{ line: 8, column: 33 }],
    //     },
    //     {
    //       message:
    //         'Directive "@onInputFieldDefinition" may not be used on ARGUMENT_DEFINITION.',
    //       locations: [{ line: 9, column: 32 }],
    //     },
    //     {
    //       message:
    //         'Directive "@onInputFieldDefinition" may not be used on FIELD_DEFINITION.',
    //       locations: [{ line: 9, column: 65 }],
    //     },
    //     {
    //       message: 'Directive "@onEnumValue" may not be used on UNION.',
    //       locations: [{ line: 12, column: 28 }],
    //     },
    //     {
    //       message: 'Directive "@onScalar" may not be used on DATA.',
    //       locations: [{ line: 14, column: 23 }],
    //     },
    //     {
    //       message: 'Directive "@onUnion" may not be used on ENUM_VALUE.',
    //       locations: [{ line: 15, column: 22 }],
    //     },
    //     {
    //       message: 'Directive "@onEnum" may not be used on DATA.',
    //       locations: [{ line: 18, column: 24 }],
    //     },
    //     {
    //       message:
    //         'Directive "@onArgumentDefinition" may not be used on INPUT_FIELD_DEFINITION.',
    //       locations: [{ line: 19, column: 26 }],
    //     },
    //     {
    //       message: 'Directive "@onObject" may not be used on SCHEMA.',
    //       locations: [{ line: 22, column: 18 }],
    //     }
    //   ]);
    // });
  });
});
