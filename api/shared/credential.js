const { DefaultAzureCredential } = require('@azure/identity');

// Automatically uses Managed Identity in Azure, falls back to az CLI locally
let _credential;
export function getCredential() {
  if (!_credential) _credential = new DefaultAzureCredential();
  return _credential;
}
