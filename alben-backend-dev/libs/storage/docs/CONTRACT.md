# Storage Module Contract

## 1. Public Interface
The `StorageModule` exposes the following services:

### Services
- **`StorageService`**:
    - `uploadFile(file: MulterFile, directory?: string): Promise<string>`
        - Uploads a file to the configured R2 bucket.
        - `file`: The file object (Multer).
        - `directory`: Optional directory prefix (e.g., 'uploads/123/visit_logs').
        - Returns: The key (path) of the uploaded file.

## 2. Dependencies
### External Libraries
- `@aws-sdk/client-s3`: For communicating with Cloudflare R2.
- `uuid`: For generating unique filenames.
- `@nestjs/config`: For loading credentials.

## 3. Environment Variables
Required variables in `.env`:
- `CLOUDFLARE_R2_ACCESS_KEY_ID`
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_R2_ACCOUNT_ID`
- `CLOUDFLARE_R2_BUCKET`
- `CLOUDFLARE_R2_ENDPOINT`
- `CLOUDFLARE_R2_PUBLIC_URL` (Optional: The public domain/R2.dev URL for the bucket)
