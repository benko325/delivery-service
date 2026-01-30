export class RestaurantRemovedFromFavoritesEvent {
  constructor(
    public readonly customerId: string,
    public readonly restaurantId: string,
    public readonly occurredAt: Date,
  ) {}
}
