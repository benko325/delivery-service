import { Kysely, sql } from "kysely";

const RESTAURANT_ID = "00000000-0000-0000-0000-000000000001";
const RESTAURANT_NAME = "Pizza Palace";

export async function up(db: Kysely<unknown>): Promise<void> {
  // Get admin user ID to use as owner
  const adminUser = await sql`
        SELECT id FROM auth.users WHERE email = 'admin@delivery.local' LIMIT 1
    `.execute(db);

  const ownerId =
    adminUser.rows.length > 0
      ? (adminUser.rows[0] as { id: string }).id
      : "00000000-0000-0000-0000-000000000000";

  // Check if restaurant already exists
  const existingRestaurant = await sql`
        SELECT id FROM restaurants.restaurants WHERE id = ${RESTAURANT_ID}::uuid
    `.execute(db);

  if (existingRestaurant.rows.length > 0) {
    console.log("Restaurant already seeded, skipping...");
    return;
  }

  // Create restaurant
  await sql`
        INSERT INTO restaurants.restaurants (id, owner_id, name, description, address, phone, email, is_active, opening_hours, created_at, updated_at)
        VALUES (
            ${RESTAURANT_ID}::uuid,
            ${ownerId}::uuid,
            ${RESTAURANT_NAME},
            'The best pizza in town! Fresh ingredients, authentic Italian recipes.',
            ${JSON.stringify({
              street: "123 Main Street",
              city: "Prague",
              postalCode: "11000",
              country: "Czech Republic",
            })}::jsonb,
            '+420123456789',
            'contact@pizzapalace.cz',
            true,
            ${JSON.stringify({
              monday: { open: "10:00", close: "22:00" },
              tuesday: { open: "10:00", close: "22:00" },
              wednesday: { open: "10:00", close: "22:00" },
              thursday: { open: "10:00", close: "22:00" },
              friday: { open: "10:00", close: "23:00" },
              saturday: { open: "11:00", close: "23:00" },
              sunday: { open: "11:00", close: "21:00" },
            })}::jsonb,
            now(),
            now()
        )
    `.execute(db);

  // Create menu items
  const menuItems = [
    {
      name: "Margherita Pizza",
      description: "Classic tomato sauce, fresh mozzarella, basil",
      price: 12.99,
      category: "main_course",
      preparationTime: 20,
    },
    {
      name: "Pepperoni Pizza",
      description: "Tomato sauce, mozzarella, spicy pepperoni",
      price: 14.99,
      category: "main_course",
      preparationTime: 20,
    },
    {
      name: "Quattro Formaggi",
      description:
        "Four cheese pizza: mozzarella, gorgonzola, parmesan, goat cheese",
      price: 16.99,
      category: "main_course",
      preparationTime: 25,
    },
    {
      name: "Bruschetta",
      description: "Toasted bread with tomatoes, garlic, basil, olive oil",
      price: 6.99,
      category: "appetizer",
      preparationTime: 10,
    },
    {
      name: "Caesar Salad",
      description: "Romaine lettuce, croutons, parmesan, Caesar dressing",
      price: 8.99,
      category: "side",
      preparationTime: 10,
    },
    {
      name: "Tiramisu",
      description:
        "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone",
      price: 7.99,
      category: "dessert",
      preparationTime: 5,
    },
    {
      name: "Coca-Cola",
      description: "330ml can",
      price: 2.5,
      category: "beverage",
      preparationTime: 1,
    },
    {
      name: "Sparkling Water",
      description: "500ml bottle",
      price: 2.0,
      category: "beverage",
      preparationTime: 1,
    },
  ];

  for (const item of menuItems) {
    await sql`
            INSERT INTO restaurants.menu_items (id, restaurant_id, name, description, price, currency, category, is_available, preparation_time, created_at, updated_at)
            VALUES (
                gen_random_uuid(),
                ${RESTAURANT_ID}::uuid,
                ${item.name},
                ${item.description},
                ${item.price},
                'USD',
                ${item.category}::restaurants.menu_item_category,
                true,
                ${item.preparationTime},
                now(),
                now()
            )
        `.execute(db);
  }

  console.log(`
    ============================================
    Restaurant seeded:
      Name: ${RESTAURANT_NAME}
      ID: ${RESTAURANT_ID}
      Menu Items: ${menuItems.length} items

    Categories:
      - Appetizers: 1
      - Main courses: 3 (pizzas)
      - Sides: 1
      - Desserts: 1
      - Beverages: 2
    ============================================
    `);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`
        DELETE FROM restaurants.menu_items WHERE restaurant_id = ${RESTAURANT_ID}::uuid
    `.execute(db);

  await sql`
        DELETE FROM restaurants.restaurants WHERE id = ${RESTAURANT_ID}::uuid
    `.execute(db);
}
