export * from './src/application/visits.service';
export * from './src/ui/visits.controller';
export * from './src/domain/entities/visit-type.entity';
export * from './src/domain/entities/visit-log.entity';
export * from './src/domain/entities/surprise-visit.entity';
export * from './src/domain/entities/location-change-request.entity';
export * from './src/infrastructure/persistence/entities/visit-type.entity';
export * from './src/infrastructure/persistence/entities/visit-log.entity';
export * from './src/infrastructure/persistence/entities/surprise-visit.entity';
export * from './src/infrastructure/persistence/entities/location-change-request.entity';
export * from './src/infrastructure/persistence/entities/visit-log-product-detail.entity';
export * from './src/domain/ports/visit.repository.port';

// Module export moved to bottom to ensure all entities are defined first
export * from './src/visits.module';
