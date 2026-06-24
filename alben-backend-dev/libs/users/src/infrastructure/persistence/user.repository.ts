import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { UserUpdateData } from '../../interfaces/user-update-data.interface';
import { User } from '../../domain/user.entity';
import { Company } from '../../domain/company.entity';
import { UserCompany } from '../../domain/user-company.entity';
import { AppVersion } from '../../domain/app-version.entity';
import { UserEntity } from './entities/user.entity';
import { CompanyEntity } from './entities/company.entity';
import { UserCompanyEntity } from './entities/user-company.entity';
import { AppVersionEntity } from './entities/app-version.entity';
import { UserMapper } from './mappers/user.mapper';
import { CompanyMapper } from './mappers/company.mapper';

import { BusinessSettingEntity } from './entities/business-setting.entity';

@Injectable()
export class UserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(CompanyEntity)
    private readonly companyRepo: Repository<CompanyEntity>,
    @InjectRepository(UserCompanyEntity)
    private readonly userCompanyRepo: Repository<UserCompanyEntity>,
    @InjectRepository(AppVersionEntity)
    private readonly appVersionRepo: Repository<AppVersionEntity>,
    @InjectRepository(BusinessSettingEntity)
    private readonly businessSettingRepo: Repository<BusinessSettingEntity>,
  ) {}

  async findById(id: number): Promise<User | null> {
    const entity = await this.userRepo.findOne({ where: { id } });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByMobile(mobile: string): Promise<User | null> {
    const entity = await this.userRepo.findOne({ where: { mobile } });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findUserCompany(
    userId: number,
    companyId: number,
  ): Promise<UserCompany | null> {
    const entity = await this.userCompanyRepo.findOne({
      where: { userId, companyId },
      relations: ['company'],
    });

    if (!entity) return null;

    return new UserCompany(
      entity.id,
      entity.userId,
      entity.companyId,
      entity.activityStatus,
      entity.status,
      entity.role,
      entity.isManager,
      entity.allowPopupForVendor,
      entity.allowPopupForColleague,
      entity.company?.ownerId ?? null,
      entity.shiftId,
    );
  }

  async findCompaniesByUserId(userId: number): Promise<Company[]> {
    const userCompanies = await this.userCompanyRepo.find({
      where: { userId, status: 'active', role: Not('all_in_one') },
    });

    if (userCompanies.length === 0) return [];

    const companyIds = userCompanies.map((uc) => uc.companyId);

    const companies = await this.companyRepo.findBy({
      id: In(companyIds),
    });

    return companies.map((c) => CompanyMapper.toDomain(c));
  }

  /**
   * Update API Token
   *
   * Stores the JWT token in the database for single device login enforcement.
   * When called, any previous token is overwritten, invalidating old sessions.
   *
   * @param userId - ID of the user to update
   * @param apiToken - JWT token to store, or null to clear the token
   *
   * @security
   * This is critical for single device login. The JwtStrategy validates
   * incoming tokens against this stored value.
   */
  async updateApiToken(userId: number, apiToken: string | null): Promise<void> {
    await this.userRepo.update(userId, { apiToken });
  }

  /**
   * Get User Activity Status
   *
   * Retrieves the activity status (Check In/Check Out) for a user from their
   * active company association. If no active company is found, defaults to 'Check Out'.
   *
   * @param userId - ID of the user
   * @returns Activity status string ('Check In' or 'Check Out')
   *
   * @note
   * - Only considers companies with status='active'
   * - Returns first match ordered by ID (ascending)
   * - Defaults to 'Check Out' if no active company found
   */
  async getUserActivityStatus(userId: number): Promise<string> {
    // Get the active user_company record for this user
    const userCompany = await this.userCompanyRepo.findOne({
      where: {
        userId,
        status: 'active',
      },
      order: { id: 'ASC' },
    });

    return userCompany?.activityStatus || 'Check Out';
  }

  /**
   * Get User Company By User ID
   *
   * Fetches the active company association for a user. This is used during
   * login to verify the user has an active company before allowing access.
   *
   * @param userId - ID of the user
   * @returns UserCompany domain object or null if no active company found
   *
   * @security
   * Users without an active company association cannot log in. This enforces
   * that users must be properly onboarded to a company before accessing the system.
   */
  async getUserCompanyByUserId(userId: number): Promise<UserCompany | null> {
    // Check if user has an active company association
    const userCompanyEntity = await this.userCompanyRepo.findOne({
      where: {
        userId,
        status: 'active',
      },
      relations: ['company'],
    });

    if (!userCompanyEntity) {
      return null;
    }

    // Map entity to domain object
    return new UserCompany(
      userCompanyEntity.id,
      userCompanyEntity.userId,
      userCompanyEntity.companyId,
      userCompanyEntity.activityStatus,
      userCompanyEntity.status,
      userCompanyEntity.role,
      userCompanyEntity.isManager,
      userCompanyEntity.allowPopupForVendor,
      userCompanyEntity.allowPopupForColleague,
      userCompanyEntity.company?.ownerId ?? null,
      userCompanyEntity.shiftId,
    );
  }

  /**
   * Update Last Login Date
   *
   * Records the current timestamp when a user successfully logs in.
   * Used for audit tracking and user activity monitoring.
   *
   * @param userId - ID of the user who logged in
   *
   * @note
   * This is called during the login process after credentials are validated
   * and before the response is sent to the client.
   */
  async updateLastLoginDate(userId: number): Promise<void> {
    await this.userRepo.update(userId, {
      lastLoginDate: new Date(),
    });
  }

  async updateFcmToken(userId: number, fcmToken: string): Promise<void> {
    await this.userRepo.update(userId, {
      fcmToken: fcmToken,
    });
  }

  async updatePassword(
    userId: number,
    password: string,
    isReset: boolean,
  ): Promise<void> {
    await this.userRepo.update(userId, {
      password: password,
      isResetPassword: isReset,
    });
  }

  /**
   * Get Active App Version
   *
   * Fetches the first record from `app_versions` where status = 'active'.
   * Selects only version, description, and is_force fields per spec.
   *
   * @returns AppVersion domain object or null if no active version exists
   */
  async getActiveAppVersion(): Promise<AppVersion | null> {
    const entity = await this.appVersionRepo.findOne({
      where: { status: 'active' },
      select: ['version', 'description', 'isForce'],
    });

    if (!entity) return null;

    return new AppVersion(entity.version, entity.description, entity.isForce);
  }

  async findActiveUserCompanies(userId: number): Promise<UserCompany[]> {
    const userCompanies = await this.userCompanyRepo.find({
      where: { userId, status: 'active' },
      relations: ['company'],
    });

    return userCompanies.map((uc) => CompanyMapper.toDomainUserCompany(uc));
  }

  async getBusinessSetting(
    companyId: number,
    key: string,
  ): Promise<string | null> {
    const setting = await this.businessSettingRepo.findOne({
      where: { companyId, key, status: 'active' },
    });
    return setting?.value || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.userRepo.findOne({ where: { email } });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async updateProfile(userId: number, data: UserUpdateData): Promise<void> {
    await this.userRepo.update(userId, data);
  }
}
