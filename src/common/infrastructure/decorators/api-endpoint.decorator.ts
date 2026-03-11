import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiResponseOptions,
  getSchemaPath,
} from '@nestjs/swagger';
import { SwaggerEnumType } from '@nestjs/swagger/dist/types/swagger-enum.type';

interface ApiResponseConfig {
  status: number;
  description: string;
  type?: Type<any>;
  isArray?: boolean;
}

interface ApiParamConfig {
  name: string;
  description: string;
  required?: boolean;
  type?: Type<any> | 'string' | 'number' | 'boolean';
  enum?: SwaggerEnumType;
}
interface ApiQueryParamConfig {
  name: string;
  description: string;
  required?: boolean;
  type?: Type<any> | 'string' | 'number' | 'boolean';
}

interface ApiBodyConfig {
  type: Type<any>;
  description?: string;
  required?: boolean;
}

interface ApiEndpointOptions {
  summary: string;
  description?: string;
  responses: ApiResponseConfig[];
  params?: ApiParamConfig[];
  queries?: ApiQueryParamConfig[];
  body?: ApiBodyConfig;
}

/**
 * Custom decorator that combines ApiOperation, ApiResponse, ApiParam, and ApiBody
 * to reduce boilerplate in controller endpoints
 *
 * @example
 * ```typescript
 * @ApiEndpoint({
 *   summary: 'Get user preferences',
 *   description: 'Retrieves all preferences for the authenticated user',
 *   responses: [
 *     { status: 200, description: 'Preferences retrieved successfully', type: UserPreferencesResponseDto },
 *     { status: 404, description: 'User preferences not found' }
 *   ]
 * })
 * ```
 */
export function ApiEndpoint(options: ApiEndpointOptions) {
  const decorators: MethodDecorator[] = [];

  // Add ApiOperation
  decorators.push(
    ApiOperation({
      summary: options.summary,
      description: options.description,
    }),
  );

  // Add ApiResponse decorators
  if (options.responses && options.responses.length > 0) {
    options.responses.forEach((response) => {
      const responseConfig: ApiResponseOptions = {
        status: response.status,
        description: response.description,
      };

      if (response.type) {
        if (response.isArray) {
          (responseConfig as any).schema = {
            type: 'array',
            items: { $ref: getSchemaPath(response.type) },
          };
        } else {
          responseConfig.type = response.type;
        }
      }

      decorators.push(ApiResponse(responseConfig));
    });

    // Add extra models for Swagger documentation
    const models = options.responses
      .filter((r) => r.type)
      .map((r) => r.type) as Type<any>[];
    if (models.length > 0) {
      decorators.push(ApiExtraModels(...models));
    }
  }

  // Add ApiParam decorators
  if (options.params && options.params.length > 0) {
    options.params.forEach((param) => {
      decorators.push(
        ApiParam({
          name: param.name,
          description: param.description,
          required: param.required ?? true,
          type: param.type,
          enum: param.enum,
        }),
      );
    });
  }

  // Add ApiBody decorator
  if (options.body) {
    decorators.push(
      ApiBody({
        type: options.body.type,
        description: options.body.description,
        required: options.body.required ?? true,
      }),
    );
    decorators.push(ApiExtraModels(options.body.type));
  }

  // Add ApiQuery decorators
  if (options.queries && options.queries.length > 0) {
    options.queries.forEach((query) => {
      decorators.push(
        ApiQuery({
          name: query.name,
          description: query.description,
          required: query.required ?? true,
          type: query.type,
        }),
      );
    });
  }

  return applyDecorators(...decorators);
}
