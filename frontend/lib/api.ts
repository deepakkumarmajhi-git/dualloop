const BASE_URL = "http://localhost:8000";

export async function fetchUserRepositories(token: string) {
  const response = await fetch(
    `${BASE_URL}/repositories/sync?token=${token}`
  );

  return response.json();
}

export async function fetchUserProfile(token: string) {
  const response = await fetch(
    `${BASE_URL}/user/me?token=${token}`
  );

  return response.json();
}

export async function fetchRepositoryCommits(token: string, repoId: number) {
  const response = await fetch(
    `${BASE_URL}/repositories/${repoId}/commits?token=${token}`
  );

  return response.json();
}