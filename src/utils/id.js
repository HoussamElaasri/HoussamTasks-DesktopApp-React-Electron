import { nanoid } from 'nanoid';

export function generateId(length = 12) {
  try {
    return nanoid(length);
  } catch {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  }
}
