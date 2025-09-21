output "terraform_state_bucket" {
  description = "S3 bucket for Terraform state"
  value       = aws_s3_bucket.terraform_state.bucket
}

output "terraform_state_bucket_arn" {
  description = "ARN of the S3 bucket for Terraform state"
  value       = aws_s3_bucket.terraform_state.arn
}

output "terraform_state_bucket_domain_name" {
  description = "Domain name of the S3 bucket for Terraform state"
  value       = aws_s3_bucket.terraform_state.bucket_domain_name
}

output "terraform_state_bucket_regional_domain_name" {
  description = "Regional domain name of the S3 bucket for Terraform state"
  value       = aws_s3_bucket.terraform_state.bucket_regional_domain_name
}

output "blog_bucket_name" {
  description = "Name of the S3 bucket for blog content"
  value       = aws_s3_bucket.blog_content.bucket
}

output "blog_bucket_website_endpoint" {
  description = "Website endpoint of the S3 bucket for blog content"
  value       = aws_s3_bucket_website_configuration.blog_content.website_endpoint
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.blog_content.id
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.blog_content.domain_name
}

output "cloudfront_distribution_arn" {
  description = "ARN of the CloudFront distribution"
  value       = aws_cloudfront_distribution.blog_content.arn
}

output "certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = aws_acm_certificate.blog_certificate.arn
}

output "certificate_validation_records" {
  description = "DNS validation records for the ACM certificate"
  value = [
    for record in aws_acm_certificate.blog_certificate.domain_validation_options : {
      name  = record.resource_record_name
      type  = record.resource_record_type
      value = record.resource_record_value
    }
  ]
}

output "custom_domain" {
  description = "Custom domain configured for the blog"
  value       = var.custom_domain
}
