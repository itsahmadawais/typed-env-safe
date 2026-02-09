import dotenv from 'dotenv';
import { EnvVarSchema, InferEnvSchema } from './types';

dotenv.config();

/**
 * Parses a string value to a boolean.
 * Accepts: 'true', '1', 'yes', 'on' (case-insensitive) → true
 *          'false', '0', 'no', 'off', '' (case-insensitive) → false
 * Throws error for invalid values
 */
function parseBoolean(value: string, key: string): boolean {
  const normalized = value.toLowerCase().trim();
  
  if (normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on') {
    return true;
  }
  
  if (normalized === 'false' || normalized === '0' || normalized === 'no' || normalized === 'off' || normalized === '') {
    return false;
  }
  
  throw new Error(
    `Environment variable "${key}" must be a boolean. ` +
    `Accepted values: true, false, 1, 0, yes, no, on, off. ` +
    `Received: "${value}"`
  );
}

export function defineEnvSchema<T extends Record<string, EnvVarSchema>>(
  schema: T
): InferEnvSchema<T> {
  const env: Record<string, any> = {};

  for (const key in schema) {
    const value = process.env[key];
    const config = schema[key];

    // Handle undefined or null values
    if (value === undefined || value === null) {
      if (config.required && config.default === undefined) {
        throw new Error(`Environment variable "${key}" is required but not defined`);
      }
      env[key] = config.default;
      continue;
    }

    // Handle empty string - for boolean, treat as false; for others, use default or value
    if (value === '' && config.type !== 'boolean') {
      if (config.required && config.default === undefined) {
        throw new Error(`Environment variable "${key}" is required but is empty`);
      }
      env[key] = config.default !== undefined ? config.default : value;
      continue;
    }

    switch (config.type) {
      case 'string':
        env[key] = value;
        break;

      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error(`Environment variable "${key}" must be a number. Received: "${value}"`);
        }
        env[key] = num;
        break;

      case 'boolean':
        env[key] = parseBoolean(value, key);
        break;

      case 'enum':
        if (!config.values.includes(value)) {
          throw new Error(
            `Environment variable "${key}" must be one of: ${config.values.join(', ')}. ` +
            `Received: "${value}"`
          );
        }
        env[key] = value;
        break;

      default:
        throw new Error(`Unknown type "${(config as any).type}" for environment variable "${key}"`);
    }
  }

  return env as InferEnvSchema<T>;
}

// Re-export types for convenience
export type {
  EnvVarSchema,
  EnvVarType,
  EnvSchema,
  BooleanSchema,
  StringSchema,
  NumberSchema,
  EnumSchema,
  InferEnvSchema,
  InferEnvType,
} from './types';
