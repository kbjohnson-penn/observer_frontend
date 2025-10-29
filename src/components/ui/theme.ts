import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        // Penn Brand Colors
        brand: {
          'penn-blue': { value: '#01256E', description: 'Penn Medicine primary blue' },
          'penn-red': { value: '#990000', description: 'Penn Medicine red' },
          'penn-light-blue': { value: '#82afd3', description: 'Penn Medicine light blue' },
        },

        // Chart Colors
        chart: {
          primary: { value: '#8884d8', description: 'Primary chart data color' },
          secondary: { value: '#82ca9d', description: 'Secondary chart data color' },
          'axis-stroke': { value: '#666', description: 'Chart axis color' },
          'label-fill': { value: '#555', description: 'Chart label color' },
        },

        // Multi-modal Data Path Colors
        'data-path': {
          'provider-view': { value: '#4285F4', description: 'Provider/egocentric view' },
          'patient-view': { value: '#34A853', description: 'Patient view' },
          'room-view': { value: '#34A853', description: 'Room view' },
          audio: { value: '#FBBC05', description: 'Audio data' },
          transcript: { value: '#EA4335', description: 'Transcript data' },
          survey: { value: '#8F44AD', description: 'Survey data' },
          'patient-survey': { value: '#00838F', description: 'Patient survey' },
          'provider-survey': { value: '#3E2723', description: 'Provider survey' },
          annotations: { value: '#16A085', description: 'Annotations' },
          'patient-annotation': { value: '#FFD600', description: 'Patient annotation' },
          'provider-annotation': { value: '#FF6D00', description: 'Provider annotation' },
        },

        // Department Colors
        department: {
          simcenter: { value: '#8ED081', description: 'SimCenter' },
          oncology: { value: '#B4D2BA', description: 'Oncology' },
          'primary-care': { value: '#DCE2AA', description: 'Primary Care' },
          neurology: { value: '#FFD700', description: 'Neurology' },
          'family-medicine': { value: '#B57F50', description: 'Family Medicine' },
          cardiology: { value: '#FFC0CB', description: 'Cardiology' },
          orthopedics: { value: '#4B543B', description: 'Orthopedics' },
        },

        // Sentiment/Satisfaction Colors
        sentiment: {
          positive: { value: '#82ca9d', description: 'Positive sentiment' },
          neutral: { value: '#8884d8', description: 'Neutral sentiment' },
          negative: { value: '#CF1259', description: 'Negative sentiment' },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);
