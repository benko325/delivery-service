import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import {
  BadRequestException,
  Inject,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { PayForOrderCommand } from "./pay-for-order.command";
import { IOrderRepository } from "../../../core/repositories/order.repository.interface";
import { PaymentRequestedEvent } from "../../../core/events/payment-requested.event";
import { IPaymentGatewayService } from "../../common/payment.gateway.service.interface";
import { PaymentSucceededEvent } from "../../../core/events/payment-succeeded.event";

@CommandHandler(PayForOrderCommand)
export class PayForOrderCommandHandler implements ICommandHandler<PayForOrderCommand> {
  private readonly logger = new Logger(PayForOrderCommandHandler.name);

  constructor(
    @Inject("IOrderRepository")
    private readonly orderRepository: IOrderRepository,
    @Inject("IPaymentGatewayService")
    private readonly paymentGatewayService: IPaymentGatewayService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: PayForOrderCommand): Promise<{
    success: boolean;
    paymentRequestId?: string;
    error?: string;
  }> {
    this.logger.log(`Processing payment request for order ${command.orderId}`);

    const order = await this.orderRepository.findById(command.orderId);

    if (!order) {
      throw new NotFoundException(`Order with ID ${command.orderId} not found`);
    }

    if (order.customerId !== command.customerId) {
      throw new UnauthorizedException(
        `Order with ID ${command.orderId} does not belong to customer with ID ${command.customerId}`,
      );
    }

    if (order.status !== "pending") {
      throw new BadRequestException(
        `Order with ID ${command.orderId} is in status ${order.status}, cannot request payment`,
      );
    }

    const paymentRequestedEvent = new PaymentRequestedEvent(
      order.id,
      order.customerId,
      order.totalAmount + order.deliveryFee,
      order.currency,
      new Date(),
    );

    this.eventBus.publish(paymentRequestedEvent);

    this.logger.log(
      `Published PaymentRequestedEvent for order ${command.orderId}`,
    );

    const result = await this.paymentGatewayService.requestPayment(
      order.id,
      order.customerId,
      order.totalAmount + order.deliveryFee,
      order.currency,
    );

    if (result.success) {
      this.logger.log(
        `Payment request successful for order ${command.orderId}`,
      );

      const orderPaidForEvent = new PaymentSucceededEvent(
        order.id,
        result.paymentRequestId,
        order.totalAmount + order.deliveryFee,
        order.currency,
        new Date(),
      );

      this.eventBus.publish(orderPaidForEvent);

      this.logger.log(
        `Published PaymentSucceededEvent for order ${command.orderId}`,
      );
    } else {
      this.logger.error(
        `Payment request failed for order ${command.orderId}: ${result.error}`,
      );
    }

    return result;
  }
}
