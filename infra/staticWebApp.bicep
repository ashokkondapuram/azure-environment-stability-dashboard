param location string
param environmentName string
param tags object

resource staticWebApp 'Microsoft.Web/staticSites@2022-09-01' = {
  name: 'swa-${environmentName}'
  location: location
  tags: tags
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
    buildProperties: {
      appLocation: 'frontend'
      outputLocation: 'build'
      apiLocation: 'api'
    }
  }
}

output url string = 'https://${staticWebApp.properties.defaultHostname}'
output staticWebAppId string = staticWebApp.id
