const { BlobServiceClient } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');

module.exports = async function (context, req) {
  try {
    const credential = new DefaultAzureCredential();
    const storageUrl = process.env.STORAGE_ACCOUNT_URL;
    const blobClient = new BlobServiceClient(storageUrl, credential);
    const containerClient = blobClient.getContainerClient('alerts');

    const alerts = [];
    for await (const blob of containerClient.listBlobsFlat()) {
      const blobContent = await containerClient.getBlobClient(blob.name).download();
      const text = await streamToString(blobContent.readableStreamBody);
      alerts.push(...JSON.parse(text));
    }

    // Sort by firedAt descending
    alerts.sort((a, b) => new Date(b.firedAt) - new Date(a.firedAt));

    context.res = { status: 200, body: alerts, headers: { 'Content-Type': 'application/json' } };
  } catch (err) {
    context.log.error('Error fetching alerts:', err);
    context.res = { status: 500, body: { error: err.message } };
  }
};

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf-8');
}
