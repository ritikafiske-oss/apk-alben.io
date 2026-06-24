# Visits Module Contract

## 1. Public Interface
The `VisitsModule` exposes the following endpoints via `VisitsController`:

### Endpoints

#### GET `/visits/get-visit-types`
- **Query**: `GetVisitTypesDto` (`company_id`)
- **Response**:
  ```json
  {
      "success": true,
      "message": "Visit type fetched successfully.",
      "data": [
          {
              "id": 1,
              "name": "Meeting",
              "is_next_followup": 1,
              "color_code": "#FF0000"
          }
      ]
  }
  ```

#### GET `/visits/get-visit-logs`
- **Query**: `GetVisitLogsDto` (`company_id`, `product_id`, `page`, `limit`, `visit_type_id?`)
- **Response**:
  ```json
  {
      "success": true,
      "message": "Visit logs fetched successfully.",
      "data": {
          "current_page": 1,
          "total_pages": 5,
          "total_items": 100,
          "records": [...]
      }
  }
  ```

#### GET `/visits/get-visit-log-details`
- **Query**: `GetVisitLogDetailsDto` (`company_id`, `visit_log_id`)
- **Response**:
  ```json
  {
      "success": true,
      "message": "Data fetched successfully.",
      "data": {
          "id": 1,
          "photo": "string",
          "remark": "string",
          "datetime": "string",
          "latitude": "number",
          "longitude": "number",
          "visit_type_id": "number",
          "contact_id": "number",
          "products": [
              {
                  "id": "number",
                  "name": "string",
                  "visit_type": {
                      "id": "number",
                      "name": "string",
                      "color_code": "string"
                  },
                  "latest_note": {
                      "id": "number",
                      "description": "string",
                      "created_at": "string"
                  }
              }
          ]
      }
  }
  ```

#### POST `/visits/save-visit-log`
- **Consumes**: `multipart/form-data`
- **Body**: `CreateVisitLogDto`
  - `data`: JSON string of `{ company_id: number, visits: VisitItemDto[] }`.
  - `VisitItemDto`:
    ```json
    {
        "mobile": "string",
        "created_at": "string (YYYY-MM-DD HH:mm:ss)",
        "latitude": "number",
        "longitude": "number",
        "photo": "string",
        "products": [
            {
                "product_id": "number",
                "remark": "string",
                "reminder_datetime": "string (YYYY-MM-DD HH:mm:ss) [Optional]",
                "visit_type_id": "number"
            }
        ]
    }
    ```
  - `photos[]`: Array of image files.
- **Behavior**: Parses `data`, uploads files via `StorageService`, and creates `VisitLog` entries with multi-product details.
- **Response**: `{ success: true, message: "Visit created successfully.", data: null }`

#### POST `/visits/save-surprise-visit`
- **Body**: `SaveSurpriseVisitDto` (`company_id`, `question_id`, `answer`, `latitude`, `longitude`)
- **Response**: `{ success: true, message: "Task submitted successfully.", data: null }`

#### POST `/visits/location-change-request`
- **Body**: `LocationChangeRequestDto[]`
  - `visit_log_id`: number (required)
  - `remark`: string (required)
- **Behavior**: Processes a batch of location change requests. For each item:
    1. Validates `visit_log_id` exists.
    2. Checks if a pending request already exists for the same contact and product.
    3. Calculates `previous_visit_log_id` based on existing approved requests or the first visit log.
    4. Creates a new `LocationChangeRequest` with status `pending`.
- **Response**: `{ success: true, code: "LOCATION_CHANGE_REQUEST_SUBMITTED", message: "Location change request submitted successfully.", data: null }`
- **Swagger Documentation**:
  - `@ApiOperation({ summary: 'Location change request', description: 'Submit a batch of location change requests for visits.' })`
  - `@ApiExtraModels(ApiResponse)`
  - `@ApiResponse({ status: 201, description: 'Location change request submitted successfully.', schema: { allOf: [ { $ref: getSchemaPath(ApiResponse) }, { properties: { data: { type: 'null' } } } ] } })`

## 2. Dependencies
### Internal Modules
- **`StorageModule`**: Used for uploading visit photos to R2.
- **`AuthModule`**: Required for `JwtAuthGuard` and user identification.
- **`ProductsModule`**: (Implicit) Validates product existence via `VisitsRepository`.

## 3. Database Schema
Key entities managed by this module:
- `VisitLog` (`visit_logs` table)
- `VisitLogProductDetail` (`visit_log_product_details` table)
- `VisitType` (`visit_types` table)
- `SurpriseVisit` (`surprise_visits` table)
- `LocationChangeRequest` (`location_change_requests` table)
