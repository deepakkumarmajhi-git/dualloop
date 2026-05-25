const BASE_URL = "http://localhost:8000";

export async function fetchUserRepositories(token?: string) {
  const url = token
    ? `${BASE_URL}/repositories/sync?token=${token}`
    : `${BASE_URL}/repositories/sync`;

  const response = await fetch(url, {
    credentials: "include"
  });

  return response.json();
}

export async function fetchUserProfile(token?: string) {
  const url = token
    ? `${BASE_URL}/user/me?token=${token}`
    : `${BASE_URL}/user/me`;

  const response = await fetch(url, {
    credentials: "include"
  });

  return response.json();
}

export async function fetchRepositoryCommits(token?: string | null, repoId?: number) {
  const url = token
    ? `${BASE_URL}/repositories/${repoId}/commits?token=${token}`
    : `${BASE_URL}/repositories/${repoId}/commits`;

  const response = await fetch(url, {
    credentials: "include"
  });

  return response.json();
}