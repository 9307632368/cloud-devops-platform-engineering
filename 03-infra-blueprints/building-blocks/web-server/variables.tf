variable "name" {
  type        = string
  description = "Service name shown on the demo page."
}
variable "vpc_id" {
  type = string
}
variable "public_subnet_id" {
  type = string
}
variable "instance_type" {
  type    = string
  default = "t3.micro"
}
variable "allowed_http_cidr" {
  type        = string
  description = "Public demo access is open by default; restrict to your own IP/32 if possible."
  default     = "0.0.0.0/0"
  validation {
    condition     = can(cidrhost(var.allowed_http_cidr, 0))
    error_message = "Use an IPv4 CIDR, e.g. 203.0.113.25/32."
  }
}
