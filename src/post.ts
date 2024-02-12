
import * as core from '@actions/core';
import * as cache from '@actions/cache';
import { exec } from '@actions/exec';
import { State } from './constants';

export const showStat = async () => {
	await exec("sccache -s");
};

export const saveCache = async () => {
	try {
		let cacheKey = `${core.getInput('cache-key')}-${core.getInput('cache-suffix')}`;

		let shouldSaveCache = core.getBooleanInput('cache-save');
		if (!shouldSaveCache) {
			console.log(`Aborting, shouldSaveCache: ${shouldSaveCache}`);
			return;
		}

		let shouldUpdateCache = core.getBooleanInput('cache-update');
		if (!shouldUpdateCache) {
			const restoredCacheKey = core.getState(State.RestoredCacheKey);
			console.log(`restoredCacheKey: ${restoredCacheKey}`);
			if (!restoredCacheKey) {
				shouldUpdateCache = true;
			} else if (!restoredCacheKey.startsWith(cacheKey)) {
				shouldUpdateCache = true;
			}
		}
		if (!shouldUpdateCache) {
			console.log(`Aborting, shouldUpdateCache: ${shouldUpdateCache}`);
			return;
		}

		let shouldUseDate = core.getBooleanInput('cache-date');
		if (shouldUseDate) {
			cacheKey += `-${new Date().toISOString()}`;
		}

		console.log(`Using cacheKey: ${cacheKey}`);
		await cache.saveCache([`${process.env.HOME}/.cache/sccache`, `${process.env.HOME}/Library/Caches/Mozilla.sccache`], cacheKey);
	} catch (err: any) {
		core.setFailed(err.message);
	}
};

export const run = async () => {
	try {
		await showStat();
		await saveCache();
	} catch (err: any) {
		core.setFailed(err.message);
	}
};

run();

