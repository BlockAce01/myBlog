terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "myblog-terraform-state"
    key    = "terraform.tfstate"
    region = "ap-south-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# Provider for us-east-1 (required for CloudFront certificates)
provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
}

# S3 bucket for Terraform state (bootstrap resource)
resource "aws_s3_bucket" "terraform_state" {
  bucket = "myblog-terraform-state"

  tags = merge(var.tags, {
    Name        = "myblog-terraform-state"
    Environment = "infrastructure"
  })
}

# Enable versioning for state bucket
resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Block public access for state bucket
resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 bucket for blog static content
resource "aws_s3_bucket" "blog_content" {
  bucket = var.blog_bucket_name

  tags = merge(var.tags, {
    Name = var.blog_bucket_name
  })
}

# Configure S3 bucket for static website hosting
resource "aws_s3_bucket_website_configuration" "blog_content" {
  bucket = aws_s3_bucket.blog_content.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

# CORS configuration for API access
resource "aws_s3_bucket_cors_configuration" "blog_content" {
  bucket = aws_s3_bucket.blog_content.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}

# Public access block (allow public read for static content)
resource "aws_s3_bucket_public_access_block" "blog_content" {
  bucket = aws_s3_bucket.blog_content.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Bucket policy for public read access
resource "aws_s3_bucket_policy" "blog_content" {
  bucket = aws_s3_bucket.blog_content.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource = [
          "${aws_s3_bucket.blog_content.arn}/*"
        ]
      }
    ]
  })
}

# CloudFront Origin Access Control
resource "aws_cloudfront_origin_access_control" "blog_content" {
  name                              = "myblog-oac"
  description                       = "OAC for myblog S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ACM Certificate for custom domain (must be in us-east-1 for CloudFront)
resource "aws_acm_certificate" "blog_certificate" {
  provider          = aws.us-east-1
  domain_name       = var.custom_domain
  validation_method = "DNS"

  tags = merge(var.tags, {
    Name = "myblog-ssl-certificate"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "blog_content" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "MyBlog CloudFront Distribution"
  default_root_object = "index.html"
  aliases             = [var.custom_domain]

  origin {
    domain_name              = aws_s3_bucket.blog_content.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.blog_content.id
    origin_id                = "myblog-s3-origin"
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "myblog-s3-origin"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.blog_certificate.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = merge(var.tags, {
    Name = "myblog-cloudfront"
  })
}
