import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAvailableDriversQuery } from './get-available-drivers.query';
import { IDriverRepository } from '../../../core/repositories/driver.repository.interface';
import { Driver } from '../../../core/entities/driver.entity';

@QueryHandler(GetAvailableDriversQuery)
export class GetAvailableDriversQueryHandler implements IQueryHandler<GetAvailableDriversQuery> {
    constructor(
        @Inject('IDriverRepository')
        private readonly driverRepository: IDriverRepository,
    ) {}

    async execute(_query: GetAvailableDriversQuery): Promise<Driver[]> {
        return this.driverRepository.findAvailable();
    }
}
