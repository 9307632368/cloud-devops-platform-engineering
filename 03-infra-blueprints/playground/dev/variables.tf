variable "aws_region" {
  description = "AWS region to use for this lab."
  type        = string
  default     = "ap-south-1"
}
variable "aws_profile" {
  description = "An AWS CLI profile with the required permissions."
  type        = string
  default     = "default"
}
variable "project_name" {
  description = "Use a short lowercase name with hyphens so S3 naming works."
  type        = string
  default     = "infra-lab"
  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{2,20}$", var.project_name))
    error_message = "Use a 3-21 character lowercase name with letters, numbers or hyphens."
  }
}
variable "vpc_cidr" {
  type    = string
  default = "10.42.0.0/16"
}
variable "instance_type" {
  type    = string
  default = "t3.micro"
}
variable "allowed_http_cidr" {
  description = "Restrict HTTP to your own public IP/32 when possible."
  type        = string
  default     = "0.0.0.0/0"
}
