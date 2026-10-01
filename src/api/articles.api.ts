import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { ListArticlesParams, NewArticle } from './types';

export class ArticlesApi {
  constructor(private readonly request: APIRequestContext) {}

  list(params: ListArticlesParams = {}): Promise<APIResponse> {
    return this.request.get('/api/articles', { params: { ...params } });
  }

  get(slug: string): Promise<APIResponse> {
    return this.request.get(`/api/articles/${slug}`);
  }

  create(article: NewArticle): Promise<APIResponse> {
    return this.request.post('/api/articles', { data: { article } });
  }

  update(slug: string, changes: Partial<NewArticle>): Promise<APIResponse> {
    return this.request.put(`/api/articles/${slug}`, { data: { article: changes } });
  }

  delete(slug: string): Promise<APIResponse> {
    return this.request.delete(`/api/articles/${slug}`);
  }

   favorite(slug: string): Promise<APIResponse> {
    return this.request.post(`/api/articles/${slug}/favorite`);
  }

  unfavorite(slug: string): Promise<APIResponse> {
    return this.request.delete(`/api/articles/${slug}/favorite`);
  }
}