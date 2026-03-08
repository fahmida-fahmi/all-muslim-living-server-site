import { Test, TestingModule } from '@nestjs/testing';
import { BiodataService } from './biodata.service';

describe('BiodataService', () => {
  let service: BiodataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BiodataService],
    }).compile();

    service = module.get<BiodataService>(BiodataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
