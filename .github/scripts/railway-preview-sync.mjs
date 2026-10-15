#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const RAILWAY_API_URL =
  process.env.RAILWAY_API_URL ?? "https://backboard.railway.com/graphql/v2";
const DEPLOY_TRIGGER_SETTLE_MS = 5_000;

const TERMINAL_FAILURE_STATUSES = new Set(["FAILED", "CRASHED", "REMOVED"]);
const SKIPPED_STATUS = "SKIPPED";
const SUCCESS_STATUS = "SUCCESS";

const IN_PROGRESS_STATUSES = new Set([
  "QUEUED",
  "INITIALIZING",
  "BUILDING",
  "DEPLOYING",
  "WAITING",
  "NEEDS_APPROVAL",
]);

export function parseArgs(argv = process.argv.slice(2)) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.replace("--", "").replace(/-/g, "_");
    const next = argv[index + 1];
    if (next === undefined || next.startsWith("--")) {
      parsed[key] = "true";
      continue;
    }

    parsed[key] = next;
    index += 1;
  }

  return parsed;
}

export function resolveCommitSha(parsedArgs = {}) {
  return (
    parsedArgs.commit_sha ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    ""
  );
}

export function resolveGitBranch(parsedArgs = {}) {
  const githubRef = process.env.GITHUB_REF_NAME || "";
  const githubBranch = githubRef.startsWith("refs/heads/")
    ? githubRef.slice("refs/heads/".length)
    : githubRef;

  return (
    parsedArgs.git_branch ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    githubBranch ||
    ""
  );
}

export function resolveGitHubRepo() {
  if (process.env.RAILWAY_GITHUB_REPO) {
    return process.env.RAILWAY_GITHUB_REPO;
  }

  const owner = process.env.VERCEL_GIT_REPO_OWNER;
  const slug = process.env.VERCEL_GIT_REPO_SLUG;
  if (owner && slug) {
    return `${owner}/${slug}`;
  }

  return "impulse-studio/ultimate-template";
}

export function resolveRepoRoot() {
  if (process.env.REPO_ROOT) {
    return process.env.REPO_ROOT;
  }

  return join(dirname(fileURLToPath(import.meta.url)), "../..");
}

