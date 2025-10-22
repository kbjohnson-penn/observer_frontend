import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          'penn-dark-blue': { value: '#01256E' },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);
