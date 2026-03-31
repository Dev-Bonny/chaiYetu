Write-Host "Setting up ChaiYetu Frontend..."

# Install dependencies
Write-Host "Installing dependencies..."
npm install

# Create environment file
if (!(Test-Path ".env.local")) {
    Write-Host "Creating .env.local file..."
    @"
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=ChaiYetu
"@ | Out-File -FilePath .env.local -Encoding UTF8
    Write-Host "Environment file created. Please update with your backend URL."
}

# Create necessary directories
Write-Host "Creating directory structure..."
New-Item -ItemType Directory -Force -Path "src/components/layout"
New-Item -ItemType Directory -Force -Path "src/components/dashboard"
New-Item -ItemType Directory -Force -Path "src/components/collections"
New-Item -ItemType Directory -Force -Path "src/components/payments"
New-Item -ItemType Directory -Force -Path "src/components/predictions"
New-Item -ItemType Directory -Force -Path "src/components/farmers"
New-Item -ItemType Directory -Force -Path "src/components/collectors"
New-Item -ItemType Directory -Force -Path "src/lib"
New-Item -ItemType Directory -Force -Path "src/types"

Write-Host "Frontend setup completed!"
Write-Host "Run 'npm run dev' to start the development server."