import type { Issue } from '@shared/validate';

export class ApiError extends Error {
  constructor(public code: string, message: string, public issues: Issue[] = []) {
    super(message);
  }
}