function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export function getTeamTokenFromEnvironment(
  environmentVariables = process.env,
) {
  const rawToken =
    environmentVariables.RAILWAY_TOKEN ||
    environmentVariables.RAILWAY_API_TOKEN;
  if (!rawToken) {
    return undefined;
  }

  return rawToken.trim().replace(/^["']|["']$/g, "");
}

function getTeamToken() {
  return getTeamTokenFromEnvironment(process.env);
}

export function parseJsonResponseBody(responseBody, response) {
  try {
    return JSON.parse(responseBody);
  } catch {
    const bodyPreview = responseBody
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 240);
    throw new Error(
      `Railway API returned non-JSON (HTTP ${response.status} ${response.statusText}): ${bodyPreview}`,
    );
  }
}

async function railwayRequest(query, variables = {}, attempt = 1) {
  const token = getTeamToken();

  if (!token) {
    throw new Error(
      "RAILWAY_TOKEN (or RAILWAY_API_TOKEN) environment variable is required",
    );
  }

  const response = await fetch(RAILWAY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const responseBody = await response.text();

  if (
    attempt < 3 &&
    (response.status === 502 ||
      response.status === 503 ||
      response.status === 504)
  ) {
    await sleep(2000 * attempt);
    return railwayRequest(query, variables, attempt + 1);
  }

  const result = parseJsonResponseBody(responseBody, response);
  return result;
}

async function railwayQuery(query, variables = {}) {
  const result = await railwayRequest(query, variables);

  if (result.errors) {
    throw new Error(`Railway API error: ${JSON.stringify(result.errors)}`);
  }

  return result.data;
}

async function getProjectEnvironments(projectId) {
  const query = `
    query GetProject($projectId: String!) {
      project(id: $projectId) {
        id
        name
        environments {
          edges {
            node {
              id
              name
              isEphemeral
            }
          }
        }
      }
    }
  `;

  const data = await railwayQuery(query, { projectId });
  return data.project.environments.edges.map((edge) => edge.node);
}

async function findEnvironmentByName(projectId, environmentName) {
  const environments = await getProjectEnvironments(projectId);
  return environments.find(
    (environment) =>
      environment.name.toLowerCase() === environmentName.toLowerCase(),
  );
}

export function isPullRequestEnvironmentName(environmentName) {
  return /^pr-/i.test(environmentName ?? "");
}

// A Railway environment is ONLY ever production | dev | pr-<N> (N numeric).
// Defense in depth: refuse to deploy to anything else (e.g. a raw branch name)
// so a misconfigured caller can never spin up a branch-named environment.
export function assertCanonicalEnvironmentName(environmentName) {
  const name = (environmentName ?? "").toLowerCase();
  if (name === "production" || name === "dev" || /^pr-\d+$/.test(name)) {
    return;
  }
  throw new Error(
    `Refusing to deploy: Railway environment "${environmentName}" is not one of ` +
      "production | dev | pr-<N>. Branch-named environments are never allowed.",
  );
}

export function resolveEnvironmentCloneSourceName(environmentName) {
  if (isPullRequestEnvironmentName(environmentName)) {
    return "dev";
  }

  return "production";
}

export function resolveRailwayVariableFallbackEnvironmentName(environmentName) {
  if (isPullRequestEnvironmentName(environmentName)) {
    return "dev";
  }

  const normalizedName = environmentName?.toLowerCase() ?? "";
  if (normalizedName === "production" || normalizedName === "prod") {
    return undefined;
  }

  return "production";
}

function findEnvironmentByAliases(projectId, aliases) {
  const normalizedAliases = new Set(
    aliases.map((alias) => alias.toLowerCase()),
  );

  return getProjectEnvironments(projectId).then((environments) =>
    environments.find(
      (environment) =>
        !environment.isEphemeral &&
        normalizedAliases.has(environment.name.toLowerCase()),
    ),
  );
}

async function findProductionEnvironment(projectId) {
  const productionEnvironment = await findEnvironmentByAliases(projectId, [
    "production",
    "prod",
  ]);

  if (!productionEnvironment) {
    const environments = await getProjectEnvironments(projectId);
    const nonEphemeralEnvironment = environments.find(
      (environment) => !environment.isEphemeral,
    );
    if (nonEphemeralEnvironment) {
      console.log(
        `⚠ No "production" environment found, using "${nonEphemeralEnvironment.name}" as source`,
      );
      return nonEphemeralEnvironment;
    }
    throw new Error("No production or non-ephemeral environment found");
  }

  return productionEnvironment;
}

async function findDevEnvironment(projectId) {
  const devEnvironment = await findEnvironmentByAliases(projectId, ["dev"]);
  if (devEnvironment) {
    return devEnvironment;
  }

  console.log(
    '⚠ No "dev" environment found, falling back to production as clone source',
  );
  return findProductionEnvironment(projectId);
}

async function resolveEnvironmentCloneSource(projectId, environmentName) {
  const cloneSourceName = resolveEnvironmentCloneSourceName(environmentName);
  if (cloneSourceName === "dev") {
    return findDevEnvironment(projectId);
  }

  return findProductionEnvironment(projectId);
}

async function createEnvironment(projectId, name, sourceEnvironmentId) {
  const mutation = `
    mutation EnvironmentCreate($input: EnvironmentCreateInput!) {
      environmentCreate(input: $input) {
        id
        name
      }
    }
  `;

  const data = await railwayQuery(mutation, {
    input: {
      projectId,
      name,
      sourceEnvironmentId,
    },
  });

  return data.environmentCreate;
}

async function deleteEnvironment(environmentId) {
  const mutation = `
    mutation EnvironmentDelete($id: String!) {
      environmentDelete(id: $id)
    }
  `;

  await railwayQuery(mutation, { id: environmentId });
}

const RAILWAY_SYNC_VARIABLES_FROM_VERCEL = [
  "DATABASE_URL",
  "REDIS_URL",
  "REALTIME_SECRET_KEY",
  "VERCEL_AUTOMATION_BYPASS_SECRET",
  "BLOB_STORE_ID",
];

const VERCEL_SHARED_SECRET_VARIABLES = new Set([
  "REALTIME_SECRET_KEY",
  "VERCEL_AUTOMATION_BYPASS_SECRET",
]);

const REQUIRED_RAILWAY_SYNC_VARIABLES = new Set(["REALTIME_SECRET_KEY"]);

const KEEP_EXISTING_ON_TARGET_VARIABLES = new Set([
  "REALTIME_SECRET_KEY",
  "VERCEL_AUTOMATION_BYPASS_SECRET",
]);

const DEFAULT_WEBSOCKET_LISTEN_PORT = "3001";
const DEFAULT_TCP_LISTEN_PORT = "9000";

const RAILWAY_INFRA_VARIABLES = {
  WS_PORT: DEFAULT_WEBSOCKET_LISTEN_PORT,
  PORT: DEFAULT_WEBSOCKET_LISTEN_PORT,
  TCP_PORT: DEFAULT_TCP_LISTEN_PORT,
};

function escapeShellValue(value) {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function printShellExports(realtimeUrls) {
  console.log(
    `export NEXT_PUBLIC_REALTIME_WS_URL=${escapeShellValue(realtimeUrls.wsUrl)}`,
  );
  console.log(
    `export REALTIME_TCP_URL=${escapeShellValue(realtimeUrls.tcpUrl)}`,
  );
}

export function resolveVercelEnvLookupTargets(variableName) {
  const vercelEnv = process.env.VERCEL_ENV || "preview";

  if (vercelEnv === "production") {
    return ["production"];
  }

  if (VERCEL_SHARED_SECRET_VARIABLES.has(variableName)) {
    return ["preview", "development", "production"];
  }

  return ["preview", "development"];
}

function resolveVercelProjectApiConfig() {
  const vercelToken = process.env.VERCEL_TOKEN?.trim();
  const vercelProjectId = process.env.VERCEL_PROJECT_ID?.trim();
  const vercelOrgId =
    process.env.VERCEL_ORG_ID?.trim() || process.env.VERCEL_TEAM_ID?.trim();

  if (!vercelToken || !vercelProjectId) {
    return undefined;
  }

  return {
    vercelToken,
    vercelProjectId,
    vercelOrgId,
  };
}

async function fetchVercelProjectEnvVariable(variableName, lookupTargets) {
  const vercelApiConfig = resolveVercelProjectApiConfig();
  if (!vercelApiConfig) {
    return undefined;
  }

  const teamQuery = vercelApiConfig.vercelOrgId
    ? `&teamId=${encodeURIComponent(vercelApiConfig.vercelOrgId)}`
    : "";
  const response = await fetch(
    `https://api.vercel.com/v10/projects/${vercelApiConfig.vercelProjectId}/env?decrypt=true${teamQuery}`,
    {
      headers: {
        Authorization: `Bearer ${vercelApiConfig.vercelToken}`,
      },
    },
  );

  if (!response.ok) {
    console.log(
      `   warn: Vercel env API returned HTTP ${response.status} while resolving ${variableName}`,
    );
    return undefined;
  }

  const payload = await response.json();
  const environmentEntries = payload.envs ?? payload.env ?? [];

  for (const lookupTarget of lookupTargets) {
    const matchingEntry = environmentEntries.find(
      (entry) =>
        entry.key === variableName &&
        (entry.target?.includes(lookupTarget) ||
          entry.type === lookupTarget ||
          entry.environment === lookupTarget),
    );

    if (matchingEntry?.value) {
      return matchingEntry.value;
    }
  }

  return undefined;
}

async function fetchRailwayServiceVariable(
  projectId,
  environmentId,
  serviceId,
  variableName,
) {
  const query = `
    query RailwayServiceVariables(
      $projectId: String!
      $environmentId: String!
      $serviceId: String!
    ) {
      variables(
        projectId: $projectId
        environmentId: $environmentId
        serviceId: $serviceId
      )
    }
  `;

  const data = await railwayQuery(query, {
    projectId,
    environmentId,
    serviceId,
  });

  return data.variables?.[variableName];
}

async function resolveRailwaySyncVariableValue(
  variableName,
  syncContext,
) {
  const buildEnvValue = process.env[variableName];
  if (buildEnvValue) {
    return buildEnvValue;
  }

  const { projectId, serviceId, environmentId, environmentName } = syncContext;

  if (KEEP_EXISTING_ON_TARGET_VARIABLES.has(variableName)) {
    const existingTargetValue = await fetchRailwayServiceVariable(
      projectId,
      environmentId,
      serviceId,
      variableName,
    );
    if (existingTargetValue) {
      console.log(
        `   keeping existing ${variableName} on Railway ${environmentName}`,
      );
      return existingTargetValue;
    }
  }

  const vercelValue = await fetchVercelProjectEnvVariable(
    variableName,
    resolveVercelEnvLookupTargets(variableName),
  );
  if (vercelValue) {
    console.log(`   resolved ${variableName} from Vercel project env API`);
    return vercelValue;
  }

  const isNonProductionTarget =
    environmentName &&
    environmentName.toLowerCase() !== "production" &&
    environmentName.toLowerCase() !== "prod";

  if (isNonProductionTarget) {
    const fallbackEnvironmentName =
      resolveRailwayVariableFallbackEnvironmentName(environmentName);
    const fallbackEnvironment = fallbackEnvironmentName
      ? await findEnvironmentByName(projectId, fallbackEnvironmentName)
      : undefined;

    if (fallbackEnvironment && fallbackEnvironment.id !== environmentId) {
      const fallbackValue = await fetchRailwayServiceVariable(
        projectId,
        fallbackEnvironment.id,
        serviceId,
        variableName,
      );
      if (fallbackValue) {
        console.log(
          `   resolved ${variableName} from Railway ${fallbackEnvironment.name} environment`,
        );
        return fallbackValue;
      }
    }

    const productionEnvironment = await findProductionEnvironment(projectId);
    if (
      productionEnvironment &&
      productionEnvironment.id !== environmentId &&
      productionEnvironment.id !== fallbackEnvironment?.id
    ) {
      const productionValue = await fetchRailwayServiceVariable(
        projectId,
        productionEnvironment.id,
        serviceId,
        variableName,
      );
      if (productionValue) {
        console.log(
          `   resolved ${variableName} from Railway production environment`,
        );
        return productionValue;
      }
    }
  }

  return undefined;
}

function formatVariableLogValue(value) {
  return value.length > 50
    ? `${value.substring(0, 30)}...${value.slice(-10)}`
    : value;
}

async function stageEnvironmentServiceConfig(
  environmentId,
  serviceId,
  serviceConfig,
) {
  const mutation = `
    mutation StageEnvironmentChanges(
      $environmentId: String!
      $input: EnvironmentConfig!
      $merge: Boolean
    ) {
      environmentStageChanges(
        environmentId: $environmentId
        input: $input
        merge: $merge
      ) {
        id
      }
    }
  `;

  await railwayQuery(mutation, {
    environmentId,
    input: {
      services: {
        [serviceId]: serviceConfig,
      },
    },
    merge: true,
  });
}

async function stageEnvironmentServiceVariables(
  environmentId,
  serviceId,
  variablesToApply,
) {
  const variablesInput = Object.fromEntries(
    Object.entries(variablesToApply).map(([variableName, variableValue]) => [
      variableName,
      { value: variableValue },
    ]),
  );

  await stageEnvironmentServiceConfig(environmentId, serviceId, {
    variables: variablesInput,
  });
}

async function syncRailwayDeployVariables(
  projectId,
  environmentId,
  serviceId,
  environmentName,
  apiUrl,
) {
  console.log(
    "\nSyncing Railway deploy variables from Vercel build env (batched, no deploy)...",
  );
  await waitForServiceDeployIdle(projectId, environmentId, serviceId);

  const syncContext = {
    projectId,
    serviceId,
    environmentId,
    environmentName,
  };

  const variablesToApply = {};

  for (const variableName of RAILWAY_SYNC_VARIABLES_FROM_VERCEL) {
    const variableValue = await resolveRailwaySyncVariableValue(
      variableName,
      syncContext,
    );
    if (!variableValue) {
      console.log(
        `   skip ${variableName} (not in build env, Vercel API, or Railway production)`,
      );
      if (REQUIRED_RAILWAY_SYNC_VARIABLES.has(variableName)) {
        throw new Error(
          `${variableName} is required on Railway but was not found. Add it to Vercel (Production at minimum; Preview recommended) or Railway production.`,
        );
      }
      continue;
    }

    variablesToApply[variableName] = variableValue;
  }

  for (const [variableName, variableValue] of Object.entries(
    RAILWAY_INFRA_VARIABLES,
  )) {
    variablesToApply[variableName] = variableValue;
  }

  if (apiUrl) {
    variablesToApply.API_URL = apiUrl;
  }

  if (Object.keys(variablesToApply).length === 0) {
    console.log("   no Railway variables to sync");
    return;
  }

  await stageEnvironmentServiceVariables(
    environmentId,
    serviceId,
    variablesToApply,
  );
  await applyStagedEnvironmentChangesWithoutDeploy(
    environmentId,
    `sync ${Object.keys(variablesToApply).length} deploy variables (preview sync, no deploy)`,
  );

  for (const [variableName, variableValue] of Object.entries(
    variablesToApply,
  )) {
    console.log(`✓ Set ${variableName}=${formatVariableLogValue(variableValue)}`);
  }
}

async function resolveServiceRealtimeUrls(projectId, environmentId, serviceId) {
  const query = `
    query ResolveServiceRealtimeUrls(
      $projectId: String!
      $environmentId: String!
      $serviceId: String!
    ) {
      domains(
        projectId: $projectId
        environmentId: $environmentId
        serviceId: $serviceId
      ) {
        serviceDomains {
          domain
        }
      }
      tcpProxies(environmentId: $environmentId, serviceId: $serviceId) {
        domain
        proxyPort
        applicationPort
      }
    }
  `;

  const data = await railwayQuery(query, {
    projectId,
    environmentId,
    serviceId,
  });

  const serviceDomain = data.domains?.serviceDomains?.[0]?.domain;
  if (!serviceDomain) {
    throw new Error(
      "Could not resolve Railway public domain — assign a Railway domain to the realtime service",
    );
  }

  const tcpProxies = data.tcpProxies ?? [];
  const preferredTcpPort = Number(process.env.TCP_PORT || 9000);
  const matchingTcpProxy =
    tcpProxies.find(
      (tcpProxy) => tcpProxy.applicationPort === preferredTcpPort,
    ) ?? tcpProxies[0];

  if (!matchingTcpProxy?.domain || !matchingTcpProxy?.proxyPort) {
    throw new Error(
      "Could not resolve Railway TCP proxy — enable TCP proxy on the realtime service",
    );
  }

  return {
    wsUrl: `https://${serviceDomain}`,
    tcpUrl: `tcp://${matchingTcpProxy.domain}:${matchingTcpProxy.proxyPort}`,
  };
}

async function waitForServiceDeployIdle(
  projectId,
  environmentId,
  serviceId,
  timeoutMs = 900_000,
) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const latestDeployment = await getLatestDeployment(
      projectId,
      environmentId,
      serviceId,
    );
    const deploymentStatus = latestDeployment?.status;

    if (
      !deploymentStatus ||
      deploymentStatus === SUCCESS_STATUS ||
      deploymentStatus === SKIPPED_STATUS ||
      TERMINAL_FAILURE_STATUSES.has(deploymentStatus)
    ) {
      return;
    }

    if (IN_PROGRESS_STATUSES.has(deploymentStatus)) {
      console.log(
        `   waiting for in-progress Railway deployment (${latestDeployment.id}: ${deploymentStatus})...`,
      );
      await sleep(10_000);
      continue;
    }

    return;
  }

  throw new Error(
    `Timed out waiting for Railway service to become idle before syncing variables`,
  );
}

async function getEnvironmentServiceSourceConfig(environmentId, serviceId) {
  const query = `
    query EnvironmentServiceSourceConfig($environmentId: String!) {
      environment(id: $environmentId) {
        config(decryptVariables: false)
      }
    }
  `;

  const data = await railwayQuery(query, { environmentId });
  return data.environment?.config?.services?.[serviceId]?.source;
}

async function getServiceInstanceSummary(serviceId, environmentId) {
  const query = `
    query ServiceInstanceSummary($serviceId: String!, $environmentId: String!) {
      serviceInstance(serviceId: $serviceId, environmentId: $environmentId) {
        source {
          repo
        }
        latestDeployment {
          id
          status
        }
      }
    }
  `;

  const data = await railwayQuery(query, { serviceId, environmentId });
  const serviceInstance = data.serviceInstance;
  const environmentSourceConfig = await getEnvironmentServiceSourceConfig(
    environmentId,
    serviceId,
  );

  return {
    ...serviceInstance,
    source: {
      repo:
        environmentSourceConfig?.repo ?? serviceInstance?.source?.repo ?? null,
      branch: environmentSourceConfig?.branch ?? null,
    },
  };
}

async function runBestEffortRailwayStep(stepLabel, step) {
  try {
    await step();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.log(`   warn: ${stepLabel} skipped (${errorMessage})`);
  }
}

async function deleteDeploymentTrigger(triggerId) {
  const mutation = `
    mutation DeploymentTriggerDelete($triggerId: String!) {
      deploymentTriggerDelete(id: $triggerId)
    }
  `;

  await railwayQuery(mutation, { triggerId });
}

async function getServiceDeploymentTriggers(environmentId, serviceId) {
  const deploymentTriggers =
    await getDeploymentTriggersForEnvironment(environmentId);
  return deploymentTriggers.filter((trigger) => trigger.serviceId === serviceId);
}

async function removeGitHubDeploymentTriggers(environmentId, serviceId) {
  const serviceTriggers = await getServiceDeploymentTriggers(
    environmentId,
    serviceId,
  );

  if (serviceTriggers.length === 0) {
    console.log("   no GitHub deployment triggers on service");
    return 0;
  }

  for (const trigger of serviceTriggers) {
    console.log(
      `   removing deployment trigger ${trigger.id} (${trigger.repository}@${trigger.branch})`,
    );
    await deleteDeploymentTrigger(trigger.id);
  }

  return serviceTriggers.length;
}

async function enforceNoGitHubDeploymentTriggers(environmentId, serviceId) {
  const remainingTriggers = await getServiceDeploymentTriggers(
    environmentId,
    serviceId,
  );

  if (remainingTriggers.length === 0) {
    console.log("   verified: no GitHub deployment triggers remain");
    return;
  }

  const triggerSummary = remainingTriggers
    .map(
      (trigger) =>
        `${trigger.id} (${trigger.repository}@${trigger.branch})`,
    )
    .join(", ");

  throw new Error(
    `GitHub autodeploy still active (${remainingTriggers.length} trigger(s): ${triggerSummary}) — disable autodeploy in Railway dashboard and retry`,
  );
}

async function stageEnvironmentServiceSourceBranch(
  environmentId,
  serviceId,
  gitHubRepo,
  gitBranch,
) {
  await stageEnvironmentServiceConfig(environmentId, serviceId, {
    source: {
      repo: gitHubRepo,
      branch: gitBranch,
    },
  });
}

async function applyStagedEnvironmentChangesWithoutDeploy(
  environmentId,
  commitMessage,
) {
  const mutation = `
    mutation EnvironmentPatchCommitStaged(
      $environmentId: String!
      $message: String
      $skipDeploys: Boolean
    ) {
      environmentPatchCommitStaged(
        environmentId: $environmentId
        commitMessage: $message
        skipDeploys: $skipDeploys
      )
    }
  `;

  await railwayQuery(mutation, {
    environmentId,
    message: commitMessage,
    skipDeploys: true,
  });
}

async function updateServiceGitBranchWithoutDeploy(
  environmentId,
  serviceId,
  gitHubRepo,
  gitBranch,
) {
  const currentSourceConfig = await getEnvironmentServiceSourceConfig(
    environmentId,
    serviceId,
  );

  if (
    currentSourceConfig?.branch === gitBranch &&
    currentSourceConfig?.repo === gitHubRepo
  ) {
    console.log(`   branch already set to ${gitHubRepo}@${gitBranch}`);
    return;
  }

  await stageEnvironmentServiceSourceBranch(
    environmentId,
    serviceId,
    gitHubRepo,
    gitBranch,
  );
  await applyStagedEnvironmentChangesWithoutDeploy(
    environmentId,
    `set branch to ${gitBranch} (preview sync, no deploy)`,
  );
  console.log(`✓ Set GitHub branch to ${gitBranch} (skipDeploys)`);
}

async function verifyServiceGitBranch(
  environmentId,
  serviceId,
  gitBranch,
  timeoutMs = 60_000,
) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const sourceConfig = await getEnvironmentServiceSourceConfig(
      environmentId,
      serviceId,
    );

    if (sourceConfig?.branch === gitBranch) {
      console.log(`   verified GitHub branch: ${gitBranch}`);
      return;
    }

    console.log(
      `   waiting for Railway branch to update (current=${sourceConfig?.branch ?? "unset"}, expected=${gitBranch})...`,
    );
    await sleep(3_000);
  }

  const finalSourceConfig = await getEnvironmentServiceSourceConfig(
    environmentId,
    serviceId,
  );

  throw new Error(
    `Railway branch is "${finalSourceConfig?.branch ?? "unset"}" but expected "${gitBranch}"`,
  );
}

