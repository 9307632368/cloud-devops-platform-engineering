variable "bucket_name" {
  type        = string
  description = "Unique globally valid S3 bucket name."
  validation {
    condition     = length(var.bucket_name) >= 3 && length(var.bucket_name) <= 63 && can(regex("^[a-z0-9][a-z0-9.-]*[a-z0-9]$", var.bucket_name))
    error_message = "Bucket name must be 3-63 characters with lowercase letters, numbers, hyphens and dots."
  }
}
