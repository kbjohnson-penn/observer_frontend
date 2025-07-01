'use client';

import { useState, useEffect } from 'react';
import { getSampleData } from '@/data/omop/sample-data-lazy';
import type { DatasetStats, VideoSources, CollapsibleStates } from '@/interfaces/observer-omop';

export const useDatasetExplorer = () => {
  const [stats, setStats] = useState<DatasetStats>({
    totalTables: 0,
    totalRecords: 0,
    totalVisits: 0,
    totalVideos: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  
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
        const sampleData = await getSampleData();
        
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

        observations.forEach(obs => {
          switch (obs.file_type) {
            case 'patient_view':
              newVideoSources.patient = obs.file_path;
              break;
            case 'provider_view':
              newVideoSources.provider = obs.file_path;
              break;
            case 'room_view':
              newVideoSources.room = obs.file_path;
              break;
            case 'transcript':
              newTranscriptSource = obs.file_path;
              break;
          }
        });

        setVideoSources(newVideoSources);
        setTranscriptSource(newTranscriptSource);
      } catch (error) {
        console.error('Failed to load dataset statistics:', error);
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
    toggleCollapsible
  };
};