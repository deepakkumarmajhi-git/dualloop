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


export async function fetchDeveloperDNA(token: string) {
  const response = await fetch(
    `${BASE_URL}/copilot/dna?token=${token}`
  );
  return response.json();
}


export async function updateTargetRole(token: string, targetRole: string) {
  const response = await fetch(
    `${BASE_URL}/copilot/goal?token=${token}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ target_role: targetRole })
    }
  );
  return response.json();
}


export async function fetchAIMentorship(token: string) {
  const response = await fetch(
    `${BASE_URL}/copilot/mentorship?token=${token}`
  );
  return response.json();
}