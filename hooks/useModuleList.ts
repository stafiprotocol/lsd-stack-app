import { AppEco } from 'interfaces/common';
import { ModuleSetting } from 'interfaces/module';
import { useCallback, useEffect, useState } from 'react';
import { getModuleListFromDb } from 'utils/dbUtils';

export function useModuleList(userAddress: string | undefined, eco: AppEco) {
  const [moduleList, setModuleList] = useState<ModuleSetting[]>([]);

  const update = useCallback(async () => {
    if (!userAddress) {
      return [];
    }
    const list = await getModuleListFromDb(userAddress, eco);
    setModuleList(list);
    console.log({ list });
  }, [userAddress, eco]);

  useEffect(() => {
    update();
  }, [update]);

  return { moduleList, update };
}
