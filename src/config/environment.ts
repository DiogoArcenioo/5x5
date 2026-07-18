const PLACEHOLDERS = ['change-me', 'replace_me', 'development-only'];

function required(config: Record<string, unknown>, name: string): string {
  const value = String(config[name] ?? '').trim();
  if (!value) throw new Error(`Variável obrigatória ausente: ${name}`);
  return value;
}

function secureSecret(config: Record<string, unknown>, name: string, minimumLength: number): void {
  const value = required(config, name);
  if (value.length < minimumLength || PLACEHOLDERS.some((placeholder) => value.toLowerCase().includes(placeholder))) {
    throw new Error(`${name} precisa ser um segredo aleatório com pelo menos ${minimumLength} caracteres.`);
  }
}

export function validateEnvironment(config: Record<string, unknown>): Record<string, unknown> {
  const production = config.NODE_ENV === 'production';
  secureSecret(config, 'JWT_SECRET', 64);
  secureSecret(config, 'INTERNAL_API_KEY', 48);

  const origins = required(config, 'API_CORS_ORIGIN').split(',').map((value) => value.trim());
  if (origins.some((origin) => origin === '*' || !/^https?:\/\//.test(origin))) {
    throw new Error('API_CORS_ORIGIN deve conter somente origens HTTP(S) explícitas; curingas não são permitidos.');
  }

  if (production) {
    for (const name of ['FRONTEND_URL', 'GOOGLE_REDIRECT_URI']) {
      const value = String(config[name] ?? '').trim();
      if (value && !value.startsWith('https://')) throw new Error(`${name} deve usar HTTPS em produção.`);
    }
  }

  return config;
}

