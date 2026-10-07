// Client-side fetch for our own API routes: on 401 it refreshes the session once
// and retries, and sends the user back to the login page if that fails.

let refreshing: Promise<boolean> | null = null;

function refreshSession() {
  // Share one in-flight refresh between concurrent requests.
  refreshing ??= fetch("/api/auth/refresh", { method: "POST" })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

export async function apiFetch(input: string, init?: RequestInit) {
  const response = await fetch(input, init);
  if (response.status !== 401) return response;

  // Retry even if this refresh lost a race with another tab, since that tab's
  // new cookies may already be in place.
  await refreshSession();
  const retry = await fetch(input, init);
  // Full navigation (not router.push) so no stale client state survives logout.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  if (retry.status === 401) window.location.assign("/");
  return retry;
}
