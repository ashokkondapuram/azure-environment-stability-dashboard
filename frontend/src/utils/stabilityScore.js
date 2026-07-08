/**
 * Calculates a composite stability score 0-100
 * @param {Array} alerts - Active alerts
 * @param {Array} health - Resource health statuses
 * @param {Array} metricBreaches - Metric threshold violations
 */
export function calculateStabilityScore(alerts = [], health = [], metricBreaches = []) {
  const criticalAlerts = alerts.filter(a => a.severity === 'Critical').length;
  const warningAlerts = alerts.filter(a => a.severity === 'Warning').length;
  const degradedResources = health.filter(h => h.status !== 'Available').length;
  const metricViolations = metricBreaches.length;

  const deductions = (criticalAlerts * 15) + (warningAlerts * 5) + (degradedResources * 10) + (metricViolations * 3);
  return Math.max(0, Math.min(100, 100 - deductions));
}

export function getScoreLabel(score) {
  if (score >= 85) return { label: 'Healthy', color: '#22c55e' };
  if (score >= 60) return { label: 'Degraded', color: '#f59e0b' };
  return { label: 'Critical', color: '#ef4444' };
}
