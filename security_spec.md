# Security Specification - IY ABD Premium

## 1. Data Invariants
- **Products/Banners/Flash Sales**: Must be publicly readable to show in the UI, but strictly write-locked for everyone except verified administrators.
- **Orders**: Customers can create their own orders; only admins can view all orders or update statuses.
- **Config**: Global site settings must be publicly readable for the layout to function correctly, but only admins can modify them.
- **User Profiles**: Users can only see/edit their own profiles; PII must be protected.

## 2. The "Dirty Dozen" Payloads
These payloads represent malicious attempts to bypass security. Our rules must explicitly deny all of these.

1. **Identity Spoofing**: Attempting to update a product name as a regular user.
2. **PII Scraping**: Attempting to list all documents in the `users` collection without being an admin.
3. **State Shortcutting**: Attempting to update an order status from 'pending' to 'delivered' as a customer.
4. **Resource Poisoning**: Sending a 1MB string as a product ID.
5. **Admin Escalation**: Attempting to create a document in the `admins` collection to gain privileges.
6. **Config Hijacking**: Attempting to change the `companyName` in `config/general`.
7. **Phantom Orders**: Attempting to create an order with a different `userId` than the authenticated user.
8. **Shadow Fields**: Adding a `isHidden: false` field to a product to bypass a hidden status logic.
9. **Flash Sale Injection**: Attempting to add a fake product to `flash_sales` as a non-admin.
10. **Coupon Theft**: Attempting to read all `coupons` to find valid codes without making a purchase.
11. **Review Spam**: Attempting to post a review with a fake `userId`.
12. **Activity Log Erasure**: Attempting to delete an `activity_logs` entry to hide malicious actions.

## 3. Test Invariants
- `get(/databases/(default)/documents/products/P1)`: ALLOW (Public)
- `list(/databases/(default)/documents/users)`: DENY (PII Protection)
- `create(/databases/(default)/documents/flash_sales/F1)`: DENY (Non-admin)
- `update(/databases/(default)/documents/config/flash_sale)`: DENY (Non-admin)
