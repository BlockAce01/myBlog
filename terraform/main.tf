terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Additional provider for ACM and ECR (must be in us-east-1)
provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
}

# Data source for Ubuntu 22.04 LTS AMI
data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

# SSH Key Pair for EC2 access
resource "aws_key_pair" "deployer" {
  key_name   = var.key_name
  public_key = file("~/.ssh/myblog_deploy.pub")  # You'll need to create this key pair
}

# Security Group for EC2
resource "aws_security_group" "myblog" {
  name_prefix = "myblog-"
  description = "Security group for MyBlog application"

  # SSH access (restricted to your IP)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["${var.user_ip}/32"]
  }

  # HTTP access
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS access
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "myblog-sg"
    Project = var.project_name
  }
}

# EC2 Instance
resource "aws_instance" "myblog" {
  ami           = data.aws_ami.ubuntu.id  # Ubuntu 22.04 LTS
  instance_type = var.instance_type
  key_name      = aws_key_pair.deployer.key_name

  vpc_security_group_ids = [aws_security_group.myblog.id]

  user_data = <<-EOF
    #!/bin/bash
    # Update system
    apt-get update
    apt-get upgrade -y

    # Install Docker
    apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

    # Start and enable Docker
    systemctl start docker
    systemctl enable docker

    # Add ubuntu user to docker group
    usermod -aG docker ubuntu

    # Install AWS CLI for ECR access
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    ./aws/install

    # Clean up
    rm -rf aws awscliv2.zip

    # Create application directory
    mkdir -p /home/ubuntu/myblog
    chown ubuntu:ubuntu /home/ubuntu/myblog
  EOF

  tags = {
    Name    = "myblog-server"
    Project = var.project_name
  }
}

# Elastic IP for the EC2 instance (optional, for consistent IP)
resource "aws_eip" "myblog" {
  instance = aws_instance.myblog.id
  domain   = "vpc"

  tags = {
    Name    = "myblog-eip"
    Project = var.project_name
  }
}
