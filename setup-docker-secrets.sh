#!/bin/bash

# MyBlog Docker Secrets Setup Script
# This script helps set up Docker secrets for production deployment
# Run this script as root or with sudo privileges

set -e

echo "🔐 MyBlog Docker Secrets Setup"
echo "================================"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root (sudo)"
   exit 1
fi

# Create secrets directory
SECRETS_DIR="/run/secrets"
echo "📁 Creating secrets directory: $SECRETS_DIR"
mkdir -p "$SECRETS_DIR"

# Function to create a secret file
create_secret() {
    local secret_name=$1
    local prompt_text=$2
    local file_path="$SECRETS_DIR/${secret_name}.txt"

    if [[ -f "$file_path" ]]; then
        read -p "⚠️  Secret '$secret_name' already exists. Overwrite? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "⏭️  Skipping $secret_name"
            return
        fi
    fi

    echo "🔑 Enter $prompt_text:"
    read -s secret_value
    echo

    if [[ -z "$secret_value" ]]; then
        echo "❌ Secret cannot be empty"
        return 1
    fi

    echo -n "$secret_value" > "$file_path"
    chmod 600 "$file_path"
    echo "✅ Created secret: $secret_name"
}

# Create all required secrets
echo
echo "Creating Docker secrets..."
echo "Note: Input will be hidden for security"
echo

create_secret "mongodb_uri" "MongoDB Atlas connection string (mongodb+srv://...)"
create_secret "jwt_secret" "JWT signing secret (min 64 characters)"
create_secret "nextauth_secret" "NextAuth secret (min 32 characters)"
create_secret "admin_setup_token" "Admin setup token"
create_secret "google_client_id" "Google OAuth Client ID"
create_secret "google_client_secret" "Google OAuth Client Secret"
create_secret "admin_email" "Admin email address"
create_secret "tinymce_api_key" "TinyMCE API key (for rich text editor)"

# Set proper permissions
echo
echo "🔒 Setting proper permissions..."
chown root:root "$SECRETS_DIR"/*.txt 2>/dev/null || true
chmod 600 "$SECRETS_DIR"/*.txt 2>/dev/null || true

# Verify secrets
echo
echo "🔍 Verifying secrets..."
SECRET_FILES=(
    "mongodb_uri.txt"
    "jwt_secret.txt"
    "nextauth_secret.txt"
    "admin_setup_token.txt"
    "google_client_id.txt"
    "google_client_secret.txt"
    "admin_email.txt"
    "tinymce_api_key.txt"
)

for file in "${SECRET_FILES[@]}"; do
    if [[ -f "$SECRETS_DIR/$file" ]]; then
        file_size=$(stat -c%s "$SECRETS_DIR/$file" 2>/dev/null || stat -f%z "$SECRETS_DIR/$file" 2>/dev/null || echo "0")
        if [[ $file_size -gt 0 ]]; then
            echo "✅ $file: OK (${file_size} bytes)"
        else
            echo "❌ $file: EMPTY"
        fi
    else
        echo "❌ $file: MISSING"
    fi
done

echo
echo "🎉 Docker secrets setup complete!"
echo
echo "Next steps:"
echo "1. Review the secrets in $SECRETS_DIR"
echo "2. Run: docker-compose -f docker-compose.prod.yml up --build"
echo "3. Access your application at http://localhost"
echo
echo "⚠️  Security reminders:"
echo "• Never commit secrets to version control"
echo "• Rotate secrets regularly"
echo "• Use strong, unique secrets for each environment"
echo "• Monitor secret access logs"
