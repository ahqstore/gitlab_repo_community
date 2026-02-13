/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { Octokit } from "@octokit/core";
import { createAppAuth } from "@octokit/auth-app";

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const appId = env.GITHUB_APP_ID;
		const privateKey = env.GITHUB_PRIVATE_KEY; // This is now your "persistent" base
		const installationId = env.INSTALLATION_ID;

		const github = new Octokit({
			authStrategy: createAppAuth,
			auth: {
				appId,
				privateKey,
				installationId
			}
		});

		try {
			const payload = await request.text();

			console.log(payload);

			await github.request("POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches", {
				owner: 'ahqstore',
				repo: 'gitlab_repo_community',
				workflow_id: env.WORKFLOW_ID,
				ref: 'main',
				inputs: {
					payload,
				}
			});

			// Always returns OK
			return new Response("OK", {
				status: 200
			});
		} catch (e: unknown) {
			console.error(e);
			return new Response(`NOT OK: ${e}`, {
				status: 500
			});
		}
	},
} satisfies ExportedHandler<Env>;
