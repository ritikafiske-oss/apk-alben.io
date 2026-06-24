
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../libs/notifications/index';
import { NotificationsService } from '../libs/notifications/src/application/notifications.service';
import { EmailTemplateEntity } from '../libs/notifications/src/infrastructure/persistence/entities/email-template.entity';

/**
 * A standalone module to bootstrap the NotificationsService in a context
 * that mimics the main application (loading env vars, etc.)
 */
@Module({
    imports: [
        // Load .env from the project root
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get<string>('DB_HOST', 'localhost'),
                port: configService.get<number>('DB_PORT', 3306),
                username: configService.get<string>('DB_USERNAME', 'root'),
                password: configService.get<string>('DB_PASSWORD', ''),
                database: configService.get<string>('DB_NAME', 'alben_database'),
                entities: [EmailTemplateEntity],
                synchronize: false,
                logging: false, // Less noise for test script
            }),
            inject: [ConfigService],
        }),
        NotificationsModule,
    ],
    providers: [],
})
class TestNotificationsModule { }

async function testNotifications() {
    const app = await NestFactory.createApplicationContext(TestNotificationsModule);
    const notificationsService = app.get(NotificationsService);

    console.log('--- Starting Notification Tests ---');

    // 1. Test SMS
    const testMobile = '9764233336';
    const configService = app.get(ConfigService);
    const hash = configService.get<string>('SMS_HASH', 'HASH_MISSING');
    const otp = '123456';
    // Skip SMS test to focus on Email for this run? No, keep it.

    // 2. Test Dynamic Email
    const testEmail = 'test412@yopmail.com';
    console.log(`\nTesting sendTemplatedEmail to ${testEmail}...`);

    const templateData = {
        app_name: 'Alben Test',
        first_name: 'Test',
        last_name: 'User',
        otp: '123456',
        resetPasswordUrl: 'http://example.com'
    };

    try {
        const emailTemplateResult = await notificationsService.sendTemplatedEmail(testEmail, 'forgot_password_mobile_user', templateData);
        console.log('Templated Email Result:', emailTemplateResult ? 'Success' : 'Failed (Template might be missing)');
    } catch (error) {
        console.error('Templated Email Error:', error.message);
    }

    // 3. Test Standard Email
    const testSubject = 'Alben Backend Test Email';
    const testHtml = '<p>This is a <b>test email</b> from the standalone script.</p>';

    console.log(`\nTesting sendEmail to ${testEmail}...`);
    const emailResult = await notificationsService.sendEmail(testEmail, testSubject, testHtml);
    console.log('Email Result:', emailResult ? 'Success' : 'Failure');

    console.log('\n--- Tests Completed ---');
    await app.close();
}

testNotifications().catch((err) => {
    console.error('Error running notification tests:', err);
    process.exit(1);
});
