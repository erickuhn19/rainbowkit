import {
  RainbowKitFetchClient,
  RainbowKitFetchRequestOpts,
} from './rainbowKitFetch';

export function createHttpClient({
  baseUrl,
  headers,
  params,
  timeout,
}: {
  baseUrl: string;
} & RainbowKitFetchRequestOpts) {
  return new RainbowKitFetchClient({ baseUrl, headers, params, timeout });
}
