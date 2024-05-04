import {
  Resource,
  CreateItem,
  IDENTITY,
  projectionGenerator,
} from './Resource';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

describe('projectionGenerator', () => {
  it('should generate the correct projection expression and names', () => {
    class MockTemplate {
      key1: string;
      key2: string;

      constructor(key1: string = '', key2: string = '') {
        this.key1 = key1;
        this.key2 = key2;
      }
    }

    const result = projectionGenerator(MockTemplate);

    const expectedProjectionExpression = '#key1, #key2';

    const expectedProjectionNames = {
      '#key1': 'key1',
      '#key2': 'key2',
    };

    expect(result.projectionExpression).toEqual(expectedProjectionExpression);
    expect(result.projectionNames).toEqual(expectedProjectionNames);
  });
});

const mockDynamoDBDocumentClient: jest.Mocked<DynamoDBDocumentClient> = {
  send: jest.fn(),
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

    const { Item } = await mockDynamoDBDocumentClient.send(command);

    if (!Item) {
      return undefined;
    }

    return Item as Record<string, any>;
  }

  async remove(pk: string, sk?: string): Promise<any> {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: {
        PK: `MOCK_TEST#${pk}`,
        SK: `MOCK_TEST#${sk}`,
      },
    });
    const result = await mockDynamoDBDocumentClient.send(command);
    return result;
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

      mockDynamoDBDocumentClient.send.mockResolvedValueOnce({
        Item: mockItem,
      } as never);

      const result = await resource.create({
        dto: {
          name: 'testName',
          email: 'test@example.com',
        },
      });

      expect(mockDynamoDBDocumentClient.send).toHaveBeenCalledTimes(1);
      expect(mockDynamoDBDocumentClient.send).toHaveBeenCalledWith(
        expect.any(PutCommand),
      );

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

      expect(result).toEqual(mockItem);
      expect(mockDynamoDBDocumentClient.send).toHaveBeenCalledTimes(1);
      expect(mockDynamoDBDocumentClient.send).toHaveBeenCalledWith(
        expect.any(GetCommand),
      );
    });

    it('returns undefined when the item is not found', async () => {
      mockDynamoDBDocumentClient.send.mockResolvedValueOnce({
        Item: undefined,
      } as never);

      const result = await resource.one('1');

      expect(mockDynamoDBDocumentClient.send).toHaveBeenCalledTimes(1);
      expect(mockDynamoDBDocumentClient.send).toHaveBeenCalledWith(
        expect.any(GetCommand),
      );

      expect(result).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should remove an item', async () => {
      mockDynamoDBDocumentClient.send.mockResolvedValueOnce({} as never);

      const result = await resource.remove('1');

      expect(mockDynamoDBDocumentClient.send).toHaveBeenCalledTimes(1);
      expect(mockDynamoDBDocumentClient.send).toHaveBeenCalledWith(
        expect.any(DeleteCommand),
      );

      // Assert that the result matches the expected value
      expect(result).toEqual({});
    });
  });
});
