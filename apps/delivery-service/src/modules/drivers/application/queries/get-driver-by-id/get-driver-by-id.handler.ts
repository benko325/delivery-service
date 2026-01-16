import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetDriverByIdQuery } from './get-driver-by-id.query';
import { IDriverRepository } from '../../../core/repositories/driver.repository.interface';
import { Driver } from '../../../core/entities/driver.entity';

@QueryHandler(GetDriverByIdQuery)
export class GetDriverByIdQueryHandler implements IQueryHandler<GetDriverByIdQuery> {
    constructor(
        @Inject('IDriverRepository')
        private readonly driverRepository: IDriverRepository,
    ) {}

    async execute(query: GetDriverByIdQuery): Promise<Driver> {
        const driver = query.isUserId
            ? await this.driverRepository.findByUserId(query.id)
            : await this.driverRepository.findById(query.id);

        if (!driver) {
            throw new NotFoundException(`Driver not found`);
        }

        return driver;
    }
}
