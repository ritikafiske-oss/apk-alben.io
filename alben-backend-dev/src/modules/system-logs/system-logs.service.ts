import { Injectable } from '@nestjs/common';
import { DynamicLoggerService } from '@libs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SystemLogsService {
  private readonly logsDirectory = path.join(process.cwd(), 'logs');

  constructor(private readonly logger: DynamicLoggerService) {}

  getAvailableCategories(): string[] {
    if (!fs.existsSync(this.logsDirectory)) {
      return [];
    }

    try {
      const files = fs.readdirSync(this.logsDirectory);
      const categories = new Set<string>();

      files.forEach((file) => {
        if (file.endsWith('.log')) {
          // Return the full filename without extension to show daily logs
          const category = file.replace('.log', '');
          categories.add(category);
        }
      });

      // Sort categories descending to show newest logs first
      return Array.from(categories).sort((a, b) => b.localeCompare(a));
    } catch (error) {
      this.logger.error(
        'Error reading logs directory',
        (error as Error).stack,
        'exceptions',
      );
      return [];
    }
  }

  getLogsForCategory(category: string): Record<string, unknown>[] {
    if (!category || !fs.existsSync(this.logsDirectory)) {
      return [];
    }

    try {
      const filePath = path.join(this.logsDirectory, `${category}.log`);
      let categoryFiles: string[] = [];

      if (fs.existsSync(filePath)) {
        categoryFiles = [`${category}.log`];
      } else {
        // Fallback: If the category is a prefix (e.g., monthly grouping), find all matching files
        const files = fs.readdirSync(this.logsDirectory);
        categoryFiles = files.filter(
          (file) => file.startsWith(`${category}-`) && file.endsWith('.log'),
        );
      }

      const allLogs: Record<string, unknown>[] = [];

      for (const file of categoryFiles) {
        const filePath = path.join(this.logsDirectory, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        const lines = fileContent
          .split('\n')
          .filter((line) => line.trim().length > 0);

        for (const line of lines) {
          try {
            allLogs.push(JSON.parse(line) as Record<string, unknown>);
          } catch {
            // Ignore parse errors for individual lines
          }
        }
      }

      // Sort logs by timestamp descending (newest first)
      return allLogs.sort((a, b) => {
        const dateA = new Date((a.timestamp as string | number) || 0).getTime();
        const dateB = new Date((b.timestamp as string | number) || 0).getTime();
        return dateB - dateA;
      });
    } catch (error) {
      this.logger.error(
        `Error reading logs for category ${category}`,
        (error as Error).stack,
        'exceptions',
      );
      return [];
    }
  }

  deleteLog(category: string): void {
    const filePath = path.join(this.logsDirectory, `${category}.log`);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        this.logger.error(
          `Error deleting log file: ${category}`,
          (error as Error).stack,
          'exceptions',
        );
      }
    }
  }

  resetLog(category: string): void {
    const filePath = path.join(this.logsDirectory, `${category}.log`);
    if (fs.existsSync(filePath)) {
      try {
        fs.writeFileSync(filePath, '', 'utf-8');
      } catch (error) {
        this.logger.error(
          `Error resetting log file: ${category}`,
          (error as Error).stack,
          'exceptions',
        );
      }
    }
  }

  getLogFilePath(category: string): string | null {
    const filePath = path.join(this.logsDirectory, `${category}.log`);
    return fs.existsSync(filePath) ? filePath : null;
  }
}