async function preparePullRequestEnvironment({
  projectId,
  environmentId,
  serviceId,
  gitBranch,
  environmentWasCreated,
  environmentName,
}) {
  const gitHubRepo = resolveGitHubRepo();

  console.log(
    `\nPreparing PR Railway environment ${environmentName} (clone gate before deploy)...`,
  );

  if (!gitBranch) {
    throw new Error(
      "gitBranch is required for PR Railway environments (VERCEL_GIT_COMMIT_REF or --git-branch)",
    );
  }

  if (environmentWasCreated) {
    console.log(
      "   waiting for clone-initiated deployment to settle (no controlled deploy yet)...",
    );
    await waitForServiceDeployIdle(projectId, environmentId, serviceId);
  }

  console.log(`\nSetting GitHub branch to ${gitBranch} (no deploy)...`);
  await updateServiceGitBranchWithoutDeploy(
    environmentId,
    serviceId,
    gitHubRepo,
    gitBranch,
  );
  await verifyServiceGitBranch(environmentId, serviceId, gitBranch);

  console.log("\nDisabling GitHub autodeploy (removing deployment triggers)...");
  await removeGitHubDeploymentTriggers(environmentId, serviceId);
  await enforceNoGitHubDeploymentTriggers(environmentId, serviceId);

  const serviceInstance = await getServiceInstanceSummary(
    serviceId,
    environmentId,
  );
  if (!serviceInstance?.source?.repo) {
    throw new Error(
      `Railway service is not connected to GitHub repo ${gitHubRepo} — reconnect in Railway dashboard`,
    );
  }

  console.log(
    `✓ PR environment ready: ${serviceInstance.source.repo}@${gitBranch}, autodeploy off`,
  );
}

