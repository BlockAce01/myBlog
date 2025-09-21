variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "myblog"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "MyBlog"
    Environment = "Dev"
    ManagedBy   = "terraform"
  }
}

variable "blog_bucket_name" {
  description = "Name of the S3 bucket for blog static content"
  type        = string
  default     = "myblog-static-content"
}

variable "custom_domain" {
  description = "Custom domain for the blog (optional)"
  type        = string
  default     = "blog.yugankavinda.me"
}
