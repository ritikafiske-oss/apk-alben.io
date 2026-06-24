# Features Classification

## CORE (Frozen)
> These features are critical and should not change without a major version update.

1.  **File Upload (S3/R2)**
    - Upload files to S3-compatible storage (specifically configured for Cloudflare R2).
    - Returns the storage key (path) for the uploaded object.
    - Security: Uses AWS SDK v3 with `S3Client`, credentials loaded from environment variables.

## FLEX (Changeable)
> These features are likely to evolve or are not yet fully defined.

1.  **Public URL Generation**
    - Currently returns the storage key. Future iterations might generate full public URLs or signed URLs.
2.  **Delete File**
    - Not yet implemented.
3.  **Get File**
    - Not yet implemented (assumes direct access via public URL or other means).
4.  **Upload Files API** *(Added: 2026-02-27)*
    - `POST /upload-files` — HTTP endpoint (JWT-protected) that accepts `multipart/form-data` with `company_id` and one or more `files[]`.
    - Uploads each file under `{company_id}/attachments/` directory in R2.
    - Returns `{ success, message, data: [{ title, url }] }`.

