const { DefaultAzureCredential } = require('@azure/identity');
const { MicrosoftResourceHealth } = require('@azure/arm-resourcehealth');

module.exports = async function (context, req) {
  try {
    const credential = new DefaultAzureCredential();
    const subscriptionId = process.env.SUBSCRIPTION_ID;
    const client = new MicrosoftResourceHealth(credential, subscriptionId);

    const healthEvents = [];
    for await (const event of client.availabilityStatuses.listBySubscriptionId()) {
      healthEvents.push({
        id: event.id,
        name: event.name,
        location: event.location,
        status: event.properties?.availabilityState,
        summary: event.properties?.summary,
        reasonType: event.properties?.reasonType,
        occuredTime: event.properties?.occuredTime,
        environment: inferEnvironment(event.id)
      });
    }

    context.res = { status: 200, body: healthEvents };
  } catch (err) {
    context.log.error('Error fetching resource health:', err);
    context.res = { status: 500, body: { error: err.message } };
  }
};

function inferEnvironment(resourceId = '') {
  const id = resourceId.toLowerCase();
  if (id.includes('prod')) return 'Production';
  if (id.includes('stag') || id.includes('staging')) return 'Staging';
  if (id.includes('dev')) return 'Development';
  return 'Production';
}
