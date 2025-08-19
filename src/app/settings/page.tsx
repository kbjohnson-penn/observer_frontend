import React from "react";
import { Box } from "@chakra-ui/react";
import SettingsLayout from "@/components/settings/SettingsLayout";

export default function SettingsPage() {
  return (
    <Box minH="100vh" bg="gray.50">
      <SettingsLayout />
    </Box>
  );
}