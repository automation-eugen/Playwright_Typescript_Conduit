import { test, expect } from '../../src/fixtures/api.fixtures';
import { buildArticle } from '../../src/data/articles';
import { edgeCaseStrings } from '../../src/data/edge-cases';
import { uniqueId } from '../../src/data/unique';
import { parseBody } from '../../src/schemas/parse';
import { ArticleListSchema, ArticleResponseSchema } from '../../src/schemas/conduit.schemas';

test.describe('Articles API', () => {
  test('creates an article authored by the current user', { tag: '@smoke' }, async ({ authedApi, workerUser }) => {
    const newArticle = buildArticle({ tagList: ['qa', 'playwright'] });

    const res = await authedApi.articles.create(newArticle);

    expect(res.status()).toBe(201); // pin after verifying against the spec
    const { article } = await parseBody(res, ArticleResponseSchema);
    try {
      expect(article).toMatchObject({
        title: newArticle.title,
        description: newArticle.description,
        body: newArticle.body,
        favorited: false,
        favoritesCount: 0,
      });
      expect(article.author.username).toBe(workerUser.username);
      expect([...article.tagList].sort()).toEqual([...(newArticle.tagList ?? [])].sort());
    } finally {
      await authedApi.articles.delete(article.slug);
    }
  });

  test('rejects article creation without authentication', async ({ api }) => {
    const res = await api.articles.create(buildArticle());

    expect(res.status()).toBe(401);
  });

  test('lists articles matching the contract', { tag: '@smoke' }, async ({ api }) => {
    const res = await api.articles.list({ limit: 5 });

    expect(res.status()).toBe(200);
    const { articles, articlesCount } = await parseBody(res, ArticleListSchema);
    expect(articles.length).toBeLessThanOrEqual(5);
    expect(articlesCount).toBeGreaterThanOrEqual(articles.length);
  });

  test('filters articles by author', async ({ createUser, createArticle }) => {
    const { user, api } = await createUser();
    await createArticle({}, api);
    await createArticle({}, api);

    const res = await api.articles.list({ author: user.username });

    expect(res.status()).toBe(200);
    const { articles, articlesCount } = await parseBody(res, ArticleListSchema);
    expect(articlesCount).toBe(2);
    expect(articles.every((a) => a.author.username === user.username)).toBe(true);
  });

  test('filters articles by tag', async ({ api, createArticle }) => {
    const tag = `qa-${uniqueId()}`;
    const tagged = await createArticle({ tagList: [tag] });
    await createArticle(); // negative control: must not appear

    const res = await api.articles.list({ tag });

    const { articles } = await parseBody(res, ArticleListSchema);
    expect(articles.map((a) => a.slug)).toEqual([tagged.slug]);
  });
});

test.describe('Articles API — content round trip', () => {
  for (const [name, value] of Object.entries(edgeCaseStrings)) {
    test(`stores ${name} in title and body unchanged`, async ({ authedApi, createArticle }) => {
      const created = await createArticle({ body: value, title: `${value.slice(0, 50)} ${uniqueId()}` });

      const res = await authedApi.articles.get(created.slug);

      const { article } = await parseBody(res, ArticleResponseSchema);
      expect(article.body).toBe(value);
      expect(article.title).toBe(created.title);
    });
  }
});