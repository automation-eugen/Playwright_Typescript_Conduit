export interface NewUser{
    username: string;
    email: string;
    password: string;
}

export interface LoginCredentials{
    email: string;
    password: string;
}

export interface NewArticle{
    title: string;
    description: string;
    body: string;
    tagList?: string[];
}

export interface ListArticlesParams{
    limit?: number;
    offset?: number;
    tag?: string;
    author?: string;
    favorited?: string;
}

export interface AuthorizedUser extends NewUser{
    token: string;
}