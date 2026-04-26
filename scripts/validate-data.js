#!/usr/bin/env node
/**
 * Data validation script.
 *
 * Run with: npm run validate-data
 *
 * Walks every YAML file in /data and validates it against a JSON schema for
 * its category. Reports errors with file paths and field names so contributors
 * can fix problems before opening a pull request.
 *
 * Exits with code 1 if any file is invalid.
 */

import { readFileSync } from 'fs';
import { glob } from 'glob';
import jsYaml from 'js-yaml';
import Ajv from 'ajv';
import { fileURLToPath } from 'url';
import { dirname, resolve, relative } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const ajv = new Ajv({ allErrors: true, strict: false });

// ---------- Schemas ----------

const referenceSchema = {
  type: 'object',
  required: ['book', 'chapter'],
  properties: {
    book: { type: 'string' },
    chapter: { type: 'number' },
    verse: { type: 'number' },
    note: { type: 'string' }
  }
};

const coordinatesSchema = {
  type: 'object',
  required: ['lat', 'lng'],
  properties: {
    lat: { type: 'number', minimum: -90, maximum: 90 },
    lng: { type: 'number', minimum: -180, maximum: 180 }
  }
};

const personSchema = {
  type: 'object',
  required: ['id', 'name'],
  properties: {
    id: { type: 'string', pattern: '^[a-z0-9_]+$' },
    name: { type: 'string' },
    altNames: { type: 'array', items: { type: 'string' } },
    bornAt: { type: 'number' },
    diedAt: { type: 'number' },
    activeFrom: { type: 'number' },
    activeTo: { type: 'number' },
    birthplaceId: { type: 'string' },
    residenceId: { type: 'string' },
    journeyId: { type: 'string' },
    role: { type: 'string' },
    summary: { type: 'string' },
    references: { type: 'array', items: referenceSchema },
    sources: { type: 'array', items: { type: 'string' } }
  },
  additionalProperties: false
};

const placeSchema = {
  type: 'object',
  required: ['id', 'name', 'coordinates'],
  properties: {
    id: { type: 'string', pattern: '^[a-z0-9_]+$' },
    name: { type: 'string' },
    altNames: { type: 'array', items: { type: 'string' } },
    region: { type: 'string' },
    coordinates: coordinatesSchema,
    foundedAt: { type: 'number' },
    destroyedAt: { type: 'number' },
    activeFrom: { type: 'number' },
    activeTo: { type: 'number' },
    summary: { type: 'string' },
    references: { type: 'array', items: referenceSchema },
    sources: { type: 'array', items: { type: 'string' } }
  },
  additionalProperties: false
};

const eventSchema = {
  type: 'object',
  required: ['id', 'name'],
  properties: {
    id: { type: 'string', pattern: '^[a-z0-9_]+$' },
    name: { type: 'string' },
    category: {
      type: 'string',
      enum: ['natural', 'miraculous', 'military', 'political', 'religious']
    },
    year: { type: 'number' },
    startYear: { type: 'number' },
    endYear: { type: 'number' },
    coordinates: coordinatesSchema,
    summary: { type: 'string' },
    references: { type: 'array', items: referenceSchema },
    views: {
      type: 'array',
      items: {
        type: 'object',
        required: ['label'],
        properties: {
          label: { type: 'string' },
          summary: { type: 'string' },
          coordinates: coordinatesSchema,
          confidence: {
            type: 'string',
            enum: ['consensus', 'majority', 'disputed', 'minority', 'speculative']
          },
          sources: { type: 'array', items: { type: 'string' } }
        }
      }
    },
    sources: { type: 'array', items: { type: 'string' } }
  },
  additionalProperties: false
};

const journeyStopSchema = {
  type: 'object',
  required: ['placeId'],
  properties: {
    placeId: { type: 'string' },
    year: { type: 'number' },
    note: { type: 'string' }
  }
};

const journeySchema = {
  type: 'object',
  required: ['id', 'name', 'stops'],
  properties: {
    id: { type: 'string', pattern: '^[a-z0-9_]+$' },
    name: { type: 'string' },
    color: { type: 'string' },
    startYear: { type: 'number' },
    endYear: { type: 'number' },
    stops: { type: 'array', items: journeyStopSchema, minItems: 2 },
    summary: { type: 'string' },
    references: { type: 'array', items: referenceSchema },
    sources: { type: 'array', items: { type: 'string' } }
  },
  additionalProperties: false
};

const sourceSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', pattern: '^[a-z0-9_]+$' },
    author: { type: 'string' },
    year: { type: 'number' },
    title: { type: 'string' },
    publisher: { type: 'string' },
    url: { type: 'string' },
    type: { type: 'string' },
    note: { type: 'string' }
  }
};

// ---------- Validation ----------

const validators = {
  people: ajv.compile(personSchema),
  places: ajv.compile(placeSchema),
  events: ajv.compile(eventSchema),
  journeys: ajv.compile(journeySchema)
};

