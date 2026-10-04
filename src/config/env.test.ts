import { parseEnv } from './env';

describe('parseEnv', () => {
  it('accepts the Phase 0 environment with no custom variables', () => {
    expect(parseEnv({ MODE: 'test', DEV: true, PROD: false })).toEqual({ MODE: 'test', DEV: true, PROD: false });
  });

  it('fails loudly when a required variable is missing', () => {
    expect(() => parseEnv({ DEV: true, PROD: false })).toThrow(/Invalid environment configuration/);
  });

  it('refuses secret-looking variables exposed to the client', () => {
    expect(() => parseEnv({ MODE: 'test', DEV: true, PROD: false, VITE_SERVICE_ROLE_KEY: 'x' })).toThrow(
      /VITE_SERVICE_ROLE_KEY/,
    );
  });
});
