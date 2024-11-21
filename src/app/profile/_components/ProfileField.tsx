import React from "react";

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
    <div>
      <label className="block text-sm font-semibold text-gray-600">
        {label}
      </label>
      <input
        type={type}
        value={value || ""}
        readOnly
        className="w-full px-4 py-2 border border-transparent rounded bg-gray-100"
      />
    </div>
  );
};

export default ProfileField;
