A# Deploy Logic Apps - Upload Match
# This script creates the upload-match Logic App

param(
    [string]$ResourceGroup = "sportsmoments-france-rg",
    [string]$Location = "francecentral",
    [string]$StorageAccount = "sport",  # Replace with your storage account name
    [string]$CosmosAccount = "sprot-113992"  # Replace with your Cosmos DB account name
)

Write-Host "Creating Logic App: upload-match" -ForegroundColor Cyan

# Get Storage Account Key
Write-Host "Getting Storage Account key..." -ForegroundColor Yellow
$StorageKey = az storage account keys list --account-name $StorageAccount --resource-group $ResourceGroup --query "[0].value" -o tsv

# Get Cosmos DB Key
Write-Host "Getting Cosmos DB key..." -ForegroundColor Yellow
$CosmosKey = az cosmosdb keys list --name $CosmosAccount --resource-group $ResourceGroup --query primaryMasterKey -o tsv
$CosmosEndpoint = az cosmosdb show --name $CosmosAccount --resource-group $ResourceGroup --query documentEndpoint -o tsv

# Create Logic App with workflow
Write-Host "Creating Logic App with workflow..." -ForegroundColor Yellow

# Create a simplified workflow definition file
$WorkflowDef = @"
{
  "`$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {},
  "resources": [
    {
      "type": "Microsoft.Logic/workflows",
      "apiVersion": "2019-05-01",
      "name": "upload-match",
      "location": "$Location",
      "properties": {
        "state": "Enabled",
        "definition": {
          "`$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
          "contentVersion": "1.0.0.0",
          "triggers": {
            "manual": {
              "type": "Request",
              "kind": "Http",
              "inputs": {
                "method": "POST"
              }
            }
          },
          "actions": {
            "Response": {
              "type": "Response",
              "inputs": {
                "statusCode": 200,
                "body": {
                  "success": true,
                  "message": "Logic App created successfully. Please configure workflow in Azure Portal."
                }
              }
            }
          }
        }
      }
    }
  ]
}
"@

# Save template to file
$WorkflowDef | Out-File -FilePath "upload-match-template.json" -Encoding UTF8

# Deploy the template
Write-Host "Deploying Logic App..." -ForegroundColor Yellow
az deployment group create --resource-group $ResourceGroup --template-file "upload-match-template.json" --output table

if ($LASTEXITCODE -eq 0) {
    Write-Host "Logic App created successfully!" -ForegroundColor Green
    
    # Get the callback URL
    Write-Host "`nGetting Logic App URL..." -ForegroundColor Yellow
    $LogicAppUrl = az rest --method post --uri "https://management.azure.com/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$ResourceGroup/providers/Microsoft.Logic/workflows/upload-match/listCallbackUrl?api-version=2016-06-01" --query value -o tsv
    
    Write-Host "`nLogic App URL:" -ForegroundColor Cyan
    Write-Host $LogicAppUrl
    
    Write-Host "`nNEXT STEPS:" -ForegroundColor Yellow
    Write-Host "1. Open Azure Portal and go to the Logic App 'upload-match'" -ForegroundColor White
    Write-Host "2. Click 'Logic app designer' to add more steps" -ForegroundColor White
    Write-Host "3. Add Initialize Variable, Blob Storage, Cosmos DB steps" -ForegroundColor White
    Write-Host "4. See logic-apps-guide.md for detailed steps" -ForegroundColor White
} else {
    Write-Host "Failed to create Logic App" -ForegroundColor Red
}

# Clean up template file
Remove-Item "upload-match-template.json" -ErrorAction SilentlyContinue

