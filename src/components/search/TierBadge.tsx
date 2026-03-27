import { Badge } from '@chakra-ui/react';
import { COLORS } from '@/constants/colors';

export function TierBadge({ tier }: { tier: number }) {
  if (tier < 1 || tier > 5) {
    return null;
  }
  const palette = (COLORS.tier as Record<number, string>)[tier] ?? 'gray';
  return (
    <Badge colorPalette={palette} variant="subtle" size="sm" borderRadius="full" px={2}>
      Tier {tier}
    </Badge>
  );
}
