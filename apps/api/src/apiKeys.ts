import crypto from "crypto";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export interface ApiKeyMetadata {
  id: string;
  hash: string;
  preview: string; // Last 4 characters for identification
  createdAt: Date;
  name?: string;
}

// In-memory store for hashed keys with metadata
const apiKeys: ApiKeyMetadata[] = [];

// Create a new API key and store *ONLY the hash*
export function createApiKey(name?: string) {
  const key = crypto.randomUUID();
  const hash = bcrypt.hashSync(key, SALT_ROUNDS);
  const preview = key.slice(-4);

  const metadata: ApiKeyMetadata = {
    id: crypto.randomUUID(),
    hash,
    preview,
    createdAt: new Date(),
    name,
  };

  apiKeys.push(metadata);
  return { key, metadata }; // send plaintext ONCE
}

export function isValidApiKey(apiKey: string | undefined) {
  if (!apiKey) return false;

  // Compare against every stored hash
  return apiKeys.some((keyData) => bcrypt.compareSync(apiKey, keyData.hash));
}

export function listApiKeys(): Omit<ApiKeyMetadata, "hash">[] {
  return apiKeys.map(({ id, preview, createdAt, name }) => ({
    id,
    preview,
    createdAt,
    name,
  }));
}

export function deleteApiKey(id: string): boolean {
  const index = apiKeys.findIndex((key) => key.id === id);
  if (index === -1) return false;

  apiKeys.splice(index, 1);
  return true;
}


