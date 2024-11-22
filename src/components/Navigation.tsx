import React, { Suspense } from "react";
import NavigationContent from "./NavigationContent";
import Loading from "./Loading";

const Navigation: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <NavigationContent />
    </Suspense>
  );
};

export default Navigation;
