import { ICommand } from "@nestjs/cqrs";
import { OrderStatusMapped } from "../../../infrastructure/anti-corruption-layer/order-status-changed.mapper";

export class SendCustomerNotificationCommand implements ICommand {
  constructor(
    public readonly orderId: string,
    public readonly previousStatus: OrderStatusMapped,
    public readonly newStatus: OrderStatusMapped,
    public readonly changedAt: Date,
  ) {}
}
