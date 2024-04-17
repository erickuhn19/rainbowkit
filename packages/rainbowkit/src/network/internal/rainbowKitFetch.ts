export interface RainbowKitFetchRequestOpts extends RequestInit {
  params?: ConstructorParameters<typeof URLSearchParams>[0]; // type of first argument of URLSearchParams constructor.
  timeout?: number;
}

/**
 * rainbowKitFetch fetches data and handles response edge cases and error handling.
 */
export async function rainbowKitFetch<TData>(
  url: RequestInfo,
  options: RainbowKitFetchRequestOpts,
) {
  const opts = {
    headers: {},
    method: 'GET',
    ...options,
    timeout: options.timeout ?? 10_000,
  };

  if (!url) throw new Error('rainbowKitFetch: Missing url argument');

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), opts.timeout);

  const { body, params, headers, ...otherOpts } = opts;

  const requestBody =
    body && typeof body === 'object' ? JSON.stringify(opts.body) : opts.body;

  const response = await fetch(`${url}${createParams(params)}`, {
    ...otherOpts,
    body: requestBody,
    headers: {
      Accept: 'application/json',
      ...headers,
    },
    signal: controller.signal,
  });

  clearTimeout(id);

  const responseBody = (await getBody(response)) as TData;

  if (response.ok) {
    const { headers, status } = response;
    return { data: responseBody, headers, status };
  }

  const errorResponseBody =
    typeof responseBody === 'string' ? { error: responseBody } : responseBody;

  const error = generateError({
    requestBody: body,
    response,
    responseBody: errorResponseBody,
  });

  throw error;
}

function getBody(response: Response) {
  const contentType = response.headers.get('Content-Type');
  if (contentType?.startsWith('application/json')) {
    return response.json();
  }
  return response.text();
}

function createParams(params: RainbowKitFetchRequestOpts['params']) {
  return params && Object.keys(params).length
    ? `?${new URLSearchParams(params)}`
    : '';
}

interface RainbowFetchError extends Error {
  response?: Response;
  responseBody?: any;
  requestBody?: RequestInit['body'];
}

function generateError({
  requestBody,
  response,
  responseBody,
}: {
  requestBody: RequestInit['body'];
  response: Response;
  responseBody: any;
}) {
  const message =
    responseBody?.error ||
    response?.statusText ||
    'There was an error with the request.';

  const error: RainbowFetchError = new Error(message);

  error.response = response;
  error.responseBody = responseBody;
  error.requestBody = requestBody;

  return error;
}

interface RainbowFetchClientOpts extends RainbowKitFetchRequestOpts {
  baseUrl?: string;
}

export class RainbowKitFetchClient {
  baseUrl: string;
  opts: RainbowKitFetchRequestOpts;

  constructor(opts: RainbowFetchClientOpts = {}) {
    const { baseUrl = '', ...otherOpts } = opts;
    this.baseUrl = baseUrl;
    this.opts = otherOpts;
  }

  get<TData>(url?: RequestInfo, opts?: RainbowKitFetchRequestOpts) {
    return rainbowKitFetch<TData>(`${this.baseUrl}${url}`, {
      ...this.opts,
      ...(opts || {}),
      method: 'GET',
    });
  }

  post<TData>(
    url?: RequestInfo,
    body?: any,
    opts?: RainbowKitFetchRequestOpts,
  ) {
    return rainbowKitFetch<TData>(`${this.baseUrl}${url}`, {
      ...this.opts,
      ...(opts || {}),
      body,
      method: 'POST',
    });
  }
}
