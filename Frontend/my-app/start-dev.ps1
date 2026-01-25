Write-Host "Starting development server..." -ForegroundColor Green

# Kill any existing processes on port 5173
$processes = netstat -ano | findstr :5173
if ($processes) {
    Write-Host "Killing existing processes on port 5173..." -ForegroundColor Yellow
    $processes | ForEach-Object {
        $pid = ($_ -split '\s+')[-1]
        taskkill /f /pid $pid 2>$null
    }
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Green
npm install --legacy-peer-deps

# Start development server
Write-Host "Starting Vite development server..." -ForegroundColor Green
npm run dev 