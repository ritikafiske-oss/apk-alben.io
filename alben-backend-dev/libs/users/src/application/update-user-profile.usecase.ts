import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepositoryPort,
} from '../domain/ports/user.repository.port';
import { type UserUpdateData } from '../interfaces/user-update-data.interface';
import { type UpdateUserProfileDto } from '../ui/dtos/update-user-profile.dto';
import { type ApiResponse } from '@libs/common';
import { type UserProfileDto } from '../ui/dtos/user-profile.dto';

/**
 * Update User Profile Use Case
 *
 * Implements the business logic for updating a user's profile information.
 * Strictly follows the Laravel specification provided.
 *
 * @rules
 * 1. Fetch current user from database.
 * 2. Validate email uniqueness (must not be taken by another user).
 * 3. Validate mobile uniqueness (must not be taken by another user).
 * 4. Update firstname, lastname (defaults to empty string), email, and mobile.
 * 5. Handle profile image deletion if `isDeleteProfileImg` is 1.
 * 6. Update profile image if `profile_image` is provided.
 * 7. Return standardized success response with updated profile data.
 */
@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  /**
   * Execute the profile update
   *
   * @param userId - ID of the authenticated user
   * @param dto - Data to update
   * @returns Success response with updated profile
   */
  async execute(
    userId: number,
    dto: UpdateUserProfileDto,
  ): Promise<ApiResponse<UserProfileDto>> {
    // Step 1: Fetch current user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // Step 2: Validate email uniqueness
    // Laravel check: 'email' => 'required|email|unique:users,email,' . $userId
    const existingEmail = await this.userRepository.findByEmail(dto.email);
    if (existingEmail && existingEmail.id !== userId) {
      throw new ConflictException('The email has already been taken.');
    }

    // Step 3: Validate mobile uniqueness
    // Laravel check: 'mobile' => 'required|unique:users,mobile,' . $userId
    const existingMobile = await this.userRepository.findByMobile(dto.mobile);
    if (existingMobile && existingMobile.id !== userId) {
      throw new ConflictException('The mobile has already been taken.');
    }

    // Step 4: Map update data
    const updateData: UserUpdateData = {
      firstname: dto.firstname,
      lastname: dto.lastname ?? '', // Spec check: defaults to empty string
      email: dto.email,
      mobile: dto.mobile,
      gender: dto.gender,
    };

    // Step 5: Handle profile image logic
    // if ($request->isDeleteProfileImg == 1) { $user->profile_image = ''; }
    if (dto.isDeleteProfileImg === 1) {
      updateData.profileImage = '';
    } else if (dto.profile_image) {
      // else if($request->profile_image) { $user->profile_image = $request->profile_image; }
      updateData.profileImage = dto.profile_image;
    }

    // Step 6: Persist changes to database
    await this.userRepository.updateProfile(userId, updateData);

    // Step 7: Fetch updated user for response
    const updatedUser = await this.userRepository.findById(userId);
    const activityStatus =
      await this.userRepository.getUserActivityStatus(userId);

    const data: UserProfileDto = {
      id: updatedUser!.id,
      firstname: updatedUser!.firstname,
      lastname: updatedUser!.lastname,
      mobile: updatedUser!.mobile,
      email: updatedUser!.email,
      profile_image: updatedUser!.profileImage,
      gender: updatedUser!.gender,
      language: updatedUser!.language,
      skill: updatedUser!.skill,
      activity_status: activityStatus,
    };

    return {
      success: true,
      code: 'PROFILE_UPDATED',
      message: 'Profile updated successfully.',
      data,
    };
  }
}
