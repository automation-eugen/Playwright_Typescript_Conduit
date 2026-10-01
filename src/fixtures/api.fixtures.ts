import { test as base, expect, type APIRequestContext } from "@playwright/test";
import { Api } from "../api/api";
import type { AuthorizedUser } from "../api/types";
import { buildUser } from "../data/users";
import { faker } from "@faker-js/faker";
import { buildArticle } from '../data/articles';
import { parseBody } from '../schemas/parse';
import { ArticleResponseSchema, type Article } from '../schemas/conduit.schemas';
import type { NewArticle } from '../api/types';

type WorkerFixtures = {
  workerUser: AuthorizedUser;
};

type TestFixtures = {
  api: Api;
  authedApi: Api;
  createUser: () => Promise<{ user: AuthorizedUser; api: Api }>;
  fakerSeed: number;
  createArticle: (
    overrides?: Partial<NewArticle>,
    as?: Api,
  ) => Promise<Article>;
};

async function registerUser(request: APIRequestContext): Promise<AuthorizedUser> {
  const credentials = buildUser();
  const res = await new Api(request).users.register(credentials);
  await expect(res, "Setup: user registration failed").toBeOK();
  const { user } = await res.json();
  return { ...credentials, token: user.token };
}

function authHeaders(token: string) {
  return { Accept: "application/json", Authorization: `Token ${token}` };
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  workerUser: [
    async ({ playwright }, use, workerInfo) => {
      const request = await playwright.request.newContext({
        baseURL: workerInfo.project.use.baseURL,
      });
      const user = await registerUser(request);
      await request.dispose();
      await use(user);
    },
    { scope: "worker" },
  ],

  api: async ({ request }, use) => {
    await use(new Api(request));
  },

  authedApi: async ({ playwright, baseURL, workerUser }, use) => {
    const request = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: authHeaders(workerUser.token),
    });
    await use(new Api(request));
    await request.dispose();
  },

  createUser: async ({ playwright, baseURL }, use) => {
    const contexts: APIRequestContext[] = [];

    await use(async () => {
      const anonymous = await playwright.request.newContext({ baseURL });
      contexts.push(anonymous);
      const user = await registerUser(anonymous);

      const request = await playwright.request.newContext({
        baseURL,
        extraHTTPHeaders: authHeaders(user.token),
      });
      contexts.push(request);
      return { user, api: new Api(request) };
    });

    await Promise.all(contexts.map((c) => c.dispose()));
  },

  fakerSeed: [
    async ({}, use, testInfo) => {
      const seed =
        Number(process.env.FAKER_SEED) ||
        faker.number.int({ max: 1_000_000_000 });
      faker.seed(seed);
      testInfo.annotations.push({
        type: "faker-seed",
        description: String(seed),
      });
      await use(seed);
    },
    { auto: true },
  ],

  createArticle: async ({ authedApi, createUser }, use, testInfo) => {
    void createUser; // declared so its teardown runs AFTER this fixture's teardown
    const created: { api: Api; slug: string }[] = [];

    await use(async (overrides = {}, as = authedApi) => {
      const res = await as.articles.create(buildArticle(overrides));
      await expect(res, "Setup: article creation failed").toBeOK();
      const { article } = await parseBody(res, ArticleResponseSchema);
      created.push({ api: as, slug: article.slug });
      return article;
    });

    for (const { api, slug } of created.reverse()) {
      const res = await api.articles.delete(slug);
      if (!res.ok() && res.status() !== 404) {
        testInfo.annotations.push({
          type: "cleanup-failed",
          description: `DELETE article ${slug} → ${res.status()}`,
        });
      }
    }
  },
});

export { expect };
