import { Test, TestingModule } from '@nestjs/testing';
import { BiodataController } from './biodata.controller';

describe('BiodataController', () => {
  let controller: BiodataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BiodataController],
    }).compile();

    controller = module.get<BiodataController>(BiodataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
