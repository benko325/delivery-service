export class RestaurantAddedToFavoritesEvent {
  constructor(
    public readonly customerId: string,
    public readonly restaurantId: string,
    public readonly occurredAt: Date,
  ) {}
}
