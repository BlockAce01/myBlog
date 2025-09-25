# ECR Repository for Frontend
resource "aws_ecr_repository" "frontend" {
  provider = aws.us-east-1

  name = "myblog/frontend"

  image_scanning_configuration {
    scan_on_push = true
  }

  image_tag_mutability = "MUTABLE"

  tags = {
    Name    = "myblog-frontend-repo"
    Project = var.project_name
  }
}

# ECR Repository for Backend
resource "aws_ecr_repository" "backend" {
  provider = aws.us-east-1

  name = "myblog/backend"

  image_scanning_configuration {
    scan_on_push = true
  }

  image_tag_mutability = "MUTABLE"

  tags = {
    Name    = "myblog-backend-repo"
    Project = var.project_name
  }
}

# ECR Repository for Nginx (optional, if we containerize nginx)
resource "aws_ecr_repository" "nginx" {
  provider = aws.us-east-1

  name = "myblog/nginx"

  image_scanning_configuration {
    scan_on_push = true
  }

  image_tag_mutability = "MUTABLE"

  tags = {
    Name    = "myblog-nginx-repo"
    Project = var.project_name
  }
}

# ECR Lifecycle policy to keep only recent images
resource "aws_ecr_lifecycle_policy" "frontend_policy" {
  provider   = aws.us-east-1
  repository = aws_ecr_repository.frontend.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = {
        type = "expire"
      }
    }]
  })
}

resource "aws_ecr_lifecycle_policy" "backend_policy" {
  provider   = aws.us-east-1
  repository = aws_ecr_repository.backend.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = {
        type = "expire"
      }
    }]
  })
}
