import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { CATEGORIES } from './index';

/**
 * Parts of US-007 are about what is written down: AC-019 asks for a *documented*
 * list per category, AC-020 for the exclusions to be recorded as an analyst
 * assumption, and AC-021 for the data category to be flagged as analyst-added
 * with a removal path. Those are checked here against the registry's README and
 * source, so the documentation cannot silently fall behind the data.
 */

const readme = readFileSync(fileURLToPath(new URL('./README.md', import.meta.url)), 'utf8');
const source = readFileSync(fileURLToPath(new URL('./index.ts', import.meta.url)), 'utf8');

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function documentedUnitsFor(label: string): string {
  const row = readme
    .split('\n')
    .find((line) => new RegExp('^\\|\\s*' + escapeRegExp(label) + '\\s*\\|').test(line));

  if (!row) throw new Error('README documents no unit row for the "' + label + '" category');

  const cells = row.split('|');
  return cells[cells.length - 2] ?? '';
}

describe('AC-019 every category has a documented unit list', () => {
  it.each(CATEGORIES.map((c) => [c.label, c] as const))(
    'the README lists every unit the %s category offers',
    (label, cat) => {
      const documented = documentedUnitsFor(label);

      for (const unit of cat.units) {
        const token = new RegExp('(^|[\\s,(])' + escapeRegExp(unit.symbol) + '([\\s,)]|$)');
        expect(token.test(documented), label + ' does not document ' + unit.symbol).toBe(true);
      }
    }
  );

  it('states what decimal and binary mean for the data units', () => {
    expect(readme).toMatch(/decimal.*1000/i);
    expect(readme).toMatch(/binary.*1024/i);
  });
});

describe('AC-020 the exclusions are recorded as an analyst assumption', () => {
  it('says the lists are limited to everyday units and are open to adjustment', () => {
    expect(readme).toMatch(/assumption/i);
    expect(readme).toMatch(/open to adjustment/i);
    expect(readme).toMatch(/scientific and historical units/i);
  });

  it('repeats the assumption where the data lives, not only in the README', () => {
    expect(source).toMatch(/analyst assumption/i);
  });
});

describe('AC-021 the data category is flagged as analyst-added', () => {
  it('says in the README that it was not in the original brief', () => {
    expect(readme).toMatch(/analyst/i);
    expect(readme).toMatch(/not in the original brief|not \*\*in the original brief\*\*/i);
  });

  it('documents how to remove it and that nothing else changes', () => {
    expect(readme).toMatch(/CATEGORIES/);
    expect(readme).toMatch(/remove|delete/i);
  });

  it('carries the same flag next to the definition in the source', () => {
    expect(source).toMatch(/ANALYST-ADDED CATEGORY/);
  });
});
