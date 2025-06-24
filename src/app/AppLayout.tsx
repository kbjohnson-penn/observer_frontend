"use client";

import React from "react";
import PublicLayout from "./layouts/PublicLayout";

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <PublicLayout>{children}</PublicLayout>;
};

export default AppLayout;