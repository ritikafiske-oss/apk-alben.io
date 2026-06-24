import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserEntity } from '../infrastructure/persistence/entities/user.entity';
import { UserCompanyEntity } from '../infrastructure/persistence/entities/user-company.entity';
import { BusinessSettingEntity } from '../infrastructure/persistence/entities/business-setting.entity';
import { CompanyEntity } from '../infrastructure/persistence/entities/company.entity';
import { SubscriptionGateway } from '../infrastructure/gateways/subscription.gateway';
import { UserConfigDto } from '../ui/dtos/user-config.dto';
import { ApiResponse } from '@libs/common';
import { UserService } from './user.service';

interface PrivacySettings {
  delete_phone_log?: string;
  save_phone?: string;
  hide_number?: string;
  [key: string]: string | undefined;
}

interface PopupNoteSettings {
  [role: string]: string;
}

interface SubscriptionAddon {
  plan_addon?: {
    slug: string;
  };
}

interface SubscriptionData {
  subscription_addon?: SubscriptionAddon[];
}

interface SubscriptionResponse {
  data?: SubscriptionData;
}

@Injectable()
export class GetUserConfigUseCase {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserCompanyEntity)
    private readonly userCompanyRepository: Repository<UserCompanyEntity>,
    @InjectRepository(BusinessSettingEntity)
    private readonly businessSettingRepository: Repository<BusinessSettingEntity>,
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
    private readonly subscriptionGateway: SubscriptionGateway,
    private readonly userService: UserService,
  ) {}

  async execute(
    userId: number,
    companyId: number,
  ): Promise<ApiResponse<UserConfigDto>> {
    // 1. Validate Company & User Association
    const userCompany = await this.userService.validateUserCompany(
      userId,
      companyId,
    );

    // 2. Fetch Privacy Settings
    const privacySetting = await this.businessSettingRepository.findOne({
      where: { key: 'privacy', companyId },
    });
    const privacy = (
      privacySetting ? JSON.parse(privacySetting.value) : {}
    ) as PrivacySettings;

    // 3. Mask Number Logic
    let maskNumber = 0;
    if (
      ['telecaller'].includes(userCompany.role) &&
      privacy['hide_number'] === 'true'
    ) {
      maskNumber = 1;
    }

    // 4. Check Owner
    const isOwner = await this.companyRepository.exist({
      where: { id: companyId, ownerId: userId },
    });

    // 5. Fetch all necessary business settings
    const keys = [
      'popup_note_mandatory',
      'call_attempts',
      'wait_call_seconds',
      'allow_phone_logs',
      'show_recording_for_all_users',
      'personal',
      'client',
      'vendor',
      'colleague',
    ];

    const settings = await this.businessSettingRepository.find({
      where: { companyId, key: In(keys) },
    });

    const settingsMap = new Map<string, string>();
    settings.forEach((s) => settingsMap.set(s.key, s.value));

    // 6. Check Subscription for Contact Handler
    const ownerId = userCompany.companyOwnerId;
    let isPaidContactHandler = 0;

    if (ownerId) {
      const currentSubscription =
        (await this.subscriptionGateway.getCurrentSubscription(
          ownerId,
        )) as SubscriptionResponse;

      if (currentSubscription && currentSubscription.data) {
        const subscriptionData = currentSubscription.data;
        if (
          subscriptionData.subscription_addon &&
          Array.isArray(subscriptionData.subscription_addon)
        ) {
          for (const addon of subscriptionData.subscription_addon) {
            if (
              addon.plan_addon &&
              addon.plan_addon.slug === 'contact_handler'
            ) {
              isPaidContactHandler = 1;
              break;
            }
          }
        }
      }
    }

    // 7. Popup Note Mandatory Logic
    const popupNoteValue = settingsMap.get('popup_note_mandatory');
    const popupNoteMandatoryData = (
      popupNoteValue ? JSON.parse(popupNoteValue) : {}
    ) as PopupNoteSettings;

    const isPopupNoteMandatoryRaw =
      popupNoteMandatoryData[userCompany.role] ?? 'false';
    const isPopupNoteMandatory = isPopupNoteMandatoryRaw === 'true' ? 1 : 0;

    // 8. Prepare Response
    const data: UserConfigDto = {
      is_paid_contact_handler: isPaidContactHandler,
      privacy: {
        delete_phone_log: privacy['delete_phone_log'] === 'true' ? 1 : 0,
        save_phone: privacy['save_phone'] === 'true' ? 1 : 0,
        hide_number: maskNumber,
      },
      popup_note_mandatory: isPopupNoteMandatory,
      call_attempts: settingsMap.get('call_attempts') ?? null,
      wait_call_seconds: settingsMap.get('wait_call_seconds') ?? null,
      allow_phone_logs: settingsMap.get('allow_phone_logs') === '1' ? 1 : 0,
      role: userCompany.role,
      allow_autodial: ['all_in_one', 'telecaller'].includes(userCompany.role)
        ? 1
        : 0,
      allow_visits: ['all_in_one', 'field_agent'].includes(userCompany.role)
        ? 1
        : 0,
      allow_web_access: userCompany.isManager ? 1 : 0,

      is_manager: userCompany.isManager ? 1 : 0,
      is_active_membership: 1,
      is_show_plan: isOwner ? 1 : 0,
      reminder: {
        reminder_duplication: 1,
        reminder_attempt_limit: 3,
        reminder_snooze_duration: 10,
      },
      live_location_tracking: {
        is_live_tracking: 0,
        tracking_interval: 15,
        min_sync_interval: 420,
        max_sync_interval: 600,
      },
      is_show_recording: settingsMap.get('show_recording_for_all_users')
        ? Number(settingsMap.get('show_recording_for_all_users'))
        : 0,
      permissions: {
        allow_popup_for_client_contact: 1,
        allow_popup_for_vendor_contact: userCompany.allowPopupForVendor ? 1 : 0,
        allow_popup_for_colleagues_contact: userCompany.allowPopupForColleague
          ? 1
          : 0,
      },
      popup_category_names: {
        personal: settingsMap.get('personal') ?? 'Personal',
        client: settingsMap.get('client') ?? 'Client',
        vendor: settingsMap.get('vendor') ?? 'Vendor',
        colleague: settingsMap.get('colleague') ?? 'Colleague',
      },
    };

    return {
      success: true,
      code: 'DATA_FETCHED',
      message: 'Data fetched successfully.',
      data,
    };
  }
}
