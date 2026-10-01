import { test, expect } from '../../src/fixtures/api.fixtures';
import { parseBody } from '../../src/schemas/parse';
import { ArticleListSchema, ArticleResponseSchema, type Article } from '../../src/schemas/conduit.schemas';

test.describe('Articles API — business rules', () => {
  test('favoriting twice counts once', async ({ createArticle, createUser }) => {
    const article = await createArticle();
    const { api: reader } = await createUser();

    await expect(await reader.articles.favorite(article.slug)).toBeOK();
    const res = await reader.articles.favorite(article.slug);

    expect(res.ok()).toBe(true);
    const { article: after } = await parseBody(res, ArticleResponseSchema);
    expect(after.favoritesCount).toBe(1);
    expect(after.favorited).toBe(true);
  });

  test("pages through an author's articles without gaps or duplicates", async ({ createUser, createArticle }) => {
    const { user, api } = await createUser();
    const created: Article[] = [];
    for (let i = 0; i < 3; i++) created.push(await createArticle({}, api));

    const page1 = await parseBody(
      await api.articles.list({ author: user.username, limit: 2, offset: 0 }),
      ArticleListSchema,
    );
    const page2 = await parseBody(
      await api.articles.list({ author: user.username, limit: 2, offset: 2 }),
      ArticleListSchema,
    );

    expect(page1.articles).toHaveLength(2);
    expect(page2.articles).toHaveLength(1);
    expect(page1.articlesCount).toBe(3);
    const seen = [...page1.articles, ...page2.articles].map((a) => a.slug);
    expect(new Set(seen).size).toBe(3);
    expect(seen.sort()).toEqual(created.map((a) => a.slug).sort());
  });
});