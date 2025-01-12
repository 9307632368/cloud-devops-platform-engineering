variable "name" {
  description = "Prefix added to AWS resource names."
  type        = string
}
variable "vpc_cidr" {
  description = "The lab is designed for an IPv4 /16 (enough space for four /24 subnets)."
  type        = string
  default     = "10.42.0.0/16"
  validation {
    condition     = can(cidrsubnet(var.vpc_cidr, 8, 11)) && can(regex("/16$", var.vpc_cidr))
    error_message = "Use a valid IPv4 /16 CIDR block, e.g. 10.42.0.0/16."
  }
}
variable "availability_zones" {
  description = "Two distinct availability zones in the selected region."
  type        = list(string)
  validation {
    condition     = length(var.availability_zones) == 2 && var.availability_zones[0] != var.availability_zones[1]
    error_message = "Supply exactly two different availability zones."
  }
}
