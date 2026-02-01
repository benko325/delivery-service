import { Logger } from "nestjs-pino";
import { OpenAPIObject } from "@nestjs/swagger";
import * as fs from "fs";
import * as path from "path";

export function saveOpenApiSpec(
  openApiDocument: OpenAPIObject,
  logger?: Logger,
) {
  const outputPath = path.resolve(process.cwd(), "openapi.json");

  try {
    fs.writeFileSync(outputPath, JSON.stringify(openApiDocument, null, 2));
    logger?.log(`OpenAPI spec written to: ${outputPath}`);
  } catch (error) {
    logger?.error(`Failed to write OpenAPI spec: ${error}`);
  }
}
