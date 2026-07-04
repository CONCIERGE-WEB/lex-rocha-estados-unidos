#!/usr/bin/env node
/**
 * Verifica consistencia minima de release SemVer:
 * - package.json precisa ter version
 * - CHANGELOG.md precisa conter a secao da versao atual
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const pkgPath = join(root, "package.json");
const changelogPath = join(root, "CHANGELOG.md");

const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const version = pkg.version;

if (!version || typeof version !== "string") {
  console.error("✗ package.json sem campo version valido.");
  process.exit(1);
}

const changelog = readFileSync(changelogPath, "utf8");
const header = `## [${version}]`;

if (!changelog.includes(header)) {
  console.error(`✗ CHANGELOG.md nao contem a secao ${header}.`);
  process.exit(1);
}

console.log(`✓ SemVer OK para versao ${version}.`);
