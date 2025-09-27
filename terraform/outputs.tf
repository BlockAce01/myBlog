# EC2 Instance outputs
output "ec2_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_eip.myblog.public_ip
}

output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.myblog.id
}

# ECR Repository outputs
output "ecr_frontend_url" {
  description = "ECR repository URL for frontend"
  value       = aws_ecr_repository.frontend.repository_url
}

output "ecr_backend_url" {
  description = "ECR repository URL for backend"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_nginx_url" {
  description = "ECR repository URL for nginx"
  value       = aws_ecr_repository.nginx.repository_url
}

# Route 53 outputs
output "route53_zone_id" {
  description = "Route 53 hosted zone ID"
  value       = aws_route53_zone.myblog.zone_id
}

output "route53_name_servers" {
  description = "Route 53 name servers (update these in Namecheap)"
  value       = aws_route53_zone.myblog.name_servers
}

# ACM Certificate outputs
output "acm_certificate_arn" {
  description = "ACM certificate ARN for SSL"
  value       = aws_acm_certificate.myblog.arn
}

# IAM outputs
output "github_actions_access_key_id" {
  description = "Access Key ID for GitHub Actions (store in GitHub Secrets)"
  value       = aws_iam_access_key.github_actions.id
  sensitive   = true
}

output "github_actions_secret_access_key" {
  description = "Secret Access Key for GitHub Actions (store in GitHub Secrets)"
  value       = aws_iam_access_key.github_actions.secret
  sensitive   = true
}

# Note: SSH key outputs removed - using SSM for deployment

# CloudFront outputs
output "cloudfront_domain" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.myblog.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.myblog.id
}

# Application URLs
output "application_url" {
  description = "Application URL via CloudFront (after Namecheap DNS update)"
  value       = "https://${var.domain_name}"
}

output "application_ip_url" {
  description = "Application URL via IP (immediate access)"
  value       = "http://${aws_eip.myblog.public_ip}"
}

output "cloudfront_url" {
  description = "Direct CloudFront URL (for testing before DNS update)"
  value       = "https://${aws_cloudfront_distribution.myblog.domain_name}"
}

# DNS Instructions
output "namecheap_dns_instructions" {
  description = "Add this CNAME record in Namecheap DNS"
  value       = "CNAME: blog.yugankavinda.me → ${aws_cloudfront_distribution.myblog.domain_name}"
}
