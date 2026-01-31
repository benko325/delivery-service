import { QueryHandler, IQueryHandler, QueryBus } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { GetFavoriteRestaurantsQuery } from "./get-favorite-restaurants.query";
import { ICustomerRepository } from "../../../core/repositories/customer.repository.interface";
import { GetRestaurantByIdQuery } from "../../../../restaurants/application/queries/get-restaurant-by-id/get-restaurant-by-id.query";

@QueryHandler(GetFavoriteRestaurantsQuery)
export class GetFavoriteRestaurantsQueryHandler implements IQueryHandler<GetFavoriteRestaurantsQuery> {
  constructor(
    @Inject("ICustomerRepository")
    private readonly customerRepository: ICustomerRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(query: GetFavoriteRestaurantsQuery): Promise<unknown[]> {
    const customer = await this.customerRepository.findById(query.customerId);

    if (!customer) {
      throw new NotFoundException(
        `Customer with ID ${query.customerId} not found`,
      );
    }

    if (
      !customer.favoriteRestaurantIds ||
      customer.favoriteRestaurantIds.length === 0
    ) {
      return [];
    }

    const restaurants = await Promise.all(
      customer.favoriteRestaurantIds.map((id) =>
        this.queryBus.execute(new GetRestaurantByIdQuery(id)),
      ),
    );

    // Filter out nulls in case a restaurant was deleted
    return restaurants.filter((r) => r !== null && r !== undefined);
  }
}
