"use client";

import React from "react";
import { Box, IconButton } from "@chakra-ui/react";
import { LuBell } from "react-icons/lu";
import AnnouncementsModal from "./AnnouncementsModal";

const FloatingAnnouncementsButton: React.FC = () => {
  return (
    <Box
      position="fixed"
      bottom="20"
      right="6"
      zIndex="60"
    >
      <AnnouncementsModal
        trigger={
          <IconButton
            aria-label="View Announcements"
            size="lg"
            borderRadius="full"
            boxShadow="lg"
            _hover={{ 
              transform: "scale(1.1)",
              boxShadow: "xl" 
            }}
            transition="all 0.2s"
            bg="blue.600"
            color="white"
            _active={{ bg: "blue.700" }}
          >
            <LuBell />
          </IconButton>
        }
      />
    </Box>
  );
};

export default FloatingAnnouncementsButton;