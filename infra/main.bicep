targetScope = 'subscription'

param location string = 'canadacentral'
param environmentName string = 'stability-dashboard'
param tags object = {
  project: 'azure-stability-dashboard'
  owner: 'platform-team'
}

resource rg 'Microsoft.Resources/resourceGroups@2022-09-01' = {
  name: 'rg-${environmentName}'
  location: location
  tags: tags
}

module storage 'storage.bicep' = {
  scope: rg
  name: 'storage'
  params: {
    location: location
    environmentName: environmentName
    tags: tags
  }
}

module functions 'functions.bicep' = {
  scope: rg
  name: 'functions'
  params: {
    location: location
    environmentName: environmentName
    storageAccountName: storage.outputs.storageAccountName
    tags: tags
  }
}

module swa 'staticWebApp.bicep' = {
  scope: rg
  name: 'staticWebApp'
  params: {
    location: location
    environmentName: environmentName
    tags: tags
  }
}

output staticWebAppUrl string = swa.outputs.url
output functionAppUrl string = functions.outputs.functionAppUrl