async function disconnectServiceGitHubSource(serviceId) {
  const mutation = `
    mutation ServiceDisconnect($serviceId: String!) {
      serviceDisconnect(id: $serviceId) {
        id
      }
    }
  `;

  await railwayQuery(mutation, { serviceId });
  console.log("✓ Disconnected Railway service from GitHub source");
}

async function disableGitHubAutodeployOnService(
  projectId,
  environmentId,
  serviceId,
) {
  console.log(
    "\nDisabling Railway GitHub autodeploy (CLI-only deploy policy)...",
  );

  await runBestEffortRailwayStep("remove deployment triggers", async () => {
    await removeGitHubDeploymentTriggers(environmentId, serviceId);
  });

  await runBestEffortRailwayStep("disconnect GitHub source", async () => {
    await disconnectServiceGitHubSource(serviceId);
  });

  await runBestEffortRailwayStep("verify GitHub source disconnected", async () => {
    const serviceInstance = await getServiceInstanceSummary(
      serviceId,
      environmentId,
    );
    if (serviceInstance?.source?.repo) {
      console.log(
        `   warn: service still reports GitHub repo ${serviceInstance.source.repo} — disconnect manually in Railway dashboard if autodeploy persists`,
      );
    }
  });
}

async function deployServiceInstanceWithCommitSha({
  serviceId,
  environmentId,
  commitSha,
}) {
  const mutation = `
    mutation ServiceInstanceDeployV2(
      $serviceId: String!
      $environmentId: String!
      $commitSha: String
    ) {
      serviceInstanceDeployV2(
        serviceId: $serviceId
        environmentId: $environmentId
        commitSha: $commitSha
      )
    }
  `;

  const data = await railwayQuery(mutation, {
    serviceId,
    environmentId,
    commitSha,
  });

  const deploymentId = data.serviceInstanceDeployV2;
  if (!deploymentId) {
    throw new Error(
      "serviceInstanceDeployV2 returned no deployment id — is GitHub connected with autodeploy disabled?",
    );
  }

  return deploymentId;
}

