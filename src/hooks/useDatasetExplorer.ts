'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import type { DatasetStats, VideoSources, CollapsibleStates, SampleDataAPIResponse, OMOPTableName } from '@/interfaces/observer-omop';

export const useDatasetExplorer = () => {
  const [stats, setStats] = useState<DatasetStats>({
    totalTables: 0,
    totalRecords: 0,
    totalVisits: 0,
    totalVideos: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [videoSources, setVideoSources] = useState<VideoSources>({
    patient: '',
    provider: '',
    room: ''
  });
  
  const [transcriptSource, setTranscriptSource] = useState('');
  
  const [collapsibleStates, setCollapsibleStates] = useState<CollapsibleStates>({
    showOverview: true,
    showDataBrowser: true,
    showMediaViewers: true
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsLoading(true);
        setError(null);
        
        // Call the API directly
        const response = await apiClient.get<SampleDataAPIResponse>('/public/sample-data/', {
          timeout: 10000, // 10 seconds timeout
        });
        
        const apiData = response.data;
        
        // Map API response to OMOP table structure
        const sampleData: Record<OMOPTableName, any[]> = {
          PERSON: apiData.persons || [],
          PROVIDER: apiData.providers || [],
          VISIT_OCCURRENCE: apiData.visits || [],
          NOTE: apiData.notes || [],
          CONDITION_OCCURRENCE: apiData.conditions || [],
          DRUG_EXPOSURE: apiData.drugs || [],
          PROCEDURE_OCCURRENCE: apiData.procedures || [],
          MEASUREMENT: apiData.measurements || [],
          OBSERVATION: apiData.observations || [],
          PATIENT_SURVEY: apiData.patient_surveys || [],
          PROVIDER_SURVEY: apiData.provider_surveys || [],
          AUDIT_LOGS: apiData.audit_logs || [],
          CONCEPT: apiData.concepts || [],
        };
        
        // Calculate stats
        setStats({
          totalTables: Object.keys(sampleData).length,
          totalRecords: Object.values(sampleData).reduce((sum, table) => sum + table.length, 0),
          totalVisits: sampleData.VISIT_OCCURRENCE?.length || 0,
          totalVideos: sampleData.OBSERVATION?.filter(obs => 
            ['patient_view', 'provider_view', 'room_view'].includes(obs.file_type)
          ).length || 0
        });

        // Auto-load media files from OBSERVATION table
        const observations = sampleData.OBSERVATION || [];
        const newVideoSources: VideoSources = { patient: '', provider: '', room: '' };
        let newTranscriptSource = '';

        // Base API URL for video streaming
        const baseApiUrl = process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8000/api/v1";

        observations.forEach(obs => {
          switch (obs.file_type) {
            case 'patient_view':
              newVideoSources.patient = `${baseApiUrl}/public/video/${obs.file_path}/`;
              break;
            case 'provider_view':
              newVideoSources.provider = `${baseApiUrl}/public/video/${obs.file_path}/`;
              break;
            case 'room_view':
              newVideoSources.room = `${baseApiUrl}/public/video/${obs.file_path}/`;
              break;
            case 'transcript':
              newTranscriptSource = `${baseApiUrl}/public/video/${obs.file_path}/`;
              break;
          }
        });

        setVideoSources(newVideoSources);
        setTranscriptSource(newTranscriptSource);
      } catch (err: any) {
        // Handle API errors
        const errorMessage = err.response?.data?.error || err.message || 'Failed to load data from API';
        setError(errorMessage);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, []);


  const toggleCollapsible = (section: keyof CollapsibleStates) => {
    setCollapsibleStates(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return {
    stats,
    statsLoading,
    videoSources,
    transcriptSource,
    collapsibleStates,
    error,
    toggleCollapsible
  };
};