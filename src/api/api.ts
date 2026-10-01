import type { APIRequestContext } from '@playwright/test';
import { ArticlesApi } from './articles.api';
import { TagsApi } from './tags.api';
import { UsersApi } from './users.api';

export class Api {
  readonly users: UsersApi;
  readonly articles: ArticlesApi;
  readonly tags: TagsApi;

  constructor(request: APIRequestContext) {
    this.users = new UsersApi(request);
    this.articles = new ArticlesApi(request);
    this.tags = new TagsApi(request);
  }
}