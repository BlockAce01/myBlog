variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "ap-southeast-1"
}

variable "domain_name" {
  description = "Custom domain name for the application"
  type        = string
}

variable "user_ip" {
  description = "Your public IP address for SSH access (e.g., 203.0.113.1)"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.small"
}

variable "key_name" {
  description = "Name of the SSH key pair"
  type        = string
  default     = "myblog-deploy-key"
}

variable "project_name" {
  description = "Project name for tagging"
  type        = string
  default     = "MyBlog"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}
