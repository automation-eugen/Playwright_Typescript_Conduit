import { test, expect } from '../../src/fixtures/api.fixtures';
import type { Api } from '../../src/api/api';
import { parseBody } from '../../src/schemas/parse';
import { ArticleResponseSchema } from '../../src/schemas/conduit.schemas';

type Actor = 'anonymous' | 'author' | 'otherUser';
type Action = 'read' | 'update' | 'delete';

const matrix: { action: Action; actor: Actor; expected: number }[] = [
  { action: 'read', actor: 'anonymous', expected: 200 },
  { action: 'read', actor: 'otherUser', expected: 200 },
  { action: 'update', actor: 'anonymous', expected: 401 },
  { action: 'update', actor: 'otherUser', expected: 403 },
  { action: 'update', actor: 'author', expected: 200 },
  { action: 'delete', actor: 'anonymous', expected: 401 },
  { action: 'delete', actor: 'otherUser', expected: 403 },
  { action: 'delete', actor: 'author', expected: 204 }, // pin after verifying (200 or 204)
];

function perform(as: Api, action: Action, slug: string) {
  switch (action) {
    case 'read':
      return as.articles.get(slug);
    case 'update':
      return as.articles.update(slug, { body: 'changed' });
    case 'delete':
      return as.articles.delete(slug);
  }
}

test.describe('Articles API — permissions', () => {
  for (const { action, actor, expected } of matrix) {
    test(`${actor} ${action} article → ${expected}`, async ({ api, createUser, createArticle }) => {
      const { api: authorApi } = await createUser();
      const article = await createArticle({}, authorApi);
      const actors: Record<Actor, () => Promise<Api>> = {
        anonymous: async () => api,
        author: async () => authorApi,
        otherUser: async () => (await createUser()).api,
      };
      const as = await actors[actor]();

      const res = await perform(as, action, article.slug);

      expect(res.status()).toBe(expected);
      const after = await authorApi.articles.get(article.slug);
      if (expected >= 400) {
        const { article: unchanged } = await parseBody(after, ArticleResponseSchema);
        expect(unchanged.body).toBe(article.body);
      } else if (action === 'delete') {
        expect(after.status()).toBe(404);
      }
    });
  }
});