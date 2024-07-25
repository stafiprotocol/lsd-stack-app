import { openDB } from 'idb';
import { AppEco } from 'interfaces/common';
import { ModuleSetting } from 'interfaces/module';

export const indexDbName = 'lsaas-database';
export const indexDbVersion = 1;
export const indexDbModuleStoreName = 'moduleSettings';

export async function initIndexDb() {
  await openDB(indexDbName, indexDbVersion, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(indexDbModuleStoreName)) {
        const modulesStore = db.createObjectStore(indexDbModuleStoreName, {
          // keyPath: 'uniqueKey',
        });
        // resultEventsStore.createIndex("e-tag", "property", {
        //   unique: false,
        // });
      }
    },
  });
}

export async function saveModuleToDb(
  moduleSetting: ModuleSetting
): Promise<ModuleSetting | undefined> {
  const db = await openDB(indexDbName, indexDbVersion);

  const savedKey = await db.put(
    indexDbModuleStoreName,
    moduleSetting,
    moduleSetting.myKey
  );

  return savedKey ? moduleSetting : undefined;

  //   const eTag = event.tags.find((tag) => tag[0] === 'e');
  //   const taskEventId = eTag ? eTag[1] : '';

  //   const exists = await db.get('resultEvents', taskEventId);
  //   if (exists) {
  //     return;
  //   }

  //   await db.add('resultEvents', {
  //     assignEventId: taskEventId,
  //   });
}

export async function getModuleSettingFromDb(
  type: 'point' | 'ai' | 'frontend',
  tokenAddress?: string
): Promise<ModuleSetting | undefined> {
  if (!tokenAddress) {
    return undefined;
  }
  const db = await openDB(indexDbName, indexDbVersion);

  const exists = await db.get(
    indexDbModuleStoreName,
    `${type}-${tokenAddress}`
  );
  return exists;
}

export async function getModuleListFromDb(
  userAddress: string,
  eco: AppEco
): Promise<ModuleSetting[]> {
  const db = await openDB(indexDbName, indexDbVersion);

  const all = await db.getAll(indexDbModuleStoreName);

  if (!all) {
    return [];
  }

  const list = all.filter(
    (item) => item.userAddress === userAddress && item.eco === eco
  );
  return list;
}
