import { Build } from './compatibility';

// TODO: Replace this in-memory store with a proper database (Postgres/Supabase/MongoDB)
// For production:
// 1. Create a 'builds' table with columns: id, name, parts (jsonb), currency, created_at
// 2. Replace createBuild with INSERT query
// 3. Replace getBuild with SELECT query
// 4. Add proper error handling and connection pooling

const buildsStore = new Map<string, Build>();

function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export function createBuild(build: Omit<Build, 'id' | 'createdAt'>): Build {
  const id = generateId();
  const createdAt = new Date().toISOString();

  const newBuild: Build = {
    ...build,
    id,
    createdAt,
  };

  buildsStore.set(id, newBuild);

  return newBuild;
}

export function getBuild(id: string): Build | null {
  return buildsStore.get(id) || null;
}

export function getAllBuilds(): Build[] {
  return Array.from(buildsStore.values());
}

export function deleteBuild(id: string): boolean {
  return buildsStore.delete(id);
}
