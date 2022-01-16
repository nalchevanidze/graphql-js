/**
 * The set of allowed kind values for AST nodes.
 */
export enum Kind {
  /** Name */
  NAME = 'Name',

  /** Document */
  DOCUMENT = 'Document',
  OPERATION_DEFINITION = 'OperationDefinition',
  VARIABLE_DEFINITION = 'VariableDefinition',
  SELECTION_SET = 'SelectionSet',
  FIELD = 'Field',
  ARGUMENT = 'Argument',

  /** Fragments */
  FRAGMENT_SPREAD = 'FragmentSpread',
  INLINE_FRAGMENT = 'InlineFragment',
  FRAGMENT_DEFINITION = 'FragmentDefinition',

  /** Values */
  VARIABLE = 'Variable',
  INT = 'IntValue',
  FLOAT = 'FloatValue',
  STRING = 'StringValue',
  BOOLEAN = 'BooleanValue',
  NULL = 'NullValue',
  ENUM = 'EnumValue',
  LIST = 'ListValue',
  OBJECT = 'ObjectValue',
  OBJECT_FIELD = 'ObjectField',

  /** Directives */
  DIRECTIVE = 'Directive',

  /** Types */
  NAMED_TYPE = 'NamedType',
  LIST_TYPE = 'ListType',
  NON_NULL_TYPE = 'NonNullType',

  /** Type System Definitions */
  SCHEMA_DEFINITION = 'SchemaDefinition',
  OPERATION_TYPE_DEFINITION = 'OperationTypeDefinition',

  /** Type Definitions */
  SCALAR_TYPE_DEFINITION = 'ScalarTypeDefinition',
  OBJECT_TYPE_DEFINITION = 'ObjectTypeDefinition',
  FIELD_DEFINITION = 'FieldDefinition',
  INPUT_VALUE_DEFINITION = 'InputValueDefinition',
  UNION_TYPE_DEFINITION = 'UnionTypeDefinition',
  ENUM_VALUE_DEFINITION = 'EnumValueDefinition',
  DATA_TYPE_DEFINITION = 'DataTypeDefinition',

  /** Directive Definitions */
  DIRECTIVE_DEFINITION = 'DirectiveDefinition',

  /** Type System Extensions */
  SCHEMA_EXTENSION = 'SchemaExtension',

  /** Type Extensions */
  SCALAR_TYPE_EXTENSION = 'ScalarTypeExtension',
  OBJECT_TYPE_EXTENSION = 'ObjectTypeExtension',
  INTERFACE_TYPE_EXTENSION = 'InterfaceTypeExtension',
  UNION_TYPE_EXTENSION = 'UnionTypeExtension',
  ENUM_TYPE_EXTENSION = 'EnumTypeExtension',
  INPUT_OBJECT_TYPE_EXTENSION = 'InputObjectTypeExtension',
  VARIANT_DEFINITION = 'VariantDefinition'
}

/**
 * The Enum type representing the possible kind values of AST nodes.
 *
 * @deprecated Please use `Kind`. Will be remove in v17.
 */
export type KindEnum = typeof Kind;
