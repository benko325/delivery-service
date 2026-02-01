# Seeded Database Data

After running migrations, the database is populated with the following test data.

## Test User Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@delivery.local | Admin123! |
| Customer | customer@delivery.local | Customer123! |
| Driver | driver@delivery.local | Driver123! |
| Restaurant Owner | owner@delivery.local | Owner123! |

## Test Customer Profile

| Email | Name | Phone |
|-------|------|-------|
| customer@delivery.local | Test Customer | 123456789 |

## Test Driver Profile

| Email | Vehicle Type | License Plate | Status |
|-------|--------------|---------------|--------|
| driver@delivery.local | Car | TEST-123 | offline |

## Test Restaurant

**Pizza Palace** (ID: `00000000-0000-0000-0000-000000000001`)

- **Address**: 123 Main Street, Prague, 11000, Czech Republic
- **Phone**: +420123456789
- **Email**: contact@pizzapalace.cz
- **Hours**: Mon-Thu 10:00-22:00, Fri-Sat 10:00/11:00-23:00, Sun 11:00-21:00

### Menu Items

| Name | Category | Price (EUR) | Prep Time |
|------|----------|-------------|-----------|
| Margherita Pizza | main_course | 12.99 | 20 min |
| Pepperoni Pizza | main_course | 14.99 | 20 min |
| Quattro Formaggi | main_course | 16.99 | 25 min |
| Bruschetta | appetizer | 6.99 | 10 min |
| Caesar Salad | side | 8.99 | 10 min |
| Tiramisu | dessert | 7.99 | 5 min |
| Coca-Cola | beverage | 2.50 | 1 min |
| Sparkling Water | beverage | 2.00 | 1 min |

## Notes

- All passwords follow the pattern: `Role123!`
- Default currency is **EUR**
- The admin user owns the Pizza Palace restaurant
- Change these credentials in production!
