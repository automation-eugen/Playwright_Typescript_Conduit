import { faker } from '@faker-js/faker';
import type { NewUser } from '../api/types';
import { uniqueId } from './unique';

export function buildUser(overrides: Partial<NewUser> = {}): NewUser {
  const id = uniqueId();
  return {
    username: `qa_${id}`,
    email: `qa_${id}@example.com`,
    password: faker.internet.password({ length: 14 }),
    ...overrides,
  };
}