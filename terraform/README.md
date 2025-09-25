# MyBlog Terraform Infrastructure

This directory contains the Terraform configuration for deploying MyBlog to AWS.

## Prerequisites

1. **AWS Account**: You need an AWS account with appropriate permissions
2. **Terraform**: Install Terraform (version 1.0+)
3. **AWS CLI**: Configure AWS credentials
4. **SSH Key**: Generate an SSH key pair for EC2 access

## Setup Instructions

### 1. Configure Variables

```bash
# Copy the example file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
nano terraform.tfvars
```

Required variables:

- `domain_name`: Your custom domain (e.g., "myblog.com")
- `user_ip`: Your public IP address (e.g., "203.0.113.1") - /32 will be added automatically

### 2. Generate SSH Key (if not already done)

```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -C "myblog-deploy" -f ~/.ssh/myblog_deploy

# Terraform will read the public key from ~/.ssh/myblog_deploy.pub
```

### 3. Initialize Terraform

```bash
cd terraform
terraform init
```

### 4. Plan Deployment

```bash
terraform plan
```

Review the plan to ensure all resources will be created correctly.

### 5. Apply Infrastructure

```bash
terraform apply
```

This will create:

- EC2 instance with Docker installed
- ECR repositories for frontend/backend images
- Route 53 hosted zone for your domain
- IAM user for GitHub Actions
- Security groups and networking

### 6. Configure GitHub Secrets

After `terraform apply` completes, note the output values. Set these as GitHub Secrets:

| GitHub Secret         | Terraform Output                 |
| --------------------- | -------------------------------- |
| AWS_ACCESS_KEY_ID     | github_actions_access_key_id     |
| AWS_SECRET_ACCESS_KEY | github_actions_secret_access_key |
| AWS_ACCOUNT_ID        | (your AWS account ID)            |
| EC2_HOST              | ec2_public_ip                    |
| DOMAIN_NAME           | (your domain name)               |

Also set your application secrets:

- MONGODB_URI
- JWT_SECRET
- GOOGLE_CLIENT_ID/SECRET
- NEXTAUTH_SECRET
- TINYMCE_API_KEY
- ADMIN_SETUP_TOKEN

### 7. Update Domain DNS

Update your Namecheap domain nameservers to the Route 53 nameservers shown in the output.

### 8. Request SSL Certificate

The Terraform configuration creates an ACM certificate. You may need to validate it through DNS.

## File Structure

```
terraform/
├── main.tf              # EC2 instance, security groups, providers
├── ecr.tf               # ECR repositories
├── route53.tf           # DNS hosted zone and ACM certificate
├── iam.tf               # IAM user for CI/CD
├── variables.tf         # Input variables
├── outputs.tf           # Output values
├── terraform.tfvars.example  # Example variables file
└── README.md            # This file
```

## Important Notes

- **Costs**: This setup uses t3.micro (free tier eligible) but will incur costs for ECR storage and data transfer
- **Security**: SSH access is restricted to your IP address only
- **Region**: EC2 and Route 53 in ap-southeast-1 (Singapore), ECR and ACM in us-east-1 (N. Virginia)
- **Domain**: Update your domain registrar's nameservers to Route 53
- **SSL**: Certificate is created in us-east-1 for CloudFront compatibility

## Troubleshooting

### Common Issues

1. **SSH Key Not Found**: Ensure `~/.ssh/myblog_deploy.pub` exists
2. **Domain Already Exists**: If Route 53 hosted zone creation fails, check if domain is already managed
3. **AMI Not Found**: The Ubuntu 22.04 AMI is now dynamically resolved - this error should not occur
4. **ACM Certificate Timeout**: DNS validation can take up to 30 minutes - be patient
5. **Permissions**: Ensure your AWS user has necessary permissions

### Clean Up

To destroy all resources:

```bash
terraform destroy
```

**Warning**: This will delete your EC2 instance, ECR repositories, and Route 53 hosted zone.

## Next Steps

After infrastructure is deployed:

1. Push your code to trigger GitHub Actions
2. Monitor the deployment pipeline
3. Test your application at the custom domain
4. Set up monitoring and alerts (optional)
