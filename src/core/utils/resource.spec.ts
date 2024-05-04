import { Resource, CreateItem, IDENTITY } from './Resource';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';

const mockDynamoDBDocumentClient: jest.Mocked<DynamoDBDocumentClient> = {
  send: jest.fn(), // Mock the send method
} as any;

class TestResource extends Resource<Record<string, any>> {
  constructor(protected readonly client: DynamoDBDocumentClient) {
    super({
      entityTemplate: Object,
      pkPrefix: 'PREFIX',
    });
  }

  async create({
    decorator = IDENTITY,
    dto,
    parentId,
  }: CreateItem): Promise<string | undefined> {
    const pk = parentId || dto.email;
    const sk = dto.email;
    const primaryKey = {
      PK: `MOCK_TEST#${pk}`,
      SK: `MOCK_TEST#${sk}`,
    };
    const item = decorator.call(this, { ...primaryKey, ...dto });

    const command = new PutCommand({
      TableName: this.tableName,
      Item: item,
    });
    await mockDynamoDBDocumentClient.send(command);
    return item;
  }

  async one(pk: string, sk?: string): Promise<Record<string, any> | undefined> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: {
        PK: `MOCK_TEST#${pk}`,
        SK: `MOCK_TEST#${sk}`,
      },
    });

    // Use the mock implementation of DynamoDBDocumentClient
    const { Item } = await mockDynamoDBDocumentClient.send(command);

    if (!Item) {
      return undefined;
    }

    return Item as Record<string, any>;
  }

  async remove() {
    return 'Removed';
  }
}

describe('Resource', () => {
  let resource: TestResource;

  beforeEach(() => {
    const clientMock = {} as DynamoDBDocumentClient;
    resource = new TestResource(clientMock);
  });

  afterEach(() => {
    mockDynamoDBDocumentClient.send.mockReset();
  });

  describe('create', () => {
    it('should create an item', async () => {
      const mockItem = {
        PK: 'MOCK_TEST#test@example.com',
        SK: 'MOCK_TEST#test@example.com',
        name: 'testName',
        email: 'test@example.com',
      };

      // Mock the response of the send method
      mockDynamoDBDocumentClient.send.mockResolvedValueOnce({
        Item: mockItem,
      } as never);

      // Call the create method
      const result = await resource.create({
        dto: {
          name: 'testName',
          email: 'test@example.com',
        },
      });

      // Assert that the send method was called with the correct PutCommand
      expect(mockDynamoDBDocumentClient.send).toHaveBeenCalledTimes(1);
      expect(mockDynamoDBDocumentClient.send).toHaveBeenCalledWith(
        expect.any(PutCommand),
      );

      // Assert that the result matches the expected value
      expect(result).toEqual(mockItem);
    });
  });

  describe('one', () => {
    it('should get an item', async () => {
      const mockItem = { pk: '123', sk: 'Test Item' };
      mockDynamoDBDocumentClient.send.mockResolvedValueOnce({
        Item: mockItem,
      } as never);

      const itemId = '123';
      const result = await resource.one(itemId);

      // Assertions
      expect(result).toEqual(mockItem);
      expect(mockDynamoDBDocumentClient.send).toHaveBeenCalledTimes(1);
      expect(mockDynamoDBDocumentClient.send).toHaveBeenCalledWith(
        expect.any(GetCommand),
      );
    });
  });

  describe('remove', () => {
    it('should remove an item', async () => {
      const result = await resource.remove();
      expect(result).toBe('Removed');
    });
  });
});
