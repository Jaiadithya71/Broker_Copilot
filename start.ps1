# Broker Copilot - Startup Script
# This script starts both the backend and frontend servers concurrently

Write-Host "Starting Broker Copilot..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Function to start backend
$backendJob = Start-Job -ScriptBlock {
    Set-Location "e:/Python Projects/Broker_Copilot-master/Broker_Copilot-master/backend"
    Write-Host "Starting Backend Server..." -ForegroundColor Green
    npm run dev
}

# Function to start frontend
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "e:/Python Projects/Broker_Copilot-master/Broker_Copilot-master/frontend"
    Write-Host "Starting Frontend Server..." -ForegroundColor Blue
    npm run dev
}

Write-Host "Backend server starting on port 4000..." -ForegroundColor Green
Write-Host "Frontend server starting on port 3000..." -ForegroundColor Blue
Write-Host ""
Write-Host "Logs:" -ForegroundColor Yellow
Write-Host "   - Backend: Job ID $($backendJob.Id)" -ForegroundColor Gray
Write-Host "   - Frontend: Job ID $($frontendJob.Id)" -ForegroundColor Gray
Write-Host ""
Write-Host "Access the application at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend API available at: http://localhost:4000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host ""

# Monitor jobs and display output
try {
    while ($true) {
        # Check if jobs are still running
        if ($backendJob.State -eq "Failed" -or $frontendJob.State -eq "Failed") {
            Write-Host "One or more servers failed to start" -ForegroundColor Red
            break
        }

        # Receive and display output from jobs
        Receive-Job -Job $backendJob -ErrorAction SilentlyContinue | ForEach-Object {
            Write-Host "[Backend] $_" -ForegroundColor Green
        }
        
        Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue | ForEach-Object {
            Write-Host "[Frontend] $_" -ForegroundColor Blue
        }

        Start-Sleep -Milliseconds 500
    }
}
finally {
    # Cleanup: Stop all jobs when script is terminated
    Write-Host ""
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    Stop-Job -Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob, $frontendJob -Force -ErrorAction SilentlyContinue
    Write-Host "All servers stopped" -ForegroundColor Green
}
