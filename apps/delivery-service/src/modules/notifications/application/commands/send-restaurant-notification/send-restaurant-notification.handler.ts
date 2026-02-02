import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";
import { SendRestaurantNotificationCommand } from "./send-restaurant-notification.command";
import { IOrderDataService } from "../../common/order-data.service.interface";

@CommandHandler(SendRestaurantNotificationCommand)
export class SendRestaurantNotificationCommandHandler implements ICommandHandler<SendRestaurantNotificationCommand> {
  constructor(
    @Inject("IOrderDataService")
    private readonly orderDataService: IOrderDataService,
    @InjectPinoLogger(SendRestaurantNotificationCommandHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: SendRestaurantNotificationCommand): Promise<void> {
    this.logger.info(
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

    this.logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    this.logger.info(
      `📧 [NOTIFICATION] Sending to Restaurant ${orderData.restaurantId}`,
    );
    this.logger.info(`   Subject: New Order Received!`);
    this.logger.info(`   Order ID: ${orderData.orderId}`);
    this.logger.info(`   Customer ID: ${orderData.customerId}`);
    this.logger.info(
      `   Total: ${orderData.totalAmount} ${orderData.currency}`,
    );
    this.logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  }

  private simulateDelay(): Promise<void> {
    return new Promise((resolve) => {
      const delay = Math.floor(Math.random() * 400) + 100;
      setTimeout(resolve, delay);
    });
  }
}
