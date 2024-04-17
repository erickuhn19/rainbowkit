import { createHttpClient } from './createHttpClient';

const apiKey =
  'LzbasoBiLqltex3VkcQ7LRmL4PtfiiZ1EMJrizrgfonWN6byJReu/l6yrUoo3zLW';

export const enhancedProviderHttp = createHttpClient({
  baseUrl: 'https://enhanced-provider.rainbow.me',
  headers: { 'x-api-key': apiKey },
});
