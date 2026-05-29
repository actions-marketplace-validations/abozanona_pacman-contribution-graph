import { fetchGithubContributions } from './github-contributions';
import { fetchGitlabContributions } from './gitlab-contributions';
import { generateScenarioContributions } from './scenarios';
import type { BaseStore, Contribution } from '../types';

const fetchContributions = async (store: BaseStore): Promise<Contribution[]> => {
	if (store.config.contributions) {
		return store.config.contributions;
	}

	if (store.config.scenario !== undefined) {
		return generateScenarioContributions(store.config.scenario).contributions;
	}

	switch (store.config.platform) {
		case 'gitlab':
			return await fetchGitlabContributions(store);
		case 'github':
			return await fetchGithubContributions(store);
		default:
			throw new Error(`Unsupported platform: ${store.config.platform}`);
	}
};

export const Providers = {
	fetchContributions,
	fetchGithubContributions,
	fetchGitlabContributions,
	generateScenarioContributions
};
