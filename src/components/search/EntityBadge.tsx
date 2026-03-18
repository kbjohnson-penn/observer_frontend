'use client';

import React from 'react';
import { Badge } from '@chakra-ui/react';

const LABEL_COLORS: Record<string, string> = {
  MEDICATION: 'blue',
  PROBLEM: 'red',
  PROCEDURE: 'purple',
  TEST: 'orange',
};

interface EntityBadgeProps {
  label: string;
  text: string;
}

export default function EntityBadge({ label, text }: EntityBadgeProps) {
  const color = LABEL_COLORS[label] ?? 'gray';
  return (
    <Badge colorPalette={color} size="sm" borderRadius="full">
      {text}
    </Badge>
  );
}
