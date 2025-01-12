data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "me" {}

locals {
  # Account + region make the demo bucket name unlikely to collide with other students' labs.
  artifact_bucket_name = lower("${var.project_name}-${data.aws_caller_identity.me.account_id}-${var.aws_region}-artifacts")
}

module "network" {
  source             = "../../building-blocks/network"
  name               = var.project_name
  vpc_cidr           = var.vpc_cidr
  availability_zones = slice(data.aws_availability_zones.available.names, 0, 2)
}

module "web" {
  source            = "../../building-blocks/web-server"
  name              = var.project_name
  vpc_id            = module.network.vpc_id
  public_subnet_id  = module.network.public_subnet_ids[0]
  instance_type     = var.instance_type
  allowed_http_cidr = var.allowed_http_cidr
}

module "artifacts" {
  source      = "../../building-blocks/artifact-bucket"
  bucket_name = local.artifact_bucket_name
}
