import { SetMetadata } from '@nestjs/common';

export const SKIP_ACTIVE_COMPANY_GUARD_KEY = 'skipActiveCompanyGuard';
export const SkipActiveCompanyGuard = () =>
  SetMetadata(SKIP_ACTIVE_COMPANY_GUARD_KEY, true);
