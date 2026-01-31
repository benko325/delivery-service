import { Injectable, Logger } from "@nestjs/common";
import { IPaymentGatewayService } from "../../application/common/payment.gateway.service.interface";

@Injectable()
export class PaymentGatewayService implements IPaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);

  async requestPayment(
    orderId: string,
    customerId: string,
    amount: number,
    currency: string,
  ): Promise<{ success: boolean; paymentRequestId: string; error?: string }> {
    this.logger.log(
      `Requesting payment for order ${orderId}: ${amount} ${currency}`,
    );

    const paymentRequestId = `pay_req_${Date.now()}_${orderId}`;

    try {
      // MOCK: Simulate external API call
      await this.simulateExternalApiCall();

      this.logger.log(
        `Payment request successful for order ${orderId}, request ID: ${paymentRequestId}`,
      );

      return {
        success: true,
        paymentRequestId,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Payment request failed for order ${orderId}: ${err.message}`,
        err.stack,
      );

      return {
        success: false,
        paymentRequestId,
        error: err.message,
      };
    }
  }

  /**
   * Simulate external API call delay
   */
  private async simulateExternalApiCall(): Promise<void> {
    return new Promise((resolve) => {
      // Simulate network delay (100-500ms)
      const delay = Math.floor(Math.random() * 400) + 100;
      setTimeout(resolve, delay);
    });
  }
}
