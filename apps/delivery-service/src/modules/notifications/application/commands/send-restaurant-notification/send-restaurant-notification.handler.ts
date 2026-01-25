import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, Logger } from "@nestjs/common";
import { SendRestaurantNotificationCommand } from "./send-restaurant-notification.command";
import { IOrderDataService } from "../../common/order-data.service.interface";

@CommandHandler(SendRestaurantNotificationCommand)
export class SendRestaurantNotificationCommandHandler implements ICommandHandler<SendRestaurantNotificationCommand> {
  private readonly logger = new Logger(
    SendRestaurantNotificationCommandHandler.name,
  );

  constructor(
    @Inject("IOrderDataService")
    private readonly orderDataService: IOrderDataService,
  ) {}

  async execute(command: SendRestaurantNotificationCommand): Promise<void> {
    this.logger.log(
      `Processing restaurant notification for order ${command.orderId}`,
    );

    const orderData = await this.orderDataService.getOrderData(command.orderId);

    if (!orderData) {
      this.logger.warn(
        `Order ${command.orderId} not found, skipping notification`,
      );
      return;
    }

    await this.simulateDelay();

    this.logger.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    this.logger.log(
      `📧 [NOTIFICATION] Sending to Restaurant ${orderData.restaurantId}`,
    );
    this.logger.log(`   Subject: New Order Received!`);
    this.logger.log(`   Order ID: ${orderData.orderId}`);
    this.logger.log(`   Customer ID: ${orderData.customerId}`);
    this.logger.log(`   Total: ${orderData.totalAmount} ${orderData.currency}`);
    this.logger.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  }

  private simulateDelay(): Promise<void> {
    return new Promise((resolve) => {
      const delay = Math.floor(Math.random() * 400) + 100;
      setTimeout(resolve, delay);
    });
  }
}
