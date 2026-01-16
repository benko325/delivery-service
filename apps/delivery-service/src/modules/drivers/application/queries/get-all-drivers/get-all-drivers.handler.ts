import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAllDriversQuery } from './get-all-drivers.query';
import { IDriverRepository } from '../../../core/repositories/driver.repository.interface';
import { Driver } from '../../../core/entities/driver.entity';

@QueryHandler(GetAllDriversQuery)
export class GetAllDriversQueryHandler implements IQueryHandler<GetAllDriversQuery> {
    constructor(
        @Inject('IDriverRepository')
        private readonly driverRepository: IDriverRepository,
    ) {}

    async execute(_query: GetAllDriversQuery): Promise<Driver[]> {
        return this.driverRepository.findAll();
    }
}
