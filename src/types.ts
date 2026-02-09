export type EnvVarType = 'string' | 'number' | 'enum' | 'boolean';

export interface EnvVarSchemaBase {
  required?: boolean;
  default?: any;
}

export interface BooleanSchema extends EnvVarSchemaBase {
  type: 'boolean';
  default?: boolean;
}

export interface StringSchema extends EnvVarSchemaBase {
  type: 'string';
  default?: string;
}

export interface NumberSchema extends EnvVarSchemaBase {
  type: 'number';
  default?: number;
}

export interface EnumSchema extends EnvVarSchemaBase {
  type: 'enum';
  values: readonly string[];
  default?: string;
}

export type EnvVarSchema = StringSchema | NumberSchema | EnumSchema | BooleanSchema;

export type EnvSchema = Record<string, EnvVarSchema>;

// Helper type to infer the return type from a schema
export type InferEnvType<T extends EnvVarSchema> =
  T extends BooleanSchema
    ? boolean
    : T extends NumberSchema
    ? number
    : T extends EnumSchema
    ? T['values'][number]
    : T extends StringSchema
    ? string
    : never;

export type InferEnvSchema<T extends EnvSchema> = {
  [K in keyof T]: InferEnvType<T[K]>;
};
