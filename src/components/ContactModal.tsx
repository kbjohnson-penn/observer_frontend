'use client';

import React from 'react';
import { Box, Button, Heading, Text, VStack, Icon, Link, Dialog, Portal } from '@chakra-ui/react';
import { FaExternalLinkAlt } from 'react-icons/fa';

interface ContactModalProps {
  trigger: React.ReactNode;
}

const ContactModal: React.FC<ContactModalProps> = ({ trigger }) => {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="white" color="black">
            <Dialog.Body py={6}>
              <VStack gap={5} align="stretch">
                <Box textAlign="center">
                  <Heading fontSize="xl" color="blue.700" mb={3} fontWeight="bold">
                    Get in Touch
                  </Heading>
                  <Text color="gray.600" fontSize="md" lineHeight="1.6">
                    Have questions about the Observer platform? We&apos;d love to hear from you.
                  </Text>
                </Box>

                <Box
                  bg="blue.50"
                  p={5}
                  borderRadius="lg"
                  textAlign="center"
                  border="1px solid"
                  borderColor="blue.100"
                >
                  <Text fontSize="sm" color="gray.700" mb={3} fontWeight="medium">
                    Email us at:
                  </Text>
                  <Link
                    href="mailto:observerproject@pennmedicine.upenn.edu"
                    color="blue.600"
                    fontWeight="semibold"
                    fontSize="lg"
                    _hover={{ color: 'blue.800', textDecoration: 'underline' }}
                    display="inline-flex"
                    alignItems="center"
                    gap={2}
                  >
                    observerproject@pennmedicine.upenn.edu
                    <Icon as={FaExternalLinkAlt} boxSize={4} />
                  </Link>
                </Box>

                <Box>
                  <Heading size="sm" color="gray.700" mb={3}>
                    What can we help you with?
                  </Heading>
                  <VStack gap={2} align="stretch" fontSize="sm" color="gray.600">
                    <Text display="flex" alignItems="center">
                      <Box as="span" w={2} h={2} bg="blue.400" borderRadius="full" mr={3} />
                      General questions about the platform
                    </Text>
                    <Text display="flex" alignItems="center">
                      <Box as="span" w={2} h={2} bg="blue.400" borderRadius="full" mr={3} />
                      Research collaboration opportunities
                    </Text>
                    <Text display="flex" alignItems="center">
                      <Box as="span" w={2} h={2} bg="blue.400" borderRadius="full" mr={3} />
                      Technical support and troubleshooting
                    </Text>
                    <Text display="flex" alignItems="center">
                      <Box as="span" w={2} h={2} bg="blue.400" borderRadius="full" mr={3} />
                      Data access and usage policies
                    </Text>
                  </VStack>
                </Box>

                <Box
                  bg="green.50"
                  p={4}
                  borderRadius="md"
                  border="1px solid"
                  borderColor="green.200"
                >
                  <Text fontSize="sm" color="green.800" textAlign="center" fontWeight="medium">
                    Response Time: We typically respond within 1-2 business days
                  </Text>
                </Box>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer justifyContent="center" pt={4}>
              <Dialog.ActionTrigger asChild>
                <Button size="lg" px={8} bg="blue.600" color="white" _hover={{ bg: 'blue.700' }}>
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

export default ContactModal;
