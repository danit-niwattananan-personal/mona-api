const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface ApiKeyData {
  id: string;
  preview: string;
  createdAt: string;
  name?: string;
}

// Generate new API key
export async function generateApiKey(name?: string): Promise<{ apiKey: string; data: ApiKeyData }> {
  const res = await fetch(`${API_URL}/generate-key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  const data = await res.json();
  return {
    apiKey: data.apiKey,
    data: {
      id: data.id,
      preview: data.preview,
      createdAt: data.createdAt,
      name: data.name,
    },
  };
}

// Call a protected route using your API key
export async function protectedHello(apiKey: string) {
  const res = await fetch(`${API_URL}/hello`, {
    headers: {
      "x-api-key": apiKey,
    },
  });

  if (!res.ok) {
    throw new Error("Invalid API key or request failed.");
  }

  const data = await res.json();
  return data;
}

// List all API keys
export async function listApiKeys(apiKey: string): Promise<ApiKeyData[]> {
  const res = await fetch(`${API_URL}/api-keys`, {
    headers: {
      "x-api-key": apiKey,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to list API keys");
  }

  const data = await res.json();
  return data.keys;
}

// Delete an API key
export async function deleteApiKey(apiKey: string, keyId: string): Promise<void> {
  const res = await fetch(`${API_URL}/api-keys/${keyId}`, {
    method: "DELETE",
    headers: {
      "x-api-key": apiKey,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete API key");
  }
}

// Get team description
export async function getDescription(apiKey: string) {
  const res = await fetch(`${API_URL}/api/v1/description`, {
    headers: {
      "x-api-key": apiKey,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to get description");
  }

  const data = await res.json();
  return data;
}

// Get team information
export async function getTeam(apiKey: string) {
  const res = await fetch(`${API_URL}/api/v1/team`, {
    headers: {
      "x-api-key": apiKey,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to get team");
  }

  const data = await res.json();
  return data;
}

// Get team size
export async function getTeamSize(apiKey: string) {
  const res = await fetch(`${API_URL}/api/v1/teamsize`, {
    headers: {
      "x-api-key": apiKey,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to get team size");
  }

  const data = await res.json();
  return data;
}

// Get team member images
export async function getImages(apiKey: string) {
  const res = await fetch(`${API_URL}/api/v1/images`, {
    headers: {
      "x-api-key": apiKey,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to get images");
  }

  const data = await res.json();
  return data;
}

