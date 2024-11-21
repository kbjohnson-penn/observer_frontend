import React, { Suspense } from "react";
import NavigationContent from "./NavigationContent";
import Loading from "./Loading";

const Navigation: React.FC = () => {
  return (
    <Suspense fallback={<Loading message="Loading navigation..." />}>
      <NavigationContent />
    </Suspense>
  );
};

export default Navigation;
