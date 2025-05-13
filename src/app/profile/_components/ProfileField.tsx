import React from "react";
import { Input } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";

interface ProfileFieldProps {
  label: string;
  value: string | null;
  type?: string;
}

const ProfileField: React.FC<ProfileFieldProps> = ({
  label,
  value,
  type = "text",
}) => {
  return (
    <Field label={label}>
      <Input
        value={value || ""}
        readOnly
        type={type}
        bg="gray.100"
        border="1px"
        borderColor="gray.300"
        _focus={{
          borderColor: "blue.500",
          bg: "white",
        }}
        p={4}
        rounded="md"
      />
    </Field>
  );
};

export default ProfileField;
