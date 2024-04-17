import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';
import { useEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { enhancedProviderHttp } from '../network/internal/enhancedProvider';
import { createQueryKey } from '../react-query/createQuery';
import { useIsMainnetConfigured } from './useIsMainnetConfigured';

async function getEnhancedProviderEnsName({ address }: { address: Address }) {
  const response = await enhancedProviderHttp.get<{
    data: Address | null;
  }>('/v1/resolve-ens', { params: { address } });

  return response.data.data;
}

export function useMainnetEnsName(address?: Address) {
  const mainnetConfigured = useIsMainnetConfigured();

  // Fetch ens name if mainnet is configured
  const { data: ensName } = useEnsName({
    chainId: mainnet.id,
    address,
    query: {
      enabled: mainnetConfigured,
    },
  });

  // Fetch ens name from enhanced provider if mainnet isn't configured
  const { data: enhancedProviderEnsName } = useQuery({
    queryKey: createQueryKey('address', address),
    queryFn: () => getEnhancedProviderEnsName({ address: address! }),
    enabled: !mainnetConfigured && !!address,
  });

  return ensName || enhancedProviderEnsName;
}
