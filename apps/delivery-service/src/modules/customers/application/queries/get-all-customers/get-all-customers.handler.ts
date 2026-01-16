import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAllCustomersQuery } from './get-all-customers.query';
import { ICustomerRepository } from '../../../core/repositories/customer.repository.interface';
import { Customer } from '../../../core/entities/customer.entity';

@QueryHandler(GetAllCustomersQuery)
export class GetAllCustomersQueryHandler implements IQueryHandler<GetAllCustomersQuery> {
    constructor(
        @Inject('ICustomerRepository')
        private readonly customerRepository: ICustomerRepository,
    ) {}

    async execute(_query: GetAllCustomersQuery): Promise<Customer[]> {
        return this.customerRepository.findAll();
    }
}