async function ensureGitHubDeployPreconditions(
  projectId,
  environmentId,
  serviceId,
  gitBranch,
) {
  const serviceInstance = await getServiceInstanceSummary(
    serviceId,
    environmentId,
  );
  const connectedRepo = serviceInstance?.source?.repo;

  if (!connectedRepo) {
    throw new Error(
      "Railway service is not connected to GitHub — reconnect the repo in Railway (Service → Source) with autodeploy disabled, then retry",
    );
  }

  console.log(`   GitHub source connected: ${connectedRepo}`);

  if (gitBranch && serviceInstance?.source?.branch) {
    console.log(`   GitHub branch: ${serviceInstance.source.branch}`);
    if (serviceInstance.source.branch !== gitBranch) {
      throw new Error(
        `Railway branch "${serviceInstance.source.branch}" does not match PR branch "${gitBranch}"`,
      );
    }
  }

  await enforceNoGitHubDeploymentTriggers(environmentId, serviceId);
}

async function triggerGitHubCommitDeploy({
  projectId,
  serviceId,
  environmentId,
  commitSha,
  gitBranch,
}) {
  if (!commitSha) {
    throw new Error(
      "commitSha is required for GitHub API deploy (VERCEL_GIT_COMMIT_SHA)",
    );
  }

  console.log("\nWaiting for any in-progress Railway deployment to finish...");
  await waitForServiceDeployIdle(projectId, environmentId, serviceId);

  console.log("\nVerifying Railway GitHub source (autodeploy must be off)...");
  await ensureGitHubDeployPreconditions(
    projectId,
    environmentId,
    serviceId,
    gitBranch,
  );

  const previousDeployment = await getLatestDeployment(
    projectId,
    environmentId,
    serviceId,
  );

  console.log(
    `\nDeploying via Railway GitHub API (serviceInstanceDeployV2, sha=${commitSha.slice(0, 7)})...`,
  );

  const deploymentId = await deployServiceInstanceWithCommitSha({
    serviceId,
    environmentId,
    commitSha,
  });

  const resolvedDeploymentId = await resolveLatestDeploymentId(
    projectId,
    environmentId,
    serviceId,
    previousDeployment?.id ?? null,
  );

  const trackedDeploymentId = resolvedDeploymentId ?? deploymentId;
  console.log(`✓ GitHub API deploy started: ${trackedDeploymentId}`);
  return trackedDeploymentId;
}

