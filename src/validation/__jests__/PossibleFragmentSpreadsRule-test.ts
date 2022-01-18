import { describe, it } from 'mocha';

import { buildSchema } from '../../utilities/buildASTSchema';

import { PossibleFragmentSpreadsRule } from '../rules/PossibleFragmentSpreadsRule';

import { expectValidationErrorsWithSchema } from '../__tests__/harness';

function expectErrors(queryStr: string) {
  return expectValidationErrorsWithSchema(
    testSchema,
    PossibleFragmentSpreadsRule,
    queryStr,
  );
}

function expectValid(queryStr: string) {
  expectErrors(queryStr).toDeepEqual([]);
}

const testSchema = buildSchema(`
  type Dog {
    name: String
    barkVolume: Int
  }

  type Cat {
    name: String
    meowVolume: Int
  }

  resolver CatOrDog = Cat | Dog

  type Query {
    catOrDog: CatOrDog
  }
`);

describe('Validate: Possible fragment spreads', () => {
  it('of the same object', () => {
    expectValid(`
      fragment objectWithinObject on Dog { ...dogFragment }
      fragment dogFragment on Dog { barkVolume }
    `);
  });

  it('of the same object with inline fragment', () => {
    expectValid(`
      fragment objectWithinObjectAnon on Dog { ... on Dog { barkVolume } }
    `);
  });


  it('object into containing union', () => {
    expectValid(`
      fragment objectWithinUnion on CatOrDog { ...dogFragment }
      fragment dogFragment on Dog { barkVolume }
    `);
  });

  it('union into contained object', () => {
    expectValid(`
      fragment unionWithinObject on Dog { ...catOrDogFragment }
      fragment catOrDogFragment on CatOrDog { __typename }
    `);
  });

  it('union into overlapping union', () => {
    expectValid(`
      fragment unionWithinUnion on DogOrHuman { ...catOrDogFragment }
      fragment catOrDogFragment on CatOrDog { __typename }
    `);
  });

  it('different object into object', () => {
    expectErrors(`
      fragment invalidObjectWithinObject on Cat { ...dogFragment }
      fragment dogFragment on Dog { barkVolume }
    `).toDeepEqual([
      {
        message:
          'Fragment "dogFragment" cannot be spread here as objects of type "Cat" can never be of type "Dog".',
        locations: [{ line: 2, column: 51 }],
      },
    ]);
  });

  it('different object into object in inline fragment', () => {
    expectErrors(`
      fragment invalidObjectWithinObjectAnon on Cat {
        ... on Dog { barkVolume }
      }
    `).toDeepEqual([
      {
        message:
          'Fragment cannot be spread here as objects of type "Cat" can never be of type "Dog".',
        locations: [{ line: 3, column: 9 }],
      },
    ]);
  });

});
