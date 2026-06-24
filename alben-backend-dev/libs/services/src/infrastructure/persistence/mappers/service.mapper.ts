import { Service } from '../../../domain/entities/service.entity';
import { ServiceEntity } from '../entities/service.entity';

export class ServiceMapper {
  static toDomain(ormEntity: ServiceEntity): Service {
    return new Service(
      ormEntity.id,
      ormEntity.name,
      ormEntity.companyId,
      ormEntity.status === 1,
    );
  }

  static toOrm(domainEntity: Service): ServiceEntity {
    const ormEntity = new ServiceEntity();
    ormEntity.id = domainEntity.id;
    ormEntity.name = domainEntity.name;
    ormEntity.companyId = domainEntity.companyId;
    ormEntity.status = domainEntity.status ? 1 : 0;
    return ormEntity;
  }
}
