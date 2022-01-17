import type {
  DataTypeDefinitionNode,
  DefinitionNode,
  NamedTypeNode,
  NameNode,
  ObjectTypeDefinitionNode,
  Role,
  UnionTypeDefinitionNode,
  VariantDefinitionNode,
} from './ast';
import { Kind } from './kinds';
import type { Parser } from './parser';
import { TokenKind } from './tokenKind';

export const parseDefinitions = (
  parser: Parser,
  keywordToken: string,
): DefinitionNode | undefined => {
  switch (keywordToken) {
    case 'scalar':
      return parser.parseScalarTypeDefinition();
    case 'type':
      return parseObjectTypeDefinition(parser);
    case 'resolver':
      return parseResolverTypeDefinition(parser);
    case 'data':
      return parseDataTypeDefinition(parser, 'data');
    case 'directive':
      return parser.parseDirectiveDefinition();
  }

  return undefined;
};

const parseResolverTypeDefinition = (
  parser: Parser,
): UnionTypeDefinitionNode => {
  const start = parser.lookAhead();
  const description = parser.parseDescription();
  parser.expectKeyword('resolver');
  const name = parser.parseName();
  const directives = parser.parseConstDirectives();
  const types = parseUnionMemberTypes(parser);
  return parser.node<UnionTypeDefinitionNode>(start, {
    kind: Kind.UNION_TYPE_DEFINITION,
    description,
    name,
    directives,
    types,
  });
};

const parseUnionMemberTypes = (parser: Parser): Array<NamedTypeNode> =>
  parser.expectOptionalToken(TokenKind.EQUALS)
    ? parser.delimitedMany(TokenKind.PIPE, parser.parseNamedType)
    : [];

const parseObjectTypeDefinition = (
  parser: Parser,
): ObjectTypeDefinitionNode => {
  const start = parser.lookAhead();
  const description = parser.parseDescription();
  parser.expectKeyword('type');
  const name = parser.parseName();
  const directives = parser.parseConstDirectives();
  const fields = parser.parseFieldsDefinition();
  return parser.node<ObjectTypeDefinitionNode>(start, {
    kind: Kind.OBJECT_TYPE_DEFINITION,
    description,
    name,
    directives,
    fields,
  });
};

export const parseDataTypeDefinition = (
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

const parseVariantName = (parser: Parser): NameNode => {
  const { value } = parser.lookAhead();
  if (value === 'true' || value === 'false' || value === 'null') {
    parser.invalidToken('is reserved and cannot be used for an enum value');
  }
  return parser.parseName();
};

const parseVariantDefinition = (
  parser: Parser,
  typeName?: NameNode,
): VariantDefinitionNode => {
  const start = parser.lookAhead();
  const description = parser.parseDescription();
  const name = typeName ?? parseVariantName(parser);
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
