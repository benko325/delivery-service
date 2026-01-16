import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetCustomerByIdQuery } from './get-customer-by-id.query';
import { ICustomerRepository } from '../../../core/repositories/customer.repository.interface';
import { Customer } from '../../../core/entities/customer.entity';

@QueryHandler(GetCustomerByIdQuery)
export class GetCustomerByIdQueryHandler implements IQueryHandler<GetCustomerByIdQuery> {
    constructor(
        @Inject('ICustomerRepository')
        private readonly customerRepository: ICustomerRepository,
    ) {}

    async execute(query: GetCustomerByIdQuery): Promise<Customer> {
        const customer = await this.customerRepository.findById(query.id);

        if (!customer) {
            throw new NotFoundException(`Customer with ID ${query.id} not found`);
        }

        return customer;
    }
}
