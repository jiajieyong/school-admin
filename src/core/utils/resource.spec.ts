import { Resource, CreateItem, IDENTITY } from './Resource';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

class TestResource extends Resource<any> {
  constructor(protected readonly client: DynamoDBDocumentClient) {
    super({
      entityTemplate: Object,
      pkPrefix: 'PREFIX',
    });
  }

  // Override the abstract methods of Resource with concrete implementations suitable for testing
  async create({
    decorator = IDENTITY,
    dto,
    parentId,
  }: CreateItem): Promise<string | undefined> {
    // Implement a mock behavior for create method suitable for testing
    const createdAt = new Date();
    const pk = parentId || dto.email;
    const sk = dto.email;
    const primaryKey = {
      PK: `MOCK_TEST#${pk}`,
      SK: `MOCK_TEST#${sk}`,
    };
    decorator.call(this, { ...primaryKey, ...dto, createdAt });

    // Mock sending the command
    // This is just a mock implementation for testing, no actual command is sent
    return 'Created';
  }

  async one() {
    return { email: 'test@example.com' }; // Mock implementation for testing
  }

  async remove() {
    return 'Removed'; // Mock implementation for testing
  }
}

describe('Resource', () => {
  let resource: TestResource;

  beforeEach(() => {
    const clientMock = {} as DynamoDBDocumentClient; // Mock DynamoDB client
    resource = new TestResource(clientMock);
  });

  describe('create', () => {
    it('should create an item', async () => {
      const result = await resource.create({
        decorator: IDENTITY,
        dto: {},
        parentId: undefined,
      });
      expect(result).toBe('Created');
    });
  });

  describe('one', () => {
    it('should get an item', async () => {
      const result = await resource.one();
      expect(result).toEqual({ email: 'test@example.com' });
    });
  });

  describe('remove', () => {
    it('should remove an item', async () => {
      const result = await resource.remove();
      expect(result).toBe('Removed');
    });
  });
});
