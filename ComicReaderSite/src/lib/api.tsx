export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api${path}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...(opts.headers || {}),
      },
      cache: 'no-store',
    });
  
    if (!res.ok) {
      throw new Error(await res.text());
    }
  
    return res.json();
  }
  