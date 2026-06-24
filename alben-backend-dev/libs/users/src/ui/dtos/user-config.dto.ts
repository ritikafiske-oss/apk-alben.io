import { ApiProperty } from '@nestjs/swagger';

class PrivacyDto {
  @ApiProperty()
  delete_phone_log: number;

  @ApiProperty()
  save_phone: number;

  @ApiProperty()
  hide_number: number;
}

class ReminderDto {
  @ApiProperty()
  reminder_duplication: number;

  @ApiProperty()
  reminder_attempt_limit: number;

  @ApiProperty()
  reminder_snooze_duration: number;
}

class LiveLocationTrackingDto {
  @ApiProperty()
  is_live_tracking: number;

  @ApiProperty()
  tracking_interval: number;

  @ApiProperty()
  min_sync_interval: number;

  @ApiProperty()
  max_sync_interval: number;
}

class PermissionsDto {
  @ApiProperty()
  allow_popup_for_client_contact: number;

  @ApiProperty()
  allow_popup_for_vendor_contact: number;

  @ApiProperty()
  allow_popup_for_colleagues_contact: number;
}

class PopupCategoryNamesDto {
  @ApiProperty()
  personal: string;

  @ApiProperty()
  client: string;

  @ApiProperty()
  vendor: string;

  @ApiProperty()
  colleague: string;
}

export class UserConfigDto {
  @ApiProperty()
  is_paid_contact_handler: number;

  @ApiProperty()
  privacy: PrivacyDto;

  @ApiProperty()
  popup_note_mandatory: number;

  @ApiProperty({ type: String, nullable: true })
  call_attempts: string | null;

  @ApiProperty({ type: String, nullable: true })
  wait_call_seconds: string | null;

  @ApiProperty()
  allow_phone_logs: number;

  @ApiProperty()
  role: string;

  @ApiProperty()
  allow_autodial: number;

  @ApiProperty()
  allow_visits: number;

  @ApiProperty()
  allow_web_access: number;

  @ApiProperty()
  is_manager: number;

  @ApiProperty()
  is_active_membership: number;

  @ApiProperty()
  is_show_plan: number;

  @ApiProperty()
  reminder: ReminderDto;

  @ApiProperty()
  live_location_tracking: LiveLocationTrackingDto;

  @ApiProperty()
  is_show_recording: number;

  @ApiProperty()
  permissions: PermissionsDto;

  @ApiProperty()
  popup_category_names: PopupCategoryNamesDto;
}
