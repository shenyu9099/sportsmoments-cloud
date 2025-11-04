# ========================================
# Deploy All Logic Apps - Sports Moments Project
# ========================================

# Configuration
$SubscriptionId = "24c03302-6462-49e9-996c-ed5accc8d702"
$ResourceGroup = "sportsmoments-france-rg"
$Location = "francecentral"

# Logic Apps List
$LogicApps = @(
    "get-matches",
    "get-match-by-id",
    "delete-match",
    "create-annotation",
    "get-annotations",
    "add-comment",
    "get-comments"
)

# ========================================
# Start Deployment
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploying Logic Apps..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Clear old URLs file
$urlsFile = "$PSScriptRoot\..\logic-apps-urls.txt"
if (Test-Path $urlsFile) {
    Remove-Item $urlsFile
    Write-Host "Cleared old URLs file" -ForegroundColor Yellow
}

# Set Subscription
Write-Host "Setting subscription: $SubscriptionId" -ForegroundColor Yellow
az account set --subscription $SubscriptionId

# Deploy each Logic App
foreach ($appName in $LogicApps) {
    Write-Host "`n----------------------------------------" -ForegroundColor Green
    Write-Host "Deploying: $appName" -ForegroundColor Green
    Write-Host "----------------------------------------" -ForegroundColor Green
    
    $jsonFile = "$PSScriptRoot\$appName.json"
    
    # Check if JSON file exists
    if (!(Test-Path $jsonFile)) {
        Write-Host "ERROR: File not found - $jsonFile" -ForegroundColor Red
        continue
    }
    
    # Read JSON content
    $jsonContent = Get-Content $jsonFile -Raw
    
    # Extract definition and parameters
    $logicAppConfig = $jsonContent | ConvertFrom-Json
    $definition = $logicAppConfig.definition | ConvertTo-Json -Depth 100 -Compress
    $parameters = $logicAppConfig.parameters | ConvertTo-Json -Depth 100 -Compress
    
    # Create Logic App using REST API
    Write-Host "Creating Logic App: $appName ..." -ForegroundColor Yellow
    
    # Construct the full workflow definition
    $workflowDefinition = @{
        location = $Location
        properties = @{
            definition = $logicAppConfig.definition
            parameters = $logicAppConfig.parameters
        }
    } | ConvertTo-Json -Depth 100 -Compress
    
    # Create the Logic App
    az rest `
        --method PUT `
        --uri "https://management.azure.com/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Logic/workflows/$appName?api-version=2019-05-01" `
        --body $workflowDefinition
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: Created $appName" -ForegroundColor Green
        
        # Get HTTP POST URL
        Write-Host "Getting HTTP URL..." -ForegroundColor Yellow
        $callbackUrl = az rest `
            --method post `
            --uri "https://management.azure.com/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Logic/workflows/$appName/triggers/When_an_HTTP_request_is_received/listCallbackUrl?api-version=2016-06-01" `
            --query value `
            --output tsv
        
        if ($callbackUrl) {
            Write-Host "URL: $callbackUrl" -ForegroundColor Cyan
            
            # Save URL to file
            Add-Content -Path $urlsFile -Value "$appName=$callbackUrl"
        }
    } else {
        Write-Host "FAILED: $appName" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All Logic Apps URLs saved to: ..\logic-apps-urls.txt" -ForegroundColor Green
Write-Host "`nPlease copy these URLs to frontend\config.js" -ForegroundColor Yellow

