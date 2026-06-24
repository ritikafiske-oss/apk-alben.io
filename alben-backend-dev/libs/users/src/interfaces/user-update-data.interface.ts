/**
 * User Update Data Interface
 *
 * Defines the contract for updating user profile fields.
 * Used internally by the UseCase and Repository layers.
 */
export interface UserUpdateData {
  firstname?: string;
  lastname?: string | null;
  email?: string | null;
  mobile?: string | null;
  profileImage?: string | null;
  gender?: string | null;
  language?: string | null;
  skill?: string | null;
}
