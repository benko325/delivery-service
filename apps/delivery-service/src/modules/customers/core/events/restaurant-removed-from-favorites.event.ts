export class RestaurantRemovedFromFavoritesEvent {
  public readonly id: string;
  public readonly restaurantId: string;
  public readonly updatedAt: Date;

  constructor(params: {
    id: string;
    restaurantId: string;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.restaurantId = params.restaurantId;
    this.updatedAt = params.updatedAt;
  }
}
