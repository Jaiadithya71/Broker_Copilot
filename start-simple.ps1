# Simple Startup Script for Broker Copilot
# Starts backend and frontend in separate terminal windows

Write-Host "Starting Broker Copilot..." -ForegroundColor Cyan

# Start Backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'e:/Python Projects/Broker_Copilot-master/Broker_Copilot-master/backend'; Write-Host 'Backend Server Starting...' -ForegroundColor Green; npm run dev"

# Wait a moment
Start-Sleep -Seconds 2

# Start Frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'e:/Python Projects/Broker_Copilot-master/Broker_Copilot-master/frontend'; Write-Host 'Frontend Server Starting...' -ForegroundColor Blue; npm run dev"

Write-Host ""
Write-Host "Servers starting in separate windows..." -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:4000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Close the terminal windows to stop the servers" -ForegroundColor Yellow
