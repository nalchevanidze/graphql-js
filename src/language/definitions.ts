import type {
  DataTypeDefinitionNode,
  DefinitionNode,
  NameNode,
  Role,
  VariantDefinitionNode,
} from './ast';
import { Kind } from './kinds';
import type { Parser } from './parser';
import { TokenKind } from './tokenKind';

export const parseAlgebraicDataType = (
  parser: Parser,
  role: Role,
): DataTypeDefinitionNode => {
  const start = parser.lookAhead();
  const description = parser.parseDescription();
  parser.expectKeyword(role);
  const name = parser.parseName();
  const directives = parser.parseConstDirectives();
  const isEquals = parser.expectOptionalToken(TokenKind.EQUALS);
  const isUnion = parser.lookAhead().kind !== TokenKind.BRACE_L;
  const variants: ReadonlyArray<VariantDefinitionNode> =
    isEquals && isUnion
      ? parser.delimitedMany(TokenKind.PIPE, () =>
          parseVariantDefinition(parser),
        )
      : [parseVariantDefinition(parser, name)];
  return parser.node<DataTypeDefinitionNode>(start, {
    kind: Kind.DATA_TYPE_DEFINITION,
    description,
    name,
    directives,
    variants,
  });
};

export const parseDefinitions = (
  parser: Parser,
  keywordToken: string,
): DefinitionNode | undefined => {
  switch (keywordToken) {
    case 'scalar':
      return parser.parseScalarTypeDefinition();
    case 'type':
      return parser.parseObjectTypeDefinition();
    case 'resolver':
      return parser.parseResolverTypeDefinition();
    case 'data':
      return parseAlgebraicDataType(parser, 'data');
    case 'directive':
      return parser.parseDirectiveDefinition();
  }

  return undefined;
};

const parseVariantDefinition = (
  parser: Parser,
  typeName?: NameNode,
): VariantDefinitionNode => {
  const start = parser.lookAhead();
  const description = parser.parseDescription();
  const name = typeName ?? parser.parseVariantName();
  const directives = parser.parseConstDirectives();
  const fields = parseVariantFields(parser);
  return parser.node<VariantDefinitionNode>(start, {
    kind: Kind.VARIANT_DEFINITION,
    description,
    name,
    directives,
    fields,
  });
};

const parseVariantFields = (parser: Parser) => {
  const nodes = [];
  if (parser.expectOptionalToken(TokenKind.BRACE_L)) {
    while (!parser.expectOptionalToken(TokenKind.BRACE_R)) {
      nodes.push(parser.parseInputValueDef());
    }
    return nodes;
  }
  return [];
};
