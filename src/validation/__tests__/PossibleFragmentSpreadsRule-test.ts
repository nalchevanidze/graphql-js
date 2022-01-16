import { describe, it } from 'mocha';

import { buildSchema } from '../../utilities/buildASTSchema';

import { PossibleFragmentSpreadsRule } from '../rules/PossibleFragmentSpreadsRule';

import { expectValidationErrorsWithSchema } from './harness';

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
  interface Being {
    name: String
  }

  interface Pet implements Being {
    name: String
  }

  type Dog implements Being & Pet {
    name: String
    barkVolume: Int
  }

  type Cat implements Being & Pet {
    name: String
    meowVolume: Int
  }

  resolver CatOrDog = Cat | Dog

  interface Intelligent {
    iq: Int
  }

  type Human implements Being & Intelligent {
    name: String
    pets: [Pet]
    iq: Int
  }

  type Alien implements Being & Intelligent {
    name: String
    iq: Int
  }

  resolver DogOrHuman = Dog | Human

  resolver HumanOrAlien = Human | Alien

  type Query {
    catOrDog: CatOrDog
    dogOrHuman: DogOrHuman
    humanOrAlien: HumanOrAlien
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



  it('ignores incorrect type (caught by FragmentsOnCompositeTypesRule)', () => {
    expectValid(`
      fragment petFragment on Pet { ...badInADifferentWay }
      fragment badInADifferentWay on String { name }
    `);
  });

  it('ignores unknown fragments (caught by KnownFragmentNamesRule)', () => {
    expectValid(`
      fragment petFragment on Pet { ...UnknownFragment }
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


  it('object into not containing union', () => {
    expectErrors(`
      fragment invalidObjectWithinUnion on CatOrDog { ...humanFragment }
      fragment humanFragment on Human { pets { name } }
    `).toDeepEqual([
      {
        message:
          'Fragment "humanFragment" cannot be spread here as objects of type "CatOrDog" can never be of type "Human".',
        locations: [{ line: 2, column: 55 }],
      },
    ]);
  });

  it('union into not contained object', () => {
    expectErrors(`
      fragment invalidUnionWithinObject on Human { ...catOrDogFragment }
      fragment catOrDogFragment on CatOrDog { __typename }
    `).toDeepEqual([
      {
        message:
          'Fragment "catOrDogFragment" cannot be spread here as objects of type "Human" can never be of type "CatOrDog".',
        locations: [{ line: 2, column: 52 }],
      },
    ]);
  });

  it('union into non overlapping union', () => {
    expectErrors(`
      fragment invalidUnionWithinUnion on CatOrDog { ...humanOrAlienFragment }
      fragment humanOrAlienFragment on HumanOrAlien { __typename }
    `).toDeepEqual([
      {
        message:
          'Fragment "humanOrAlienFragment" cannot be spread here as objects of type "CatOrDog" can never be of type "HumanOrAlien".',
        locations: [{ line: 2, column: 54 }],
      },
    ]);
  });

});
