const { DefaultAzureCredential } = require('@azure/identity');
const { LogsQueryClient } = require('@azure/monitor-query');

module.exports = async function (context, req) {
  try {
    const credential = new DefaultAzureCredential();
    const workspaceId = process.env.LOG_ANALYTICS_WORKSPACE_ID;
    const client = new LogsQueryClient(credential);

    if (req.method === 'POST') {
      // Execute custom KQL query
      const { query } = req.body;
      if (!query) {
        context.res = { status: 400, body: { error: 'query required in body' } };
        return;
      }
      const result = await client.queryWorkspace(workspaceId, query, { duration: 'PT1H' });
      context.res = { status: 200, body: { tables: result.tables, status: result.status } };
    } else {
      // Default: get recent errors
      const defaultQuery = `AppExceptions | where TimeGenerated > ago(1h) | summarize count() by type, severityLevel | order by count_ desc | take 20`;
      const result = await client.queryWorkspace(workspaceId, defaultQuery, { duration: 'PT1H' });
      context.res = { status: 200, body: result.tables };
    }
  } catch (err) {
    context.log.error('Error querying logs:', err);
    context.res = { status: 500, body: { error: err.message } };
  }
};
