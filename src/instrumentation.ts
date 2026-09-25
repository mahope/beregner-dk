import { buildSitemap } from "./app/sitemap";
import { getAllDomainConfigs } from "./lib/domain-config";
import {
  submitIndexNow,
  type IndexNowEnv,
  type IndexNowResult,
} from "./lib/indexnow";

export type { IndexNowEnv } from "./lib/indexnow";

interface DeploymentSubmissionOptions {
  env?: IndexNowEnv;
  fetchImpl?: typeof fetch;
  nodeEnv?: string;
}

export interface DeploymentSubmissionResult {
  baseUrl: string;
  result: IndexNowResult;
}

let deploymentSubmissionStarted = false;

export async function submitDeploymentIndexNow({
  env = process.env,
  fetchImpl = fetch,
  nodeEnv = process.env.NODE_ENV,
}: DeploymentSubmissionOptions = {}): Promise<DeploymentSubmissionResult[]> {
  if (nodeEnv !== "production" || env.INDEXNOW_ENABLED !== "true") {
    return [];
  }

  return Promise.all(
    getAllDomainConfigs().map(async (config) => ({
      baseUrl: config.baseUrl,
      result: await submitIndexNow(
        {
          baseUrl: config.baseUrl,
          urls: buildSitemap(config).map((entry) => String(entry.url)),
        },
        { env, fetchImpl },
      ),
    })),
  );
}

function logSubmissionResult(
  baseUrl: string,
  result: IndexNowResult,
): void {
  const host = new URL(baseUrl).hostname;
  if (result.status === "accepted") {
    console.info(
      `[indexnow] ${host}: accepted (${result.httpStatus}, ${result.urlCount} URLs)`,
    );
  } else if (result.status === "rate-limited") {
    console.warn(`[indexnow] ${host}: rate limited (429)`);
  } else if (result.status === "skipped") {
    console.warn(`[indexnow] ${host}: skipped (${result.reason})`);
  } else {
    const status = result.httpStatus ? `, HTTP ${result.httpStatus}` : "";
    console.error(`[indexnow] ${host}: failed (${result.reason}${status})`);
  }
}

export function register() {
  if (
    process.env.NODE_ENV !== "production" ||
    process.env.INDEXNOW_ENABLED !== "true" ||
    process.env.NEXT_RUNTIME === "edge" ||
    deploymentSubmissionStarted
  ) {
    return;
  }

  deploymentSubmissionStarted = true;
  void submitDeploymentIndexNow()
    .then((results) => {
      for (const { baseUrl, result } of results) {
        logSubmissionResult(baseUrl, result);
      }
    })
    .catch(() => {
      console.error("[indexnow] deployment submission failed");
    });
}
