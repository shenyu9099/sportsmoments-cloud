# Azure Deployment Script
# Simple Version

param(
    [string]$ResourceGroup = "sportsmoments-france-rg",
    [string]$Location = "francecentral"
)

$Suffix = Get-Random -Minimum 1000 -Maximum 9999
$StorageAccount = "sports$Suffix"
$CosmosAccount = "sports-cosmos-$Suffix"

# Force set subscription to Azure for Students
Write-Host "Setting subscription to Azure for Students..." -ForegroundColor Yellow
az account set --subscription "24c03302-6462-49e9-996c-ed5accc8d702"
Write-Host "Done" -ForegroundColor Green

Write-Host ""
Write-Host "Starting deployment..." -ForegroundColor Cyan
Write-Host "Resource Group: $ResourceGroup"
Write-Host "Storage: $StorageAccount"
Write-Host "Cosmos DB: $CosmosAccount"
Write-Host ""

$Confirm = Read-Host "Continue? (Y/N)"
if ($Confirm -ne "Y") { exit }

# Step 1: Create Resource Group
Write-Host "Creating resource group..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location --output none
Write-Host "Done" -ForegroundColor Green

# Step 2: Create Storage Account
Write-Host "Creating storage account..." -ForegroundColor Yellow
az storage account create --name $StorageAccount --resource-group $ResourceGroup --location $Location --sku Standard_LRS --output none
Write-Host "Done" -ForegroundColor Green

# Step 3: Create Containers
Write-Host "Creating blob containers..." -ForegroundColor Yellow
az storage container create --name match-videos --account-name $StorageAccount --public-access blob --output none
az storage container create --name thumbnails --account-name $StorageAccount --public-access blob --output none
az storage container create --name tactics --account-name $StorageAccount --public-access blob --output none
Write-Host "Done" -ForegroundColor Green

# Step 4: Create Cosmos DB
Write-Host "Creating Cosmos DB (this takes 3-5 minutes)..." -ForegroundColor Yellow
az cosmosdb create --name $CosmosAccount --resource-group $ResourceGroup --locations regionName=$Location --capabilities EnableServerless --output none
Write-Host "Done" -ForegroundColor Green

# Step 5: Create Database
Write-Host "Creating database..." -ForegroundColor Yellow
az cosmosdb sql database create --account-name $CosmosAccount --resource-group $ResourceGroup --name MediaDB --output none
Write-Host "Done" -ForegroundColor Green

# Step 6: Create Containers
Write-Host "Creating database containers..." -ForegroundColor Yellow
az cosmosdb sql container create --account-name $CosmosAccount --database-name MediaDB --resource-group $ResourceGroup --name Matches --partition-key-path "/teamId" --output none
az cosmosdb sql container create --account-name $CosmosAccount --database-name MediaDB --resource-group $ResourceGroup --name TacticAnnotations --partition-key-path "/matchId" --output none
az cosmosdb sql container create --account-name $CosmosAccount --database-name MediaDB --resource-group $ResourceGroup --name Comments --partition-key-path "/matchId" --output none
az cosmosdb sql container create --account-name $CosmosAccount --database-name MediaDB --resource-group $ResourceGroup --name Teams --partition-key-path "/id" --output none
Write-Host "Done" -ForegroundColor Green

# Step 7: Get Connection Info
Write-Host "Getting connection info..." -ForegroundColor Yellow
$StorageKey = az storage account keys list --account-name $StorageAccount --resource-group $ResourceGroup --query "[0].value" -o tsv
$CosmosEndpoint = az cosmosdb show --name $CosmosAccount --resource-group $ResourceGroup --query documentEndpoint -o tsv
$CosmosKey = az cosmosdb keys list --name $CosmosAccount --resource-group $ResourceGroup --query primaryMasterKey -o tsv
Write-Host "Done" -ForegroundColor Green

# Step 8: Save Config
Write-Host "Saving configuration..." -ForegroundColor Yellow

$Info = @"
========================================
DEPLOYMENT COMPLETE
========================================

Resource Group: $ResourceGroup
Location: $Location

Storage Account: $StorageAccount
Storage Key: $StorageKey

Cosmos DB: $CosmosAccount
Cosmos Endpoint: $CosmosEndpoint
Cosmos Key: $CosmosKey

Database: MediaDB
Containers: Matches, TacticAnnotations, Comments, Teams
Blob Containers: match-videos, thumbnails, tactics

========================================
NEXT STEPS
========================================
1. Create Logic Apps in Azure Portal
2. Update frontend/config.js with URLs
3. See logic-apps-guide.md for details

========================================
"@

$Info | Out-File -FilePath "deployment-info.txt" -Encoding UTF8

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration saved to: deployment-info.txt" -ForegroundColor Cyan
Write-Host ""
Write-Host "Storage Account: $StorageAccount" -ForegroundColor White
Write-Host "Cosmos DB: $CosmosAccount" -ForegroundColor White
Write-Host ""
Write-Host "Next: Create Logic Apps (see logic-apps-guide.md)" -ForegroundColor Yellow
Write-Host ""

