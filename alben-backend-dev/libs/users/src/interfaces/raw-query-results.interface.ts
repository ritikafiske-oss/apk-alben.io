/**
 * Raw Persistence Layer Interfaces
 *
 * These interfaces represent the shapes of raw database query results
 * to ensure type safety in repositories without using 'any'.
 */

export interface RawProductContactStatus {
  id: string | number;
  name: string;
  color_code: string | null;
}

export interface RawSurpriseVisit {
  question_id: string | number;
  question: string;
  company_id: string | number;
}
