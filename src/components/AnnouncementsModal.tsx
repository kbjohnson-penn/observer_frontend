"use client";

import React from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Icon,
  Link,
  Dialog,
  Portal,
} from "@chakra-ui/react";
import { FaExternalLinkAlt } from "react-icons/fa";

interface AnnouncementsModalProps {
  trigger: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

const AnnouncementsModal: React.FC<AnnouncementsModalProps> = ({ 
  trigger, 
  isOpen, 
  onClose 
}) => {
  return (
    <Dialog.Root 
      open={isOpen} 
      onOpenChange={(details) => {
        if (!details.open && onClose) {
          onClose();
        }
      }}
    >
      <Dialog.Trigger asChild>
        {trigger}
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="white" color="black">
            <Dialog.Body py={6}>
              <VStack gap={5} align="stretch">
                <Box textAlign="center">
                  <Heading fontSize="xl" color="blue.700" mb={3} fontWeight="bold">
                    Observer Pilot Awards - $100K Available
                  </Heading>
                  <Text color="gray.600" fontSize="md" lineHeight="1.6">
                    Five grants of $20,000 each supporting interdisciplinary projects using the Observer Repository. Applications from faculty, postdocs, and research teams welcome.
                  </Text>
                </Box>

                <Box bg="blue.50" p={5} borderRadius="lg" textAlign="center" border="1px solid" borderColor="blue.100">
                  <Text fontSize="sm" color="gray.700" mb={3} fontWeight="medium">
                    Ready to apply?
                  </Text>
                  <Link
                    href="https://www.med.upenn.edu/kbjohnsonlab/observer-pilot-awards"
                    color="blue.600"
                    fontWeight="semibold"
                    fontSize="lg"
                    _hover={{ color: "blue.800", textDecoration: "underline" }}
                    display="inline-flex"
                    alignItems="center"
                    gap={2}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apply Now
                    <Icon as={FaExternalLinkAlt} boxSize={4} />
                  </Link>
                </Box>

                <Box>
                  <Heading size="sm" color="gray.700" mb={3}>
                    What&apos;s included:
                  </Heading>
                  <VStack gap={2} align="stretch" fontSize="sm" color="gray.600">
                    <Text display="flex" alignItems="center">
                      <Box as="span" w={2} h={2} bg="blue.400" borderRadius="full" mr={3} />
                      $20,000 grant funding per project
                    </Text>
                    <Text display="flex" alignItems="center">
                      <Box as="span" w={2} h={2} bg="blue.400" borderRadius="full" mr={3} />
                      Access to Observer Repository dataset
                    </Text>
                    <Text display="flex" alignItems="center">
                      <Box as="span" w={2} h={2} bg="blue.400" borderRadius="full" mr={3} />
                      12-month project duration
                    </Text>
                    <Text display="flex" alignItems="center">
                      <Box as="span" w={2} h={2} bg="blue.400" borderRadius="full" mr={3} />
                      Collaboration opportunities
                    </Text>
                  </VStack>
                </Box>

                <Box bg="green.50" p={4} borderRadius="md" border="1px solid" borderColor="green.200">
                  <Text fontSize="sm" color="green.800" textAlign="center" fontWeight="medium">
                    Application Deadline: August 29, 2025
                  </Text>
                </Box>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer justifyContent="center" pt={4}>
              <Dialog.ActionTrigger asChild>
                <Button 
                  size="lg" 
                  px={8}
                  bg="blue.600"
                  color="white"
                  _hover={{ bg: "blue.700" }}
                >
                  Close
                </Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default AnnouncementsModal;