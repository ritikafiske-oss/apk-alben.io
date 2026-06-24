import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { DateUtil } from '@libs/common';

@ValidatorConstraint({ name: 'isNotPastDate', async: false })
export class IsNotPastDateConstraint implements ValidatorConstraintInterface {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  validate(value: unknown, _args: ValidationArguments) {
    if (!value || typeof value !== 'string') return true;

    // We assume the format Y-m-d H:i:s as validated by earlier Matches decorator
    try {
      const currentIst = DateUtil.getDateTimeAccordingTimezone(
        new Date(),
        'UTC',
        'Asia/Kolkata',
      );
      const reminderIst = DateUtil.getDateTimeAccordingTimezone(
        value,
        'Asia/Kolkata',
        'Asia/Kolkata',
      );

      return reminderIst >= currentIst;
    } catch {
      return false;
    }
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  defaultMessage(_args: ValidationArguments) {
    return 'The reminder datetime must be greater than the current time.';
  }
}

export function IsNotPastDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    const target = object.constructor;
    registerDecorator({
      target: target,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotPastDateConstraint,
    });
  };
}
