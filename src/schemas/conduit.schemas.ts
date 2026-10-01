import { z } from 'zod';

export const ProfileSchema = z.object({
  username: z.string().min(1),
  bio: z.string().nullable(),
  image: z.string().nullable(),
  following: z.boolean(),
});

export const UserSchema = z.object({
  email: z.email(),
  token: z.string().min(1),
  username: z.string().min(1),
  bio: z.string().nullable(),
  image: z.string().nullable(),
});

export const ArticleSchema = z.object({
  slug: z.string().min(1),
  title: z.string(),
  description: z.string(),
  body: z.string(),
  tagList: z.array(z.string()),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
  favorited: z.boolean(),
  favoritesCount: z.number().int().nonnegative(),
  author: ProfileSchema,
});

export const UserResponseSchema = z.object({ user: UserSchema });
export const ArticleResponseSchema = z.object({ article: ArticleSchema });

export const ArticleListSchema = z.object({
  articles: z.array(ArticleSchema.omit({ body: true })),
  articlesCount: z.number().int().nonnegative(),
});

export const TagsSchema = z.object({ tags: z.array(z.string()) });

export const ErrorSchema = z.object({
  errors: z.record(z.string(), z.array(z.string())),
});

export type User = z.infer<typeof UserSchema>;
export type Article = z.infer<typeof ArticleSchema>;