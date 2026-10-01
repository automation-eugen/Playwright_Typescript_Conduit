import { faker } from '@faker-js/faker';
import type { NewArticle } from '../api/types';
import { uniqueId } from './unique';

export function buildArticle(overrides: Partial<NewArticle> = {}): NewArticle {
  const title = faker.lorem.sentence({ min: 3, max: 6 }).replace(/\.$/, '');
  return {
    title: `${title} ${uniqueId()}`,
    description: faker.lorem.sentence(),
    body: faker.lorem.paragraphs(2),
    tagList: faker.helpers.uniqueArray(() => faker.word.noun(), 3),
    ...overrides,
  };
}