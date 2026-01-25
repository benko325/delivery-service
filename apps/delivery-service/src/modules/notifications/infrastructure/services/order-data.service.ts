import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetOrderByIdQuery } from "../../../orders/application/queries/get-order-by-id/get-order-by-id.query";
import { Order } from "../../../orders/core/entities/order.entity";
import { IOrderDataService } from "../../application/common/order-data.service.interface";
import { OrderData } from "../../core/types/order.data.type";

@Injectable()
export class OrderDataService implements IOrderDataService {
  private readonly logger = new Logger(OrderDataService.name);

  constructor(private readonly queryBus: QueryBus) {}

  async getOrderData(orderId: string): Promise<OrderData | null> {
    try {
      const order: Order = await this.queryBus.execute(
        new GetOrderByIdQuery(orderId),
      );

      return {
        orderId: order.id,
        restaurantId: order.restaurantId,
        customerId: order.customerId,
        totalAmount: order.totalAmount,
        currency: order.currency,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(`Order ${orderId} not found`);
        return null;
      }
      this.logger.error(`Failed to fetch order data for ${orderId}:`, error);
      throw error;
    }
  }
}
