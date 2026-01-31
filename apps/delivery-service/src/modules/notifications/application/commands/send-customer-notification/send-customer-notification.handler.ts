import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, Logger } from "@nestjs/common";
import { SendCustomerNotificationCommand } from "./send-customer-notification.command";
import { IOrderDataService } from "../../common/order-data.service.interface";
import { OrderStatusMapped } from "../../../infrastructure/anti-corruption-layer/order-status-changed.mapper";

@CommandHandler(SendCustomerNotificationCommand)
export class SendCustomerNotificationCommandHandler
  implements ICommandHandler<SendCustomerNotificationCommand>
{
  private readonly logger = new Logger(
    SendCustomerNotificationCommandHandler.name,
  );

  private readonly messages: Record<OrderStatusMapped, string> = {
    pending: "Your order has been received and is pending confirmation.",
    payment_succeeded: "Payment successful! Your order is being processed.",
    confirmed: "Your order has been confirmed by the restaurant.",
    preparing: "Your order is being prepared.",
    ready_for_pickup: "Your order is ready for pickup!",
    in_transit: "Your order is on its way to you.",
    delivered: "Your order has been delivered. Enjoy!",
    cancelled: "Your order has been cancelled.",
  };

  constructor(
    @Inject("IOrderDataService")
    private readonly orderDataService: IOrderDataService,
  ) {}

  async execute(command: SendCustomerNotificationCommand): Promise<void> {
    const orderData = await this.orderDataService.getOrderData(command.orderId);

    if (!orderData) {
      this.logger.warn(
        `Order ${command.orderId} not found, skipping notification`,
      );
      return;
    }

    await this.simulateDelay();

    const statusMessage = this.getStatusMessage(command.newStatus);

    this.logger.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    this.logger.log(
      `📱 [NOTIFICATION] Sending to Customer ${orderData.customerId}`,
    );
    this.logger.log(`   Subject: Order Status Update`);
    this.logger.log(`   Order ID: ${orderData.orderId}`);
    this.logger.log(
      `   Status: ${command.previousStatus} → ${command.newStatus}`,
    );
    this.logger.log(`   Message: ${statusMessage}`);
    this.logger.log(`   Total: ${orderData.totalAmount} ${orderData.currency}`);
    this.logger.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  }

  private getStatusMessage(status: OrderStatusMapped): string {
    return (
      this.messages[status] ??
      `Your order status has been updated to: ${status}`
    );
  }

  private simulateDelay(): Promise<void> {
    return new Promise((resolve) => {
      const delay = Math.floor(Math.random() * 400) + 100;
      setTimeout(resolve, delay);
    });
  }
}
