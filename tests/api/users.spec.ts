import { test, expect } from '../../src/fixtures/api.fixtures';
import { buildUser } from '../../src/data/users';
import { parseBody } from '../../src/schemas/parse';
import { ErrorSchema, UserResponseSchema } from '../../src/schemas/conduit.schemas';

test.describe('Users API', () => {
  test('registers a new user and returns a token', { tag: '@smoke' }, async ({ api }) => {
    const newUser = buildUser();

    const res = await api.users.register(newUser);

    expect(res.status()).toBe(201); // pin after verifying against the spec
    const body = await parseBody(res, UserResponseSchema);
    expect(body.user).toMatchObject({ username: newUser.username, email: newUser.email });
    expect(body.user).not.toHaveProperty('password');
  });

  test('logs in a registered user', { tag: '@smoke' }, async ({ api }) => {
    const newUser = buildUser();
    await expect(await api.users.register(newUser)).toBeOK();

    const res = await api.users.login({ email: newUser.email, password: newUser.password });

    expect(res.status()).toBe(200);
    const { user } = await parseBody(res, UserResponseSchema);
    expect(user.email).toBe(newUser.email);
  });

  test('returns the current user for a valid token', async ({ authedApi, workerUser }) => {
    const res = await authedApi.users.current();

    expect(res.status()).toBe(200);
    const { user } = await parseBody(res, UserResponseSchema);
    expect(user.username).toBe(workerUser.username);
  });

  test('rejects an invalid token', async ({ api }) => {
    const res = await api.users.current('invalid-token');

    expect(res.status()).toBe(401);
  });

  test('rejects login with a wrong password', async ({ api }) => {
    const newUser = buildUser();
    await expect(await api.users.register(newUser)).toBeOK();

    const res = await api.users.login({ email: newUser.email, password: 'wrong-password' });

    expect(res.status()).toBe(401); // pin after verifying
  });

  test('rejects a duplicate username', async ({ api }) => {
    const first = buildUser();
    await expect(await api.users.register(first)).toBeOK();

    const res = await api.users.register(buildUser({ username: first.username }));

    expect(res.status()).toBe(422); // pin after verifying
    const { errors } = await parseBody(res, ErrorSchema);
    expect(Object.keys(errors)).toContain('username');
  });
});

test.describe('Users API — registration validation', () => {
  const cases = [
    { name: 'missing username', overrides: { username: '' }, field: 'username' },
    { name: 'missing email', overrides: { email: '' }, field: 'email' },
    { name: 'invalid email', overrides: { email: 'not-an-email' }, field: 'email' },
    { name: 'missing password', overrides: { password: '' }, field: 'password' },
  ];

  for (const { name, overrides, field } of cases) {
    test(`rejects registration with ${name}`, async ({ api }) => {
      const res = await api.users.register(buildUser(overrides));

      expect(res.status()).toBe(422); // pin after verifying
      const { errors } = await parseBody(res, ErrorSchema);
      expect(Object.keys(errors)).toContain(field);
    });
  }
});