import { dedent } from '../../__testUtils__/dedent';
import {
  expectJSON,
  expectToThrowJSON,
  toJSONDeep,
} from '../../__testUtils__/expectJSON';

import { parse } from '../parser';

function expectSyntaxError(text: string) {
  return expectToThrowJSON(() => parse(text));
}

const JSONSnapshot = (doc: unknown) => expect(toJSONDeep(doc)).toMatchSnapshot();

describe('Schema Parser', () => {
  it('Simple resolver', () => {
    const doc = parse(dedent`
      resolver Hello = {
        world: String
      }
    `);
    JSONSnapshot(doc);
  });

  it('parses resolver with description string', () => {
    const doc = parse(dedent`
      "Description"
      resolver Hello = {
        world: String
      }
    `);
    JSONSnapshot(doc)
  });

  it('parses resolver with description multi-line string', () => {
    const doc = parse(dedent`
      """
      Description
      """
      # Even with comments between them
      resolver Hello = {
        world: String
      }
    `);

    JSONSnapshot(doc)
  });

  it('Description followed by something other than resolver system definition throws', () => {
    expectSyntaxError('"Description" 1').to.deep.equal({
      locations: [{ column: 15, line: 1 }],
      message: 'Syntax Error: Unexpected Int "1".',
    });
  });

  it('Simple non-null resolver', () => {
    const doc = parse(dedent`
      resolver Hello = {
        world: String!
      }
    `);

    JSONSnapshot(doc)
  });

  it('Single value Enum', () => {
    const doc = parse('data Hello = WORLD');

    JSONSnapshot(doc)
  });

  it('Double value Enum', () => {
    const doc = parse('data Hello = WO | RLD');

    JSONSnapshot(doc);
  });

  it('Simple field with arg', () => {
    const doc = parse(dedent`
      resolver Hello = {
        world(flag: Boolean): String
      }
    `);

    JSONSnapshot(doc)
  });

  it('Simple field with arg with default value', () => {
    const doc = parse(dedent`
      resolver Hello = {
        world(flag: Boolean = true): String
      }
    `);

    JSONSnapshot(doc);
  });

  it('Simple field with list arg', () => {
    const doc = parse(dedent`
      resolver Hello = {
        world(things: [String]): String
      }
    `);

    JSONSnapshot(doc);
  });

  it('Simple field with two args', () => {
    const doc = parse(dedent`
      resolver Hello = {
        world(argOne: Boolean, argTwo: Int): String
      }
    `);
    JSONSnapshot(doc);
  });

  it('Simple resolver', () => {
    const doc = parse('resolver Hello = World');
    JSONSnapshot(doc);
  });

  it('Union with two resolvers', () => {
    const doc = parse('resolver Hello = Wo | Rld');
    JSONSnapshot(doc);
  });

  it('Union fails with no resolvers', () => {
    expectSyntaxError('resolver Hello =  ').to.deep.equal({
      message: 'Syntax Error: Expected Variant, found <EOF>.',
      locations: [{ line: 1, column: 19 }],
    });
  });

  it('Union fails with leading pipe', () => {
    expectSyntaxError('resolver Hello = | Wo | Rld').to.deep.equal({
      message: 'Syntax Error: Expected Variant, found "|".',
      locations: [{ line: 1, column: 18 }],
    });
  });

  it('Union fails with double pipe', () => {
    expectSyntaxError('resolver Hello = Wo || Rld').to.deep.equal({
      message: 'Syntax Error: Expected Name, found "|".',
      locations: [{ line: 1, column: 22 }],
    });
  });

  it('Union fails with trailing pipe', () => {
    expectSyntaxError('resolver Hello = Wo | Rld |').to.deep.equal({
      message: 'Syntax Error: Expected Name, found <EOF>.',
      locations: [{ line: 1, column: 28 }],
    });
  });

  it('Scalar', () => {
    const doc = parse('scalar Hello');

    expectJSON(doc);
  });

  it('Simple data object', () => {
    const doc = parse(`
    data Hello {
      world: String
    }`);

    JSONSnapshot(doc)
  });

  it('Simple data object with args should fail', () => {
    expectSyntaxError(`
      data  Hello {
        world(foo: Int): String
      }
    `).to.deep.equal({
      message: 'Syntax Error: Expected ":", found "(".',
      locations: [{ line: 3, column: 14 }],
    });
  });
});
