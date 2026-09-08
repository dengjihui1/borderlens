import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readJson = async (relativePath: string) => JSON.parse(await readFile(new URL(relativePath, import.meta.url), 'utf8'));

test('联合国 M49 目录包含全球法域且代码唯一', async () => {
  const catalog = await readJson('../data/countries.un-m49.json');
  assert.equal(catalog.count, 248);
  assert.equal(new Set(catalog.territories.map((item: { iso2: string }) => item.iso2)).size, 248);
  assert.ok(catalog.territories.some((item: { iso2: string; nameEn: string }) => item.iso2 === 'JP' && item.nameEn === 'Japan'));
});

test('所有已验证种子规则都连接到已注册官方来源', async () => {
  const registry = await readJson('../data/official-source-registry.json');
  const policies = await readJson('../data/policies.seed.json');
  const sourceIds = new Set(registry.sources.map((source: { id: string }) => source.id));
  for (const rule of policies.rules) {
    assert.equal(rule.status, 'verified');
    assert.ok(rule.sourceIds.length > 0);
    for (const sourceId of rule.sourceIds) assert.ok(sourceIds.has(sourceId), `${rule.id} references ${sourceId}`);
  }
});

test('来源发现状态不被误写成规则已验证', async () => {
  const registry = await readJson('../data/official-source-registry.json');
  const reachable = registry.sources.filter((source: { status: string }) => source.status === 'reachable');
  const blocked = registry.sources.filter((source: { status: string }) => source.status === 'blocked');
  assert.ok(reachable.length >= 8);
  assert.equal(blocked.length, 2);
});
