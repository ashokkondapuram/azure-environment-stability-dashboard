const { DefaultAzureCredential } = require('@azure/identity');
const { MonitorClient } = require('@azure/arm-monitor');

module.exports = async function (context, req) {
  try {
    const credential = new DefaultAzureCredential();
    const subscriptionId = process.env.SUBSCRIPTION_ID;
    const client = new MonitorClient(credential, subscriptionId);

    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // last 24h

    const filter = `eventTimestamp ge '${startTime.toISOString()}' and eventTimestamp le '${endTime.toISOString()}'`;
    const logs = [];

    for await (const event of client.activityLogs.list(filter)) {
      logs.push({
        operationName: event.operationName?.localizedValue || event.operationName?.value,
        operationType: event.operationName?.value?.split('/')?.[2] || 'Action',
        resourceGroup: event.resourceGroupName,
        caller: event.caller,
        status: event.status?.localizedValue,
        timestamp: event.eventTimestamp?.toISOString(),
        resourceType: event.resourceType?.localizedValue,
        resourceId: event.resourceId
      });
    }

    context.res = { status: 200, body: logs.slice(0, 100) };
  } catch (err) {
    context.log.error('Error fetching activity logs:', err);
    context.res = { status: 500, body: { error: err.message } };
  }
};
