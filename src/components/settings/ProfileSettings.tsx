"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Input,
  Text,
  Button,
  Alert,
  Textarea,
} from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthContext";

// Reusable form field component
interface FormFieldProps {
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
  maxLength?: number;
  ref?: (input: any) => void;
}

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = "text",
  readOnly = false,
  maxLength,
  ref
}) => (
  <HStack align="flex-start" gap={2}>
    <Box minW="160px" pt={2}>
      <Text color="gray.700" fontWeight="medium" fontSize="md">
        {label}
      </Text>
    </Box>
    <Box flex={1}>
      <Input
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        maxLength={maxLength}
        size="sm"
        variant="outline"
        border="1px solid"
        bg={readOnly ? "gray.50" : "white"}
        borderColor="gray.300"
        color={readOnly ? "gray.600" : "gray.900"}
        p={2}
        _focus={{ borderColor: readOnly ? "gray.300" : "blue.500" }}
        _hover={{ borderColor: readOnly ? "gray.300" : "gray.400" }}
        _placeholder={{ color: "gray.400" }}
      />
    </Box>
  </HStack>
);

interface ProfileData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone_number: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  bio: string;
}

export default function ProfileSettings() {
  const { user, isLoading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    phone_number: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zip_code: "",
    bio: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load user profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8000/api/v1"}/accounts/profile/`,
          {
            method: "GET",
            credentials: 'include',
          }
        );

        if (response.ok) {
          const data = await response.json();
          setProfileData({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            date_of_birth: data.date_of_birth || "",
            phone_number: data.phone_number || "",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            country: data.country || "",
            zip_code: data.zip_code || "",
            bio: data.bio || "",
          });
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  // Show loading state during auth loading
  if (authLoading) {
    return (
      <Box>
        <Text color="gray.600">Loading profile...</Text>
      </Box>
    );
  }

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    // Special handling for phone number - limit to 10 digits
    if (field === 'phone_number') {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      // Limit to 10 digits
      const limitedDigits = digitsOnly.slice(0, 10);
      setProfileData(prev => ({
        ...prev,
        [field]: limitedDigits
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const requestData = {
        date_of_birth: profileData.date_of_birth,
        phone_number: profileData.phone_number,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        country: profileData.country,
        zip_code: profileData.zip_code,
        bio: profileData.bio,
      };
      
      console.log("Sending profile update request:", requestData);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8000/api/v1"}/accounts/profile/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify(requestData),
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        setMessage({ type: "success", text: "Profile updated successfully!" });
        
        // Update local state with the response data to reflect any server changes
        setProfileData({
          first_name: responseData.first_name || "",
          last_name: responseData.last_name || "",
          date_of_birth: responseData.date_of_birth || "",
          phone_number: responseData.phone_number || "",
          address: responseData.address || "",
          city: responseData.city || "",
          state: responseData.state || "",
          country: responseData.country || "",
          zip_code: responseData.zip_code || "",
          bio: responseData.bio || "",
        });
      } else {
        console.error(`Profile update failed with status: ${response.status}`);
        
        let errorMessage = "Failed to update profile";
        
        try {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          
          // Handle different types of errors
          if (response.status === 401) {
            errorMessage = "Authentication required. Please log in again.";
          } else if (response.status === 403) {
            errorMessage = "You don't have permission to update this profile.";
          } else if (response.status === 400) {
            // Handle validation errors
            if (errorData.detail) {
              errorMessage = errorData.detail;
            } else {
              // Handle field-specific errors
              const fieldErrors = [];
              if (errorData.date_of_birth) fieldErrors.push(`Date of birth: ${errorData.date_of_birth[0]}`);
              if (errorData.phone_number) fieldErrors.push(`Phone: ${errorData.phone_number[0]}`);
              if (errorData.address) fieldErrors.push(`Address: ${errorData.address[0]}`);
              if (errorData.city) fieldErrors.push(`City: ${errorData.city[0]}`);
              if (errorData.state) fieldErrors.push(`State: ${errorData.state[0]}`);
              if (errorData.country) fieldErrors.push(`Country: ${errorData.country[0]}`);
              if (errorData.zip_code) fieldErrors.push(`ZIP: ${errorData.zip_code[0]}`);
              if (errorData.bio) fieldErrors.push(`Bio: ${errorData.bio[0]}`);
              
              if (fieldErrors.length > 0) {
                errorMessage = fieldErrors.join("; ");
              }
            }
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          console.error("Could not parse error response:", parseError);
          errorMessage = `Server error (${response.status}). Please try again.`;
        }
        
        setMessage({ 
          type: "error", 
          text: errorMessage
        });
      }
    } catch (error) {
      console.error("Profile update network error:", error);
      setMessage({ 
        type: "error", 
        text: "Network error: Unable to connect to server. Please check your connection and try again." 
      });
    }

    setIsLoading(false);
  };

  return (
    <Box>{/* SettingsLayout provides the header */}
      {message && (
        <Alert.Root 
          status={message.type} 
          mb={4}
          borderRadius="lg"
          border="1px"
          borderColor={message.type === "success" ? "green.200" : "red.200"}
          bg={message.type === "success" ? "green.50" : "red.50"}
        >
          <Alert.Title color={message.type === "success" ? "green.800" : "red.800"}>
            {message.text}
          </Alert.Title>
        </Alert.Root>
      )}

      <form onSubmit={handleSubmit}>
        <VStack gap={4} align="stretch">
          {/* Personal Information Section */}
          <Box>
            <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={2}>
              Personal Information
            </Text>
            
            <VStack gap={1} align="stretch">
              {/* First Name - Read Only */}
              <FormField 
                label="First names"
                value={profileData.first_name}
                placeholder="Enter your first name"
                readOnly
              />

              {/* Last Name - Read Only */}
              <FormField 
                label="Last name"
                value={profileData.last_name}
                placeholder="Enter your last name"
                readOnly
              />

              {/* Date of Birth */}
              <FormField 
                label="Date of Birth"
                type="date"
                value={profileData.date_of_birth}
                onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
              />
            </VStack>
          </Box>

          {/* Contact Information Section */}
          <Box>
            <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={3} pb={1} borderBottom="1px" borderColor="gray.200">
              Contact Information
            </Text>
            
            <VStack gap={1} align="stretch">
              {/* Phone Number */}
              <FormField 
                label="Phone Number"
                type="tel"
                value={profileData.phone_number}
                onChange={(e) => handleInputChange("phone_number", e.target.value)}
                placeholder="999-999-9999"
                maxLength={10}
              />
            </VStack>
          </Box>

          {/* Address Information Section */}
          <Box>
            <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={3} pb={1} borderBottom="1px" borderColor="gray.200">
              Address Information
            </Text>
            
            <VStack gap={1} align="stretch">
              {/* Address */}
              <FormField 
                label="Street Address"
                value={profileData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="123 Main Street, Apt 4B"
              />

              {/* City */}
              <FormField 
                label="City"
                value={profileData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="City (e.g., Philadelphia)"
              />

              {/* State */}
              <FormField 
                label="State/Province"
                value={profileData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="State/Province (e.g., PA)"
              />

              {/* Country */}
              <FormField 
                label="Country"
                value={profileData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                placeholder="Country (e.g., United States)"
              />

              {/* ZIP Code */}
              <FormField 
                label="ZIP/Postal Code"
                value={profileData.zip_code}
                onChange={(e) => handleInputChange("zip_code", e.target.value)}
                placeholder="ZIP/Postal Code (e.g., 19104)"
              />
            </VStack>
          </Box>

          {/* Additional Information Section */}
          <Box>
            <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={3} pb={1} borderBottom="1px" borderColor="gray.200">
              Additional Information
            </Text>
            
            <VStack gap={1} align="stretch">
              {/* Bio */}
              <HStack align="flex-start" gap={2}>
                <Box minW="160px" pt={2}>
                  <Text color="gray.700" fontWeight="medium" fontSize="md">
                    Bio
                  </Text>
                </Box>
                <Box flex={1}>
                  <Textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about yourself..."
                    size="sm"
                    variant="outline"
                    color="gray.900"
                    resize="vertical"
                    border="1px solid"
                    p={2}
                    _hover={{ borderColor: "gray.400" }}
                    borderColor="gray.300"
                    _focus={{ borderColor: "blue.500" }}
                    _placeholder={{ color: "gray.400" }}
                    rows={4}
                  />
                </Box>
              </HStack>
            </VStack>
          </Box>

          {/* Save Button */}
          <Box pt={3} borderTop="1px" borderColor="gray.200">
            <Button
              type="submit"
              bg="blue.600"
              color="white"
              size="md"
              px={6}
              borderRadius="md"
              disabled={isLoading}
              _hover={{ bg: "blue.700" }}
              _disabled={{ bg: "gray.400", cursor: "not-allowed" }}
              fontWeight="semibold"
              fontSize="sm"
              h="9"
              minW="120px"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        </VStack>
      </form>
    </Box>
  );
}