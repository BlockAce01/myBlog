# CloudFront Distribution for HTTPS and CDN
resource "aws_cloudfront_distribution" "myblog" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "MyBlog CloudFront Distribution"
  default_root_object = ""
  price_class         = "PriceClass_100" # Use only US, Canada, Europe

  # Origin configuration (points to EC2 instance)
  origin {
    domain_name = aws_instance.myblog.public_dns
    origin_id   = "myblog-ec2-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only" # EC2 serves HTTP, CloudFront handles HTTPS
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Default cache behavior
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "myblog-ec2-origin"

    # Forward all headers for API functionality
    forwarded_values {
      query_string = true
      headers      = ["*"] # Forward all headers for API authentication

      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400  # 24 hours
    max_ttl                = 31536000 # 1 year
    compress               = true
  }

  # SSL certificate from ACM
  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.myblog.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  # Custom error pages (optional)
  custom_error_response {
    error_code         = 404
    response_code      = 404
    response_page_path = "/404.html"
    error_caching_min_ttl = 300
  }

  # Geo restrictions (optional - allow all)
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Name    = "myblog-cloudfront"
    Project = var.project_name
  }
}

# CloudFront Origin Access Identity (optional - for S3 if needed later)
# resource "aws_cloudfront_origin_access_identity" "myblog" {
#   comment = "MyBlog CloudFront Origin Access Identity"
# }
