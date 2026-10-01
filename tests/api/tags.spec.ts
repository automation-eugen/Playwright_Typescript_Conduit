import { test, expect } from '../../src/fixtures/api.fixtures';

test.describe('Tags API', () => {
  test('returns a list of tags', async ({ api }) => {
    const res = await api.tags.list();

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.tags)).toBe(true);
  });
});