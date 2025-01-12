output "web_url" {
  description = "HTTP-only test page; may take a few minutes after applying to load."
  value       = module.web.url
}
output "ec2_instance_id" {
  value = module.web.instance_id
}
output "s3_bucket_name" {
  value = module.artifacts.bucket_name
}
output "vpc_id" {
  value = module.network.vpc_id
}
output "public_subnets" {
  value = module.network.public_subnet_ids
}
output "private_subnets" {
  value = module.network.private_subnet_ids
}
