import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocalizationRepositoryPort } from '../../../domain/ports/localization.repository.port';
import { LanguageEntity } from '../entities/language.entity';
import { LanguageValueEntity } from '../entities/language-value.entity';
import { Language } from '../../../domain/entities/language.entity';

@Injectable()
export class LocalizationRepository implements LocalizationRepositoryPort {
  constructor(
    @InjectRepository(LanguageEntity)
    private readonly languageRepository: Repository<LanguageEntity>,
    @InjectRepository(LanguageValueEntity)
    private readonly languageValueRepository: Repository<LanguageValueEntity>,
  ) {}

  async findActiveLanguage(code: string): Promise<Language | null> {
    const languageEntity = await this.languageRepository.findOne({
      where: { code, status: 'active' },
    });

    if (!languageEntity) {
      return null;
    }

    // Map Entity to Domain Model
    return new Language(
      languageEntity.id,
      languageEntity.code,
      languageEntity.name,
      languageEntity.nativeName,
      languageEntity.status as 'active' | 'inactive',
      languageEntity.createdAt,
      languageEntity.updatedAt,
    );
  }

  async getLanguageDictionary(
    languageId: number,
  ): Promise<Record<string, string>> {
    const languageValues = await this.languageValueRepository.find({
      where: { languageId },
      relations: ['languageKey'],
    });

    const dictionary: Record<string, string> = {};
    for (const val of languageValues) {
      if (val.languageKey && val.languageKey.keyName) {
        dictionary[val.languageKey.keyName] = val.value;
      }
    }

    return dictionary;
  }
}
