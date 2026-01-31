export interface IPaymentGatewayService {
  requestPayment(
    orderId: string,
    customerId: string,
    amount: number,
    currency: string,
  ): Promise<{ success: boolean; paymentRequestId: string; error?: string }>;
}
