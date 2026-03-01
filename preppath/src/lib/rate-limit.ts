const windowMs = 60_000;
const maxRequests = 30;

const requests = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = requests.get(identifier);

  if (!entry || now > entry.resetAt) {
    requests.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count };
}

// Periodic cleanup to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    requests.forEach((entry, key) => {
      if (now > entry.resetAt) requests.delete(key);
    });
  }, windowMs);
}
