import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { GetOrdersByRestaurantQuery } from "./get-orders-by-restaurant.query";
import { IOrderRepository } from "../../../core/repositories/order.repository.interface";
import { Order } from "../../../core/entities/order.entity";

/**
 * @brief Query handler to get all orders for a specific restaurant
 */
@QueryHandler(GetOrdersByRestaurantQuery)
export class GetOrdersByRestaurantQueryHandler implements IQueryHandler<GetOrdersByRestaurantQuery> {
  constructor(
    @Inject("IOrderRepository")
    private readonly orderRepository: IOrderRepository,
  ) {}

  /**
   * @brief Execute the query
   * @param query Query with restaurant ID
   * @return List of orders for the restaurant
   */
  async execute(query: GetOrdersByRestaurantQuery): Promise<Order[]> {
    return this.orderRepository.findByRestaurantId(query.restaurantId);
  }
}