async function getDeploymentTriggersForEnvironment(environmentId) {
  const query = `
    query EnvironmentDeploymentTriggers($environmentId: String!) {
      environment(id: $environmentId) {
        id
        name
        deploymentTriggers {
          edges {
            node {
              id
              branch
              serviceId
              repository
            }
          }
        }
      }
    }
  `;

  const data = await railwayQuery(query, { environmentId });
  return data.environment?.deploymentTriggers?.edges?.map((edge) => edge.node) ?? [];
}

async function getLatestDeployment(projectId, environmentId, serviceId) {
  const query = `
    query LatestDeployment(
      $projectId: String!
      $environmentId: String!
      $serviceId: String!
    ) {
      deployments(
        first: 1
        input: {
          projectId: $projectId
          environmentId: $environmentId
          serviceId: $serviceId
        }
      ) {
        edges {
          node {
            id
            status
            createdAt
          }
        }
      }
    }
  `;

  const data = await railwayQuery(query, {
    projectId,
    environmentId,
    serviceId,
  });

  return data.deployments.edges[0]?.node ?? null;
}

async function resolveLatestDeploymentId(
  projectId,
  environmentId,
  serviceId,
  previousDeploymentId = null,
) {
  await sleep(DEPLOY_TRIGGER_SETTLE_MS);
  const latestDeployment = await getLatestDeployment(
    projectId,
    environmentId,
    serviceId,
  );

  if (!latestDeployment) {
    return null;
  }

  if (
    previousDeploymentId &&
    latestDeployment.id === previousDeploymentId
  ) {
    return null;
  }

  return latestDeployment.id;
}

async function getDeploymentStatus(deploymentId) {
  const query = `
    query DeploymentStatus($deploymentId: String!) {
      deployment(id: $deploymentId) {
        id
        status
      }
    }
  `;

  const data = await railwayQuery(query, { deploymentId });
  return data.deployment;
}

async function resolveOrCreateEnvironment(projectId, environmentName) {
  console.log(`Looking for environment: ${environmentName}...`);
  let environment = await findEnvironmentByName(projectId, environmentName);

  if (environment) {
    console.log(`Found environment: ${environment.name} (${environment.id})`);
    return { environment, wasCreated: false };
  }

  console.log("No environment found, creating new one...");
  const cloneSourceEnvironment = await resolveEnvironmentCloneSource(
    projectId,
    environmentName,
  );
  console.log(
    `Source environment: ${cloneSourceEnvironment.name} (${cloneSourceEnvironment.id})`,
  );

  environment = await createEnvironment(
    projectId,
    environmentName,
    cloneSourceEnvironment.id,
  );
  console.log(`✓ Created environment: ${environment.name} (${environment.id})`);
  return { environment, wasCreated: true };
}

async function triggerCommitDeploy({
  projectId,
  serviceId,
  environmentId,
  commitSha,
  gitBranch,
}) {
  const deploymentId = await triggerGitHubCommitDeploy({
    projectId,
    serviceId,
    environmentId,
    commitSha,
    gitBranch,
  });

  const deployment = await getDeploymentStatus(deploymentId);
  console.log(
    `✓ Triggered deployment ${deploymentId} (status=${deployment?.status ?? "unknown"})`,
  );
  return deploymentId;
}

async function handleProbe(projectId, serviceId, environmentName) {
  const environment = await findEnvironmentByName(projectId, environmentName);
  if (!environment) {
    console.log(JSON.stringify({ environmentName, found: false }, null, 2));
    return;
  }

  const deploymentTriggers = await getDeploymentTriggersForEnvironment(
    environment.id,
  );
  const latestDeployment = await getLatestDeployment(
    projectId,
    environment.id,
    serviceId,
  );
  const serviceInstance = await getServiceInstanceSummary(
    serviceId,
    environment.id,
  );

  console.log(
    JSON.stringify(
      {
        environment: {
          id: environment.id,
          name: environment.name,
        },
        githubRepo: resolveGitHubRepo(),
        serviceInstance,
        deploymentTriggers: deploymentTriggers.filter(
          (trigger) => trigger.serviceId === serviceId,
        ),
        latestDeployment,
      },
      null,
      2,
    ),
  );
}

