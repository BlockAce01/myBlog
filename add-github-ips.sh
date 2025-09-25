#!/bin/bash

# GitHub Actions IP ranges for SSH access (updated regularly)
GITHUB_IPS=(
    "4.148.0.0/16"
    "4.149.0.0/18"
    "4.149.64.0/19"
    "4.149.96.0/19"
    "4.149.128.0/17"
    "4.150.0.0/18"
    "4.150.64.0/18"
    "4.150.128.0/18"
    "4.150.192.0/19"
    "4.150.224.0/19"
    "4.151.0.0/16"
    "4.152.0.0/15"
    "4.154.0.0/15"
    "4.156.0.0/15"
    "4.175.0.0/16"
    "4.180.0.0/16"
    "4.207.0.0/16"
    "4.208.0.0/15"
    "4.210.0.0/17"
    "4.210.128.0/17"
)

# Your security group ID - REPLACE THIS with your actual security group ID
# You can find it in AWS console or from Terraform output
SG_ID="sg-0d245a4d9d61702a5"  # Replace with your security group ID
REGION="ap-southeast-1"

echo "Adding GitHub Actions IP ranges to security group $SG_ID..."

# Add each IP range to the security group
for ip in "${GITHUB_IPS[@]}"; do
    echo "Adding $ip..."
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 22 \
        --cidr $ip \
        --region $REGION
done

echo "✅ All GitHub IP ranges added to security group!"
echo ""
echo "Test the deployment by pushing to your devOps branch:"
echo "git push origin devOps"
