# Products Module Contract

## 1. Public Interface
The `ProductsModule` exposes the following services (UseCases) and DTOs:

### Standard API Response Format
All API responses must strictly follow the generic structure from `@libs/common`.

### UseCases (Services)
- **`GetProductsUseCase`**: 
    - `execute(userId: number, companyId: number): Promise<any[]>`
    - Retrieves products assigned to a user for a specific company.

- **`GetContactStatusByProductUseCase`**:
    - `execute(userId: number, productId: number, contactId: number, companyId: number): Promise<any>`
    - Retrieves the status of a contact for a specific product.

- **`UpdateProductContactStatusUseCase`**:
    - `execute(userId: number, contactId: number, dto: UpdateProductContactStatusDto): Promise<void>`
    - Updates the status of a contact for a specific product and contact.

### DTOs (Data Transfer Objects)
- **`UpdateProductContactStatusDto`**:
    - `company_id`: number
    - `product_contact_id`: number

## 2. Events & Messages
- **Events Emitted**:
    - None currently.

- **Events Listened**:
    - None currently.

## 3. Dependencies
### Internal Modules
- **`UsersModule`**: Uses `UserRepository` (via port/alias) to validate users.
- **`ContactsModule`**: Uses `ContactRepository` and `ContactStatusEntity` (via port/alias).

### External Libraries
- `typeorm`: For database interactions.
- `class-validator`: For DTO validation.
