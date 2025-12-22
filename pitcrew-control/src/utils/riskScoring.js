/**
 * Calculate overall race status based on telemetry signals
 * Returns: { status: 'GREEN'|'YELLOW'|'RED', reason: string }
 */
export function calculateRaceStatus(telemetry) {
  const risks = [];

  // Check SLA risk
  if (telemetry.slaRisk.level === 'HIGH') {
    risks.push({ severity: 3, reason: `SLA breach imminent (${telemetry.slaRisk.breachEtaMinutes}min)` });
  } else if (telemetry.slaRisk.level === 'MEDIUM') {
    risks.push({ severity: 2, reason: 'SLA at risk' });
  }

  // Check blockers
  if (telemetry.blockers.count >= 5) {
    risks.push({ severity: 3, reason: `${telemetry.blockers.count} blockers detected` });
  } else if (telemetry.blockers.count >= 2) {
    risks.push({ severity: 2, reason: `${telemetry.blockers.count} blockers` });
  }

  // Check velocity
  const velocityRatio = telemetry.sprint.velocity.current / telemetry.sprint.velocity.baseline;
  if (velocityRatio < 0.6) {
    risks.push({ severity: 3, reason: 'Sprint velocity critically low' });
  } else if (velocityRatio < 0.8) {
    risks.push({ severity: 2, reason: 'Sprint velocity below target' });
  }

  // Check deployment readiness
  if (!telemetry.deploy.ready && telemetry.deploy.failingPipelines.length > 2) {
    risks.push({ severity: 3, reason: `${telemetry.deploy.failingPipelines.length} pipelines failing` });
  } else if (!telemetry.deploy.ready && telemetry.deploy.failingPipelines.length > 0) {
    risks.push({ severity: 2, reason: 'Pipeline issues detected' });
  }

  // Determine overall status
  const maxSeverity = Math.max(...risks.map(r => r.severity), 0);

  if (maxSeverity >= 3) {
    const criticalRisks = risks.filter(r => r.severity === 3);
    return {
      status: 'RED',
      reason: criticalRisks.map(r => r.reason).join('; '),
    };
  } else if (maxSeverity >= 2) {
    const warnings = risks.filter(r => r.severity === 2);
    return {
      status: 'YELLOW',
      reason: warnings.map(r => r.reason).join('; '),
    };
  }

  return {
    status: 'GREEN',
    reason: 'All systems nominal',
  };
}

/**
 * Identify the highest priority risk and recommended action
 */
export function identifyTopRisk(telemetry) {
  // Priority order: SLA > Blockers > Velocity > Deploy

  if (telemetry.slaRisk.level === 'HIGH') {
    return {
      type: 'sla',
      severity: 'HIGH',
      issue: telemetry.slaRisk.incidentKey,
      description: `SLA breach in ${telemetry.slaRisk.breachEtaMinutes} minutes`,
    };
  }

  if (telemetry.slaRisk.level === 'MEDIUM') {
    return {
      type: 'sla',
      severity: 'MEDIUM',
      issue: telemetry.slaRisk.incidentKey,
      description: 'SLA at risk',
    };
  }

  if (telemetry.blockers.count > 0 && telemetry.blockers.top.length > 0) {
    return {
      type: 'blocker',
      severity: telemetry.blockers.count >= 5 ? 'HIGH' : 'MEDIUM',
      issue: telemetry.blockers.top[0].key,
      description: `${telemetry.blockers.count} blocker(s) detected`,
    };
  }

  const velocityRatio = telemetry.sprint.velocity.current / telemetry.sprint.velocity.baseline;
  if (velocityRatio < 0.8) {
    return {
      type: 'velocity',
      severity: velocityRatio < 0.6 ? 'HIGH' : 'MEDIUM',
      issue: null,
      description: `Velocity ${Math.round(velocityRatio * 100)}% of baseline`,
    };
  }

  if (!telemetry.deploy.ready) {
    return {
      type: 'deploy',
      severity: telemetry.deploy.failingPipelines.length > 2 ? 'HIGH' : 'MEDIUM',
      issue: null,
      description: `${telemetry.deploy.failingPipelines.length} pipeline(s) failing`,
    };
  }

  return {
    type: 'none',
    severity: 'LOW',
    issue: null,
    description: 'No significant risks detected',
  };
}
