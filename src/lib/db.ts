import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { DayRecord, AppSettings } from '../types';

interface FocusGridDB extends DBSchema {
    days: {
        key: string;
        value: DayRecord;
    };
    settings: {
        key: string;
        value: AppSettings;
    };
}

let dbPromise: Promise<IDBPDatabase<FocusGridDB>> | null = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB<FocusGridDB>('FocusGridDB', 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('days')) {
                    db.createObjectStore('days', { keyPath: 'date' });
                }
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings');
                }
            },
        });
    }
    return dbPromise;
}

export async function saveDayRecord(record: DayRecord) {
    const db = await getDB();
    if (db) await db.put('days', record);
}

export async function getDayRecord(date: string): Promise<DayRecord | undefined> {
    const db = await getDB();
    return db ? db.get('days', date) : undefined;
}

export async function getAllDayRecords(): Promise<DayRecord[]> {
    const db = await getDB();
    return db ? db.getAll('days') : [];
}

/** Returns all day records except today and tomorrow, sorted newest-first. */
export async function getArchivedDayRecords(todayStr: string, tomorrowStr: string): Promise<DayRecord[]> {
    const all = await getAllDayRecords();
    return all
        .filter(r => r.date !== todayStr && r.date !== tomorrowStr)
        .sort((a, b) => (a.date > b.date ? -1 : 1));
}

export async function saveSettings(settings: AppSettings) {
    const db = await getDB();
    if (db) await db.put('settings', settings, 'app_settings');
}

export async function getSettings(): Promise<AppSettings | undefined> {
    const db = await getDB();
    return db ? db.get('settings', 'app_settings') : undefined;
}
