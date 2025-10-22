'use client';

import React, { useState, useEffect } from 'react';
import { Box, IconButton } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { LuBell } from 'react-icons/lu';
import { logger } from '@/lib/logger';
import AnnouncementsModal from './AnnouncementsModal';

const FloatingAnnouncementsButton: React.FC = () => {
  const [hasUnreadAnnouncements, setHasUnreadAnnouncements] = useState(false);
  const [autoShowModal, setAutoShowModal] = useState(false);

  useEffect(() => {
    try {
      const hasSeenAnnouncements = sessionStorage.getItem('hasSeenPilotAwards');
      const hasClosedAutoModal = sessionStorage.getItem('hasClosedPilotAwardsModal');

      if (!hasSeenAnnouncements) {
        setHasUnreadAnnouncements(true);

        if (!hasClosedAutoModal) {
          const timer = setTimeout(() => setAutoShowModal(true), 3000);
          return () => clearTimeout(timer);
        }
      }
    } catch (error) {
      logger.warn('Could not access sessionStorage:', error);
      setHasUnreadAnnouncements(true);
    }
  }, []);

  const handleModalInteraction = () => {
    try {
      sessionStorage.setItem('hasSeenPilotAwards', 'true');
      setHasUnreadAnnouncements(false);
    } catch (error) {
      logger.warn('Could not save to sessionStorage:', error);
    }
  };

  const handleAutoModalClose = () => {
    setAutoShowModal(false);
    try {
      sessionStorage.setItem('hasClosedPilotAwardsModal', 'true');
    } catch (error) {
      logger.warn('Could not save to sessionStorage:', error);
    }
  };

  return (
    <Box position="fixed" bottom="20" right="6" zIndex="60">
      <Box position="relative">
        <Tooltip
          content="Pilot Awards Available - $100K"
          positioning={{
            placement: 'left',
            strategy: 'fixed',
            offset: { mainAxis: 8 },
          }}
          showArrow={true}
        >
          <AnnouncementsModal
            trigger={
              <IconButton
                aria-label="View Announcements"
                size="lg"
                borderRadius="full"
                boxShadow="lg"
                _hover={{
                  transform: 'scale(1.1)',
                  boxShadow: 'xl',
                }}
                transition="all 0.2s"
                bg="blue.600"
                color="white"
                _active={{ bg: 'blue.700' }}
                onClick={handleModalInteraction}
                animation={hasUnreadAnnouncements ? 'pulse 2s infinite' : undefined}
              >
                <LuBell />
              </IconButton>
            }
          />
        </Tooltip>

        {autoShowModal && (
          <AnnouncementsModal trigger={<div />} isOpen={true} onClose={handleAutoModalClose} />
        )}

        {hasUnreadAnnouncements && (
          <Box
            position="absolute"
            top="-1"
            right="-1"
            bg="red.500"
            borderRadius="full"
            w="14px"
            h="14px"
            border="2px solid white"
          />
        )}
      </Box>
    </Box>
  );
};

export default FloatingAnnouncementsButton;