async function waitForDeployment(deploymentId, timeoutMs) {
  const startedAt = Date.now();
  let lastStatus = "";

  while (Date.now() - startedAt < timeoutMs) {
    const deployment = await getDeploymentStatus(deploymentId);
    if (!deployment) {
      throw new Error(`Deployment ${deploymentId} not found`);
    }

    if (deployment.status !== lastStatus) {
      console.log(`   Railway deployment ${deploymentId}: ${deployment.status}`);
      lastStatus = deployment.status;
    }

    if (deployment.status === SUCCESS_STATUS) {
      console.log(`✅ Railway deployment ${deploymentId} succeeded`);
      return;
    }

    if (deployment.status === SKIPPED_STATUS) {
      console.log(
        `✅ Railway deployment ${deploymentId} skipped (no watched file changes)`,
      );
      return;
    }

    if (TERMINAL_FAILURE_STATUSES.has(deployment.status)) {
      throw new Error(
        `Railway deployment ${deploymentId} failed with status ${deployment.status}`,
      );
    }

    if (
      !IN_PROGRESS_STATUSES.has(deployment.status) &&
      deployment.status !== SUCCESS_STATUS
    ) {
      console.log(
        `   Unknown Railway status "${deployment.status}" — continuing to poll`,
      );
    }

    await sleep(10_000);
  }

  throw new Error(
    `Timed out after ${timeoutMs}ms waiting for Railway deployment ${deploymentId}`,
  );
}

function writeStateFile(stateFilePath, state) {
  writeFileSync(stateFilePath, `${JSON.stringify(state, null, 2)}\n`, "utf-8");
}

function readStateFile(stateFilePath) {
  const raw = readFileSync(stateFilePath, "utf-8");
  return JSON.parse(raw);
}

async function handleStart(
  projectId,
  serviceId,
  environmentName,
  apiUrl,
  stateFilePath,
  commitSha,
  gitBranch,
) {
  const { environment, wasCreated } = await resolveOrCreateEnvironment(
    projectId,
    environmentName,
  );

  if (isPullRequestEnvironmentName(environmentName)) {
    await preparePullRequestEnvironment({
      projectId,
      environmentId: environment.id,
      serviceId,
      gitBranch,
      environmentWasCreated: wasCreated,
      environmentName,
    });
  }

  if (apiUrl) {
    await syncRailwayDeployVariables(
      projectId,
      environment.id,
      serviceId,
      environmentName,
      apiUrl,
    );
  }

  const deploymentId = await triggerCommitDeploy({
    projectId,
    serviceId,
    environmentId: environment.id,
    commitSha,
    gitBranch,
  });

  const state = {
    deploymentId,
    projectId,
    environmentId: environment.id,
    serviceId,
    environmentName,
    apiUrl,
    commitSha,
    gitBranch,
    deployMethod: "github-api",
  };

  writeStateFile(stateFilePath, state);
  console.log(`\n✓ Wrote deploy state to ${stateFilePath}`);
  console.log(`RAILWAY_DEPLOYMENT_ID=${deploymentId}`);
}

async function handleWait(stateFilePath, timeoutMs) {
  const state = readStateFile(stateFilePath);
  if (!state.deploymentId) {
    throw new Error(`State file ${stateFilePath} is missing deploymentId`);
  }

  console.log(
    `\nWaiting for Railway deployment ${state.deploymentId} (env=${state.environmentName})...`,
  );
  await waitForDeployment(state.deploymentId, timeoutMs);
}

async function handleResolveUrls(stateFilePath) {
  const state = readStateFile(stateFilePath);
  if (!state.environmentId || !state.serviceId) {
    throw new Error(
      `State file ${stateFilePath} is missing environmentId or serviceId`,
    );
  }

  const realtimeUrls = await resolveServiceRealtimeUrls(
    state.projectId,
    state.environmentId,
    state.serviceId,
  );

  console.log(`✓ Resolved Railway WS URL: ${realtimeUrls.wsUrl}`);
  console.log(`✓ Resolved Railway TCP URL: ${realtimeUrls.tcpUrl}`);
  printShellExports(realtimeUrls);
}

async function handleDeploy(
  projectId,
  serviceId,
  environmentName,
  apiUrl,
  commitSha,
  gitBranch,
) {
  const { environment, wasCreated } = await resolveOrCreateEnvironment(
    projectId,
    environmentName,
  );

  if (isPullRequestEnvironmentName(environmentName)) {
    await preparePullRequestEnvironment({
      projectId,
      environmentId: environment.id,
      serviceId,
      gitBranch,
      environmentWasCreated: wasCreated,
      environmentName,
    });
  }

  if (apiUrl) {
    await syncRailwayDeployVariables(
      projectId,
      environment.id,
      serviceId,
      environmentName,
      apiUrl,
    );
  }

  const deploymentId = await triggerCommitDeploy({
    projectId,
    serviceId,
    environmentId: environment.id,
    commitSha,
    gitBranch,
  });
  await waitForDeployment(deploymentId, 900_000);

  if (apiUrl) {
    console.log("\nRe-syncing Railway variables after successful deploy...");
    await syncRailwayDeployVariables(
      projectId,
      environment.id,
      serviceId,
      environmentName,
      apiUrl,
    );
  }

  console.log(`\n✅ Environment "${environmentName}" deployed successfully!`);
  return environment;
}

async function handleUpsert(
  projectId,
  serviceId,
  environmentName,
  apiUrl,
  commitSha,
  gitBranch,
) {
  await handleDeploy(
    projectId,
    serviceId,
    environmentName,
    apiUrl,
    commitSha,
    gitBranch,
  );
}

async function handleDisconnectGitHub(projectId, serviceId, environmentName) {
  const environment = await findEnvironmentByName(projectId, environmentName);
  if (!environment) {
    throw new Error(`Environment not found: ${environmentName}`);
  }

  if (!serviceId) {
    throw new Error("--service-id is required for disconnect-github");
  }

  await disableGitHubAutodeployOnService(
    projectId,
    environment.id,
    serviceId,
  );

  console.log("\n✅ Railway GitHub autodeploy disabled for service");
}

async function handleSimulatePr(
  projectId,
  serviceId,
  apiUrl,
  commitSha,
  gitBranch,
  stateFilePath,
  cleanupAfter,
) {
  const simulationEnvironmentName =
    process.env.RAILWAY_SIMULATION_ENVIRONMENT || "pr-sim-test";

  console.log(`\nSimulating PR Railway deploy in ${simulationEnvironmentName}...`);
  console.log("   clone source: dev (via pr-* naming convention)");
  console.log("   deploy method: GitHub API (serviceInstanceDeployV2)");

  await handleProbe(projectId, serviceId, "dev");

  await handleStart(
    projectId,
    serviceId,
    simulationEnvironmentName,
    apiUrl,
    stateFilePath,
    commitSha,
    gitBranch,
  );

  await handleWait(stateFilePath, 900_000);
  await handleResolveUrls(stateFilePath);

  if (cleanupAfter) {
    console.log(`\nCleaning up simulation environment ${simulationEnvironmentName}...`);
    await handleDelete(projectId, simulationEnvironmentName);
  } else {
    console.log(
      `\nSimulation environment ${simulationEnvironmentName} kept — run --action delete to remove`,
    );
  }

  console.log("\n✅ PR simulation complete");
}

