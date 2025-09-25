# IAM User for GitHub Actions CI/CD
resource "aws_iam_user" "github_actions" {
  name = "myblog-github-actions"
  path = "/"

  tags = {
    Name    = "myblog-github-actions-user"
    Project = var.project_name
  }
}

# IAM Access Key for the user
resource "aws_iam_access_key" "github_actions" {
  user = aws_iam_user.github_actions.name
}

# IAM Policy for ECR and SSM access
resource "aws_iam_policy" "github_actions_ecr" {
  name        = "myblog-github-actions-ecr-policy"
  description = "Policy for GitHub Actions to access ECR repositories and SSM"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:SendCommand",
          "ssm:GetCommandInvocation",
          "ssm:DescribeInstanceInformation"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeInstances"
        ]
        Resource = "*"
      }
    ]
  })

  tags = {
    Name    = "myblog-github-actions-ecr-policy"
    Project = var.project_name
  }
}

# Attach ECR policy to the IAM user
resource "aws_iam_user_policy_attachment" "github_actions_ecr" {
  user       = aws_iam_user.github_actions.name
  policy_arn = aws_iam_policy.github_actions_ecr.arn
}

# IAM Role for EC2 instance (optional, for future enhancements)
resource "aws_iam_role" "ec2_role" {
  name = "myblog-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name    = "myblog-ec2-role"
    Project = var.project_name
  }
}

# Attach basic EC2 permissions (optional)
resource "aws_iam_role_policy_attachment" "ec2_ssm" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Instance profile for EC2
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "myblog-ec2-instance-profile"
  role = aws_iam_role.ec2_role.name
}
