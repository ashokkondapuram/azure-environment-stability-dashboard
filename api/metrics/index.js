const { DefaultAzureCredential } = require('@azure/identity');
const { MetricsQueryClient } = require('@azure/monitor-query');

module.exports = async function (context, req) {
  try {
    const resourceId = req.query.resourceId;
    if (!resourceId) {
      context.res = { status: 400, body: { error: 'resourceId query param required' } };
      return;
    }

    const credential = new DefaultAzureCredential();
    const client = new MetricsQueryClient(credential);

    const result = await client.queryResource(
      resourceId,
      ['Percentage CPU', 'Available Memory Bytes'],
      {
        granularity: 'PT5M',
        duration: 'PT24H'
      }
    );

    // Transform to chart-friendly format
    const timeSeriesData = [];
    if (result.metrics.length > 0) {
      const cpuMetric = result.metrics.find(m => m.name === 'Percentage CPU');
      const memMetric = result.metrics.find(m => m.name === 'Available Memory Bytes');

      const cpuTs = cpuMetric?.timeseries?.[0]?.data || [];
      cpuTs.forEach((point, i) => {
        timeSeriesData.push({
          time: new Date(point.timeStamp).toLocaleTimeString(),
          cpu: Math.round(point.average || 0),
          memory: Math.round(((memMetric?.timeseries?.[0]?.data?.[i]?.average || 0) / 1073741824) * 100) / 100
        });
      });
    }

    context.res = { status: 200, body: timeSeriesData };
  } catch (err) {
    context.log.error('Error fetching metrics:', err);
    context.res = { status: 500, body: { error: err.message } };
  }
};
