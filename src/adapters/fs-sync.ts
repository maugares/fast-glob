import * as fs from 'fs';

import FileSystem from './fs';

import { FilterFunction } from '@mrmlnc/readdir-enhanced';

import { Entry } from '../types/entries';
import { Pattern } from '../types/patterns';

export default class FileSystemSync extends FileSystem<Entry[]> {
	/**
	 * Use sync API to read entries for Task.
	 */
	public read(patterns: string[], filter: FilterFunction): Entry[] {
		const entries: Entry[] = [];

		patterns.forEach((pattern) => {
			const filepath = this.getFullEntryPath(pattern);
			const entry = this.getEntry(filepath, pattern);

			if (entry === null || !filter(entry)) {
				return;
			}

			entries.push(entry);
		});

		return entries;
	}

	/**
	 * Return entry for the provided path.
	 */
	public getEntry(filepath: string, pattern: Pattern): Entry | null {
		try {
			const stat = this.getStat(filepath);

			return this.makeEntry(stat, pattern);
		} catch (err) {
			return null;
		}
	}

	/**
	 * Return fs.Stats for the provided path.
	 */
	public getStat(filepath: string): fs.Stats {
		const lstat = this.lstat(filepath);

		if (!lstat.isSymbolicLink()) {
			return lstat;
		}

		try {
			const stat = this.stat(filepath);

			stat.isSymbolicLink = () => true;

			return stat;
		} catch {
			return lstat;
		}
	}

	public lstat(filepath: string): fs.Stats {
		return fs.lstatSync(filepath);
	}

	public stat(filepath: string): fs.Stats {
		return fs.statSync(filepath);
	}
}
