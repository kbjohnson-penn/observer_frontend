"use client";

import React, { useState, useEffect } from "react";
import { Box, Button, Stack, Fieldset } from "@chakra-ui/react";
import ProfileField from "./_components/ProfileField";
import apiClient from "../../lib/apiClient";
import { ProfileData } from "../../interfaces/profile";
import { useAuth } from "../../contexts/AuthContext";

const ProfilePage: React.FC = () => {
  const { logout } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    date_of_birth: "",
    phone_number: null,
    address: "",
    city: null,
    state: null,
    country: null,
    zip_code: null,
    bio: "",
    organization: { id: 0, name: "" },
    tier: { tier_name: "" },
    date_joined: "",
    last_login: null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await apiClient.get<ProfileData>("/profile");
        setProfileData(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <Box
      minH="100vh"
      bg="gray.50"
      display="flex"
      justifyContent="center"
      alignItems="center"
      px={4}
      py={8}
    >
      <Fieldset.Root
        size="lg"
        maxW="md"
        bg="white"
        p={6}
        rounded="md"
        shadow="lg"
      >
        <Stack mb={4}>
          <Fieldset.Legend fontSize="2xl" fontWeight="bold" color="gray.800">
            Profile Details
          </Fieldset.Legend>
        </Stack>

        <Fieldset.Content gap={4}>
          <ProfileField label="First Name" value={profileData.first_name} />
          <ProfileField label="Last Name" value={profileData.last_name} />
          <ProfileField label="Username" value={profileData.username} />
          <ProfileField label="Email Address" value={profileData.email} />
          <ProfileField
            label="Organization"
            value={profileData.organization.name}
          />
          <ProfileField label="Tier" value={profileData.tier.tier_name} />
          <ProfileField
            label="Date Joined"
            value={new Date(profileData.date_joined).toLocaleDateString()}
          />
          <ProfileField
            label="Last Login"
            value={
              profileData.last_login
                ? new Date(profileData.last_login).toLocaleDateString()
                : "Never"
            }
          />
        </Fieldset.Content>

        <Button
          type="button"
          color="red"
          mt={6}
          onClick={logout}
          w="25%"
          size="lg"
          rounded="md"
          shadow="sm"
          alignSelf="flex-end"
        >
          Logout
        </Button>
      </Fieldset.Root>
    </Box>
  );
};

export default ProfilePage;
