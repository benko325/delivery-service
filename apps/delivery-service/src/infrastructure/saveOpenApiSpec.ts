import { Logger } from "@nestjs/common";
import { OpenAPIObject } from "@nestjs/swagger";
import * as fs from "fs";
import * as path from "path";

export function saveOpenApiSpec(
  openApiDocument?: OpenAPIObject,
  logger?: Logger,
) {
  const outputPath = path.resolve(process.cwd(), "openapi.json");

  fs.writeFileSync(
    outputPath,
    JSON.stringify(openApiDocument, null, 2),
    "utf-8",
  );

  logger?.log(`OpenAPI spec written to: ${outputPath}`);
}
