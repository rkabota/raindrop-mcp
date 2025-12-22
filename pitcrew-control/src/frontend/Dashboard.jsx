import React, { Fragment, useState, useEffect } from 'react';
import ForgeUI, {
  render,
  Text,
  Strong,
  Fragment as UIFragment,
  Heading,
  Button,
  StatusLozenge,
  Table,
  Head,
  Row,
  Cell,
  SectionMessage,
  Em,
  Code,
  Macro,
  useProductContext,
} from '@forge/ui';
import { invoke } from '@forge/bridge';

const Dashboard = () => {
  const context = useProductContext();
  const [telemetry, setTelemetry] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState(null);

  useEffect(async () => {
    await refreshTelemetry();
  }, []);

  const refreshTelemetry = async () => {
    setLoading(true);
    try {
      const result = await invoke('telemetry-updater', {
        projectKey: context.extension.project.key,
        useSeededData: true, // Set to false for real data
      });

      if (result.success) {
        setTelemetry(result.snapshot);
      }
    } catch (error) {
      console.error('Error refreshing telemetry:', error);
    }
    setLoading(false);
  };

  const askPitEngineer = async () => {
    setLoading(true);
    setAnalysis(null);
    try {
      const result = await invoke('pit-engineer', {});

      if (result.success) {
        setAnalysis(result.analysis);
      }
    } catch (error) {
      console.error('Error calling Pit Engineer:', error);
    }
    setLoading(false);
  };

  const applySuggestion = async () => {
    setApplying(true);
    setApplyResult(null);
    try {
      const result = await invoke('apply-suggestion', {});

      setApplyResult(result);
    } catch (error) {
      console.error('Error applying suggestion:', error);
      setApplyResult({
        success: false,
        error: error.message,
      });
    }
    setApplying(false);
  };

  if (loading && !telemetry) {
    return (
      <UIFragment>
        <Text>Loading PitCrew Control...</Text>
      </UIFragment>
    );
  }

  if (!telemetry) {
    return (
      <UIFragment>
        <SectionMessage title="No Telemetry Data" appearance="warning">
          <Text>Unable to load telemetry. Please refresh the page.</Text>
        </SectionMessage>
      </UIFragment>
    );
  }

  return (
    <UIFragment>
      {/* Header */}
      <Heading size="large">🏁 PitCrew Control™</Heading>
      <Text>
        <Em>Real-time race control for your Atlassian team</Em>
      </Text>

      {/* Race Status */}
      <Heading size="medium">Race Status</Heading>
      <StatusLozenge
        text={telemetry.raceStatus}
        appearance={
          telemetry.raceStatus === 'GREEN'
            ? 'success'
            : telemetry.raceStatus === 'YELLOW'
            ? 'moved'
            : 'removed'
        }
      />
      <Text>{telemetry.raceReason}</Text>

      {/* Telemetry Panels */}
      <Heading size="medium">Telemetry</Heading>

      {/* Sprint Velocity */}
      <Heading size="small">Sprint Velocity</Heading>
      <Table>
        <Head>
          <Cell>
            <Text>
              <Strong>Metric</Strong>
            </Text>
          </Cell>
          <Cell>
            <Text>
              <Strong>Value</Strong>
            </Text>
          </Cell>
        </Head>
        <Row>
          <Cell>
            <Text>Current</Text>
          </Cell>
          <Cell>
            <Text>{telemetry.sprint.velocity.current} points</Text>
          </Cell>
        </Row>
        <Row>
          <Cell>
            <Text>Baseline</Text>
          </Cell>
          <Cell>
            <Text>{telemetry.sprint.velocity.baseline} points</Text>
          </Cell>
        </Row>
        <Row>
          <Cell>
            <Text>Performance</Text>
          </Cell>
          <Cell>
            <Text>
              {Math.round(
                (telemetry.sprint.velocity.current / telemetry.sprint.velocity.baseline) * 100
              )}
              %
            </Text>
          </Cell>
        </Row>
      </Table>

      {/* Blockers */}
      <Heading size="small">Blockers</Heading>
      <Text>
        <Strong>Count:</Strong> {telemetry.blockers.count}
      </Text>
      {telemetry.blockers.top.length > 0 && (
        <UIFragment>
          <Text>
            <Strong>Top Blockers:</Strong>
          </Text>
          {telemetry.blockers.top.map((blocker) => (
            <Text>
              • <Code text={blocker.key} /> - {blocker.summary}
            </Text>
          ))}
        </UIFragment>
      )}

      {/* SLA Risk */}
      <Heading size="small">SLA Risk</Heading>
      <StatusLozenge
        text={telemetry.slaRisk.level}
        appearance={
          telemetry.slaRisk.level === 'LOW'
            ? 'success'
            : telemetry.slaRisk.level === 'MEDIUM'
            ? 'moved'
            : 'removed'
        }
      />
      {telemetry.slaRisk.breachEtaMinutes && (
        <Text>Breach ETA: {telemetry.slaRisk.breachEtaMinutes} minutes</Text>
      )}
      {telemetry.slaRisk.incidentKey && (
        <Text>
          Issue: <Code text={telemetry.slaRisk.incidentKey} />
        </Text>
      )}

      {/* Deploy Readiness */}
      <Heading size="small">Deployment Readiness</Heading>
      <StatusLozenge
        text={telemetry.deploy.ready ? 'READY' : 'NOT READY'}
        appearance={telemetry.deploy.ready ? 'success' : 'removed'}
      />
      {telemetry.deploy.failingPipelines.length > 0 && (
        <Text>Failing pipelines: {telemetry.deploy.failingPipelines.join(', ')}</Text>
      )}

      {/* Pit Engineer */}
      <Heading size="medium">Pit Engineer</Heading>
      <Button text="Ask Pit Engineer" onClick={askPitEngineer} disabled={loading} />

      {analysis && (
        <UIFragment>
          <SectionMessage
            title={`Risk Assessment: ${analysis.risk}`}
            appearance={
              analysis.risk === 'GREEN'
                ? 'info'
                : analysis.risk === 'YELLOW'
                ? 'warning'
                : 'error'
            }
          >
            <Text>
              <Strong>Recommended Action:</Strong>
            </Text>
            <Text>{analysis.action}</Text>
            <Text />
            <Text>
              <Strong>Reasoning:</Strong>
            </Text>
            <Text>{analysis.reason}</Text>
          </SectionMessage>

          {analysis.targetIssue && (
            <UIFragment>
              <Button
                text="Apply Suggestion"
                onClick={applySuggestion}
                disabled={applying}
                appearance="primary"
              />
            </UIFragment>
          )}
        </UIFragment>
      )}

      {applyResult && (
        <UIFragment>
          {applyResult.success ? (
            <SectionMessage title="✅ Suggestion Applied" appearance="confirmation">
              <Text>{applyResult.message}</Text>
              <Text>
                Applied to: <Code text={applyResult.appliedTo} />
              </Text>
              <Text>Actions: {applyResult.actions.join(', ')}</Text>
            </SectionMessage>
          ) : (
            <SectionMessage title="Error Applying Suggestion" appearance="error">
              <Text>{applyResult.error || applyResult.message}</Text>
            </SectionMessage>
          )}
        </UIFragment>
      )}

      {/* Footer */}
      <Text>
        <Em>Last updated: {new Date(telemetry.updatedAt).toLocaleString()}</Em>
      </Text>
      <Button text="Refresh Telemetry" onClick={refreshTelemetry} />
    </UIFragment>
  );
};

export default Dashboard;
