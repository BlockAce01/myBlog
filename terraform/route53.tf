# Route 53 Hosted Zone for custom domain
resource "aws_route53_zone" "myblog" {
  name = var.domain_name

  tags = {
    Name    = "myblog-hosted-zone"
    Project = var.project_name
  }
}

# Note: CNAME record removed - user will manually add in Namecheap DNS
# pointing to: aws_cloudfront_distribution.myblog.domain_name

# CNAME record for www subdomain (optional)
resource "aws_route53_record" "myblog_www" {
  zone_id = aws_route53_zone.myblog.zone_id
  name    = "www.${var.domain_name}"
  type    = "CNAME"
  ttl     = "300"
  records = [var.domain_name]
}

# ACM Certificate for HTTPS (must be in us-east-1 for CloudFront, but we'll use it for EC2)
resource "aws_acm_certificate" "myblog" {
  provider          = aws.us-east-1
  domain_name       = var.domain_name
  validation_method = "DNS"

  subject_alternative_names = [
    "www.${var.domain_name}"
  ]

  tags = {
    Name    = "myblog-ssl-cert"
    Project = var.project_name
  }
}

# DNS validation for ACM certificate
resource "aws_route53_record" "acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.myblog.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = aws_route53_zone.myblog.zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}

# Certificate validation
resource "aws_acm_certificate_validation" "myblog" {
  provider                = aws.us-east-1
  certificate_arn         = aws_acm_certificate.myblog.arn
  validation_record_fqdns = [for record in aws_route53_record.acm_validation : record.fqdn]

  timeouts {
    create = "30m"
  }

  depends_on = [aws_route53_record.acm_validation]
}