async function handleDelete(projectId, environmentName) {
  console.log(`Looking for environment to delete: ${environmentName}...`);
  const environment = await findEnvironmentByName(projectId, environmentName);

  if (!environment) {
    console.log(`⚠ No environment found: ${environmentName}`);
    return;
  }

  console.log(`Found environment: ${environment.name} (${environment.id})`);
  console.log("Deleting environment...");

  await deleteEnvironment(environment.id);
  console.log(`✓ Deleted environment: ${environment.name}`);

  console.log("\n✅ Environment cleanup complete!");
}

async function main() {
  const args = parseArgs();

  const {
    project_id: projectId,
    service_id: serviceId,
    environment,
    api_url: apiUrl,
    action,
    state_file: stateFilePath,
    timeout_ms: timeoutMs,
  } = args;

  const commitSha = resolveCommitSha(args);
  const gitBranch = resolveGitBranch(args);

  if (!projectId || !action) {
    console.error(
      "Usage:\n" +
        "  railway-preview-sync.mjs --project-id <id> --service-id <id> --environment <name> --api-url <url> --action <start|wait|resolve-urls|deploy|upsert|delete|probe|simulate-pr|disconnect-github> [--state-file <path>] [--timeout-ms <ms>] [--commit-sha <sha>] [--git-branch <branch>] [--cleanup true]",
    );
    process.exit(1);
  }

  console.log("\n🚂 Railway Environment Sync");
  console.log(`   Project: ${projectId}`);
  console.log(`   Service: ${serviceId || "not specified"}`);
  console.log(`   Environment: ${environment || "not specified"}`);
  console.log(`   Action: ${action}`);
  if (commitSha) {
    console.log(`   Commit: ${commitSha.slice(0, 7)}`);
  }
  if (gitBranch) {
    console.log(`   Branch: ${gitBranch}`);
  }
  console.log("");

  // Deploying actions must target a canonical environment (production|dev|pr-N).
  if (action === "start" || action === "deploy" || action === "upsert") {
    assertCanonicalEnvironmentName(environment);
  }

  if (action === "start") {
    if (!environment || !serviceId || !apiUrl || !stateFilePath) {
      console.error(
        "--environment, --service-id, --api-url, and --state-file are required for start",
      );
      process.exit(1);
    }

    if (!commitSha) {
      console.error(
        "--commit-sha or VERCEL_GIT_COMMIT_SHA is required for start",
      );
      process.exit(1);
    }

    await handleStart(
      projectId,
      serviceId,
      environment,
      apiUrl,
      stateFilePath,
      commitSha,
      gitBranch,
    );
    return;
  }

  if (action === "probe") {
    if (!environment || !serviceId) {
      console.error("--environment and --service-id are required for probe");
      process.exit(1);
    }

    await handleProbe(projectId, serviceId, environment);
    return;
  }

  if (action === "wait") {
    if (!stateFilePath) {
      console.error("--state-file is required for wait");
      process.exit(1);
    }

    await handleWait(stateFilePath, Number(timeoutMs || 900_000));
    return;
  }

  if (action === "resolve-urls") {
    if (!stateFilePath) {
      console.error("--state-file is required for resolve-urls");
      process.exit(1);
    }

    await handleResolveUrls(stateFilePath);
    return;
  }

  if (action === "deploy") {
    if (!environment || !serviceId) {
      console.error("--environment and --service-id are required for deploy");
      process.exit(1);
    }

    if (!commitSha) {
      console.error(
        "--commit-sha or VERCEL_GIT_COMMIT_SHA is required for deploy",
      );
      process.exit(1);
    }

    await handleDeploy(
      projectId,
      serviceId,
      environment,
      apiUrl,
      commitSha,
      gitBranch,
    );
    return;
  }

  if (action === "upsert") {
    if (!environment || !apiUrl || !serviceId) {
      console.error(
        "--environment, --service-id, and --api-url are required for upsert",
      );
      process.exit(1);
    }

    if (!commitSha) {
      console.error(
        "--commit-sha or VERCEL_GIT_COMMIT_SHA is required for upsert",
      );
      process.exit(1);
    }

    await handleUpsert(
      projectId,
      serviceId,
      environment,
      apiUrl,
      commitSha,
      gitBranch,
    );
    return;
  }

  if (action === "simulate-pr") {
    if (!serviceId || !apiUrl || !stateFilePath) {
      console.error(
        "--service-id, --api-url, and --state-file are required for simulate-pr",
      );
      process.exit(1);
    }

    if (!commitSha) {
      console.error(
        "--commit-sha or VERCEL_GIT_COMMIT_SHA is required for simulate-pr",
      );
      process.exit(1);
    }

    await handleSimulatePr(
      projectId,
      serviceId,
      apiUrl,
      commitSha,
      gitBranch,
      stateFilePath,
      args.cleanup === "true",
    );
    return;
  }

  if (action === "disconnect-github") {
    if (!environment || !serviceId) {
      console.error(
        "--environment and --service-id are required for disconnect-github",
      );
      process.exit(1);
    }

    await handleDisconnectGitHub(projectId, serviceId, environment);
    return;
  }

  if (action === "delete") {
    if (!environment) {
      console.error("--environment is required for delete");
      process.exit(1);
    }

    await handleDelete(projectId, environment);
    return;
  }

  console.error(`Unknown action: ${action}`);
  process.exit(1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`Error: ${error.message}`);
    if (error.message.includes("non-JSON")) {
      console.error(
        "Hint: verify RAILWAY_TOKEN on Vercel has no quotes/newlines and uses a team/account token.",
      );
    }
    process.exit(1);
  });
}
