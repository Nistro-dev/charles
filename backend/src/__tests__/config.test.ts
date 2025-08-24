import { config } from '@/config';

describe('Configuration', () => {
  it('should load configuration correctly', () => {
    expect(config).toBeDefined();
    expect(config.port).toBeDefined();
    expect(config.nodeEnv).toBeDefined();
    expect(config.database).toBeDefined();
    expect(config.jwtSecret).toBeDefined();
  });

  it('should have correct server configuration', () => {
    expect(config.port).toBeDefined();
    expect(typeof config.port).toBe('number');
    expect(config.nodeEnv).toBeDefined();
    expect(config.logLevel).toBeDefined();
  });

  it('should have correct database configuration', () => {
    expect(config.database.host).toBeDefined();
    expect(config.database.port).toBeDefined();
    expect(config.database.name).toBeDefined();
    expect(config.database.user).toBeDefined();
  });

  it('should have correct auth configuration', () => {
    expect(config.jwtSecret).toBeDefined();
    expect(config.jwtSecret).toBeTruthy();
  });
}); 