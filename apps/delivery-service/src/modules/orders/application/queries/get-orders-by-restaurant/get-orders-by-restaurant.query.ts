import { IQuery } from "@nestjs/cqrs";

/**
 * Query to get all orders for a specific restaurant
 */
export class GetOrdersByRestaurantQuery implements IQuery {
  constructor(public readonly restaurantId: string) {}
}
