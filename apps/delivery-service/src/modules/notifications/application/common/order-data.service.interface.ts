import { OrderData } from "../../core/types/order.data.type";

export interface IOrderDataService {
  getOrderData(orderId: string): Promise<OrderData | null>;
}
