import { TonClient } from '@ton/ton';
import { tonRestEndpoint } from 'config/ton';
import { useEffect, useState } from 'react';

export const useTonClient = () => {
  const [tonClient, setTonClient] = useState<TonClient | null>(null);

  const initClient = async () => {
    const client = new TonClient({
      endpoint: tonRestEndpoint,
      apiKey:
        '203606aa11072fbea9fb1a16fda08ccb7100936ee001ca2b2a1c1d63500352b6',
    });
    setTonClient(client);
  };

  useEffect(() => {
    if (tonClient) return;

    initClient();
  }, []);

  return tonClient;
};
