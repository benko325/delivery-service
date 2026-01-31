import { ICommand } from "@nestjs/cqrs";

export class SendRestaurantNotificationCommand implements ICommand {
  constructor(public readonly orderId: string) {}
}
