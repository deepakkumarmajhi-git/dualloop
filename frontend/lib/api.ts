const BASE_URL = "http://localhost:8000";

export async function fetchUserRepositories(token: string) {
  const response = await fetch(
    `${BASE_URL}/repositories/sync?token=${token}`
  );

  return response.json();
}


export async function fetchLanguageAnalytics(token: string) {
  const response = await fetch(
    `${BASE_URL}/analytics/languages?token=${token}`
  );

  return response.json();
}