const sourceValidator = ajv.compile(sourceSchema);

let errorCount = 0;
const seenIds = { people: new Set(), places: new Set(), events: new Set(), journeys: new Set(), sources: new Set() };

function reportError(file, message, errors) {
  errorCount++;
  console.error(`\n✗ ${relative(root, file)}`);
  console.error(`  ${message}`);
  if (errors) {
    for (const err of errors) {
      console.error(`    ${err.instancePath || '(root)'}: ${err.message}`);
    }
  }
}

async function validateCategory(category) {
  const validator = validators[category];
  const files = await glob(`data/${category}/*.yaml`, { cwd: root });

  for (const relativePath of files) {
    const filePath = resolve(root, relativePath);
    let parsed;
    try {
      parsed = jsYaml.load(readFileSync(filePath, 'utf8'));
    } catch (err) {
      reportError(filePath, `YAML parse error: ${err.message}`);
      continue;
    }

    const items = Array.isArray(parsed) ? parsed : [parsed];
    for (const item of items) {
      if (!validator(item)) {
        reportError(filePath, 'Schema validation failed', validator.errors);
        continue;
      }
      if (item.id) {
        if (seenIds[category].has(item.id)) {
          reportError(filePath, `Duplicate id in ${category}: ${item.id}`);
        } else {
          seenIds[category].add(item.id);
        }
      }
    }
  }
}

async function validateSources() {
  const files = await glob('data/sources/*.yaml', { cwd: root });
  for (const relativePath of files) {
    const filePath = resolve(root, relativePath);
    let parsed;
    try {
      parsed = jsYaml.load(readFileSync(filePath, 'utf8'));
    } catch (err) {
      reportError(filePath, `YAML parse error: ${err.message}`);
      continue;
    }
    const items = Array.isArray(parsed) ? parsed : [parsed];
    for (const item of items) {
      if (!sourceValidator(item)) {
        reportError(filePath, 'Schema validation failed', sourceValidator.errors);
        continue;
      }
      if (seenIds.sources.has(item.id)) {
        reportError(filePath, `Duplicate source id: ${item.id}`);
      } else {
        seenIds.sources.add(item.id);
      }
    }
  }
}

// ---------- Cross-reference checks ----------

async function validateCrossReferences() {
  // Loaded-id sets are already populated by category validators above.
  // Now we re-walk the data and verify every foreign key resolves.

  // People reference places (birthplaceId, residenceId) and journeys (journeyId)
  const peopleFiles = await glob('data/people/*.yaml', { cwd: root });
  for (const f of peopleFiles) {
    const filePath = resolve(root, f);
    const parsed = jsYaml.load(readFileSync(filePath, 'utf8'));
    const items = Array.isArray(parsed) ? parsed : [parsed];
    for (const p of items) {
      if (p.birthplaceId && !seenIds.places.has(p.birthplaceId)) {
        reportError(filePath, `Unknown birthplaceId: ${p.birthplaceId}`);
      }
      if (p.residenceId && !seenIds.places.has(p.residenceId)) {
        reportError(filePath, `Unknown residenceId: ${p.residenceId}`);
      }
      if (p.journeyId && !seenIds.journeys.has(p.journeyId)) {
        reportError(filePath, `Unknown journeyId: ${p.journeyId}`);
      }
      for (const sid of p.sources || []) {
        if (!seenIds.sources.has(sid)) reportError(filePath, `Unknown source: ${sid}`);
      }
    }
  }

  // Journeys reference places via stops[].placeId
  const journeyFiles = await glob('data/journeys/*.yaml', { cwd: root });
  for (const f of journeyFiles) {
    const filePath = resolve(root, f);
    const parsed = jsYaml.load(readFileSync(filePath, 'utf8'));
    const items = Array.isArray(parsed) ? parsed : [parsed];
    for (const j of items) {
      for (const stop of j.stops || []) {
        if (!seenIds.places.has(stop.placeId)) {
          reportError(filePath, `Unknown placeId in stop: ${stop.placeId}`);
        }
      }
    }
  }
}

// ---------- Run ----------

async function main() {
  console.log('Validating data files...\n');

  await validateSources();
  await validateCategory('places');
  await validateCategory('people');
  await validateCategory('events');
  await validateCategory('journeys');
  await validateCrossReferences();

  console.log('\n---');
  console.log(`Sources: ${seenIds.sources.size}`);
  console.log(`Places:  ${seenIds.places.size}`);
  console.log(`People:  ${seenIds.people.size}`);
  console.log(`Events:  ${seenIds.events.size}`);
  console.log(`Journeys:${seenIds.journeys.size}`);

  if (errorCount > 0) {
    console.error(`\n${errorCount} validation error(s) — please fix before submitting.`);
    process.exit(1);
  }
  console.log('\n✓ All data files valid.');
}

main().catch((err) => {
  console.error('Validator crashed:', err);
  process.exit(2);
});
