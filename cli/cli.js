#!/usr/bin/env node

// Run `npm link` to test locally
import fs from 'fs';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import { ARCADE_GAMES, ArcadeRenderer, SCENARIOS } from '../dist/pacman-contribution-graph.min.js';

const argv = yargs(hideBin(process.argv))
	.option('game', {
		alias: 'g',
		describe: `Game to generate: ${ARCADE_GAMES.join(', ')}`,
		choices: ARCADE_GAMES,
		default: 'pacman',
		type: 'string'
	})
	.option('platform', {
		alias: 'pl',
		describe: 'Platform: github, gitlab',
		choices: ['github', 'gitlab'],
		type: 'string'
	})
	.option('gameTheme', {
		alias: 'gt',
		describe: 'Game theme: github, github-dark, gitlab, gitlab-dark',
		choices: ['github', 'github-dark', 'gitlab', 'gitlab-dark'],
		type: 'string'
	})
	.option('username', {
		alias: 'un',
		describe: 'Username for the platform',
		type: 'string'
	})
	.option('scenario', {
		alias: 's',
		describe: `Use a predefined contribution scenario instead of fetching user contributions: ${SCENARIOS.join(', ')}. Without a value, random is used.`,
		type: 'string'
	})
	.option('output', {
		alias: 'o',
		describe: 'Output file (SVG)',
		default: 'contribution-graph.svg',
		type: 'string'
	})
	.check((parsedArgv) => {
		const hasScenario = parsedArgv.scenario !== undefined;
		if (hasScenario) return true;

		const missingOptions = ['platform', 'gameTheme', 'username'].filter((option) => !parsedArgv[option]);
		if (missingOptions.length > 0) {
			throw new Error(`Missing required argument${missingOptions.length > 1 ? 's' : ''}: ${missingOptions.join(', ')}`);
		}

		return true;
	})
	.help().argv;

const hasScenario = argv.scenario !== undefined;
const scenarioName = argv.scenario === '' || argv.scenario === undefined ? 'random' : argv.scenario;

const renderer = new ArcadeRenderer({
	game: argv.game,
	platform: argv.platform ?? 'github',
	username: argv.username ?? (hasScenario ? `scenario-${scenarioName}` : ''),
	gameTheme: argv.gameTheme ?? (argv.platform === 'gitlab' ? 'gitlab' : 'github'),
	scenario: argv.scenario,
	includeFutureContributions: hasScenario,
	svgCallback: (svg) => {
		fs.writeFileSync(argv.output, svg);
		console.log(`SVG saved to ${argv.output}`);
	}
});

try {
	await renderer.start();
} catch (error) {
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
}
