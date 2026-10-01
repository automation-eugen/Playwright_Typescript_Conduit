import type { APIRequestContext, APIResponse } from '@playwright/test';


export class TagsApi {
    constructor( private readonly request: APIRequestContext) {}


    list(): Promise<APIResponse> {
        return this.request.get('/api/tags');
    }
}