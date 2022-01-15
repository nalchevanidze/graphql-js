export const kitchenSinkSDL = `
"""This is a description of the schema as a whole."""
schema {
  query: QueryType
  mutation: MutationType
  subscription: SubscriptionType
}

"""
This is a description
of the \`Foo\` type.
"""
type Foo implements Bar & Baz & Two {
  "Description of the \`one\` field."
  one: Type
  """This is a description of the \`two\` field."""
  two(
    """This is a description of the \`argument\` argument."""
    argument: InputType!
  ): Type
  """This is a description of the \`three\` field."""
  three(argument: InputType, other: String): Int
  four(argument: String = "string"): String
  five(argument: [String] = ["string", "string"]): String
  six(argument: InputType = {key: "value"}): Type
  seven(argument: Int = null): Type
}

type AnnotatedObject @onObject(arg: "value") {
  annotatedField(arg: Type = "default" @onArgumentDefinition): Type @onField
}

type UndefinedType

interface Bar {
  one: Type
  four(argument: String = "string"): String
}

interface AnnotatedInterface @onInterface {
  annotatedField(arg: Type @onArgumentDefinition): Type @onField
}

interface UndefinedInterface

interface Baz implements Bar & Two {
  one: Type
  two(argument: InputType!): Type
  four(argument: String = "string"): String
}

resolver Feed = Story | Article | Advert | Photo | Video

resolver AnnotatedUnion @onUnion = A | B

resolver AnnotatedUnionTwo @onUnion = A | B

resolver UndefinedUnion

scalar CustomScalar

scalar AnnotatedScalar @onScalar

enum Site {
  """This is a description of the \`DESKTOP\` value"""
  DESKTOP
  """This is a description of the \`MOBILE\` value"""
  MOBILE
  "This is a description of the \`WEB\` value"
  WEB
  VR
}

enum AnnotatedEnum @onEnum {
  ANNOTATED_VALUE @onEnumValue
  OTHER_VALUE
}

enum UndefinedEnum

data InputType = {
  key: String!
  answer: Int = 42
  other: Float = 1.23e4 @onInputFieldDefinition
}

data AnnotatedInput @onInputObject = {
  annotatedField: Type @onInputFieldDefinition
}

data UndefinedInput

directive @include(if: Boolean!) on FIELD | FRAGMENT_SPREAD | INLINE_FRAGMENT

directive @myRepeatableDir(name: String!) repeatable on OBJECT | INTERFACE

`;
