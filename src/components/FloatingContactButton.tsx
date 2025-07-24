"use client";

import React from "react";
import { Box, IconButton } from "@chakra-ui/react";
import { FaEnvelope } from "react-icons/fa";
import ContactModal from "./ContactModal";

const FloatingContactButton: React.FC = () => {
  return (
    <Box
      position="fixed"
      bottom="6"
      right="6"
      zIndex="40"
    >
      <ContactModal
        trigger={
          <IconButton
            aria-label="Contact Us"
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
            <FaEnvelope />
          </IconButton>
        }
      />
    </Box>
  );
};

export default FloatingContactButton;