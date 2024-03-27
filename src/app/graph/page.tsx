import React, { Suspense } from "react";
import LoadingPage from "../../components/LoadingPage";

import { Node, Edge, ApiResponse } from "../../interfaces/interfacesGraph";

import GraphBrowser from "./_components/GraphBrowser";

const fetchKnowledgeGraphData = async () => {
  const res = await fetch(`${process.env.BACKEND_API}/knowledge-graph`);
  const data: ApiResponse = await res.json();
  return data;
};

const KnowledgeGraph: React.FC = async () => {
  const knowledgeGraphData = await fetchKnowledgeGraphData();

  return (
    <div className="flex flex-col min-h-screen items-center justify-start p-10 text-center space-y-8 bg-gray-100 py-10">
      <h1 style={{ color: "#950019" }} className="text-4xl font-bold mb-4">
        Knowledge Graph
      </h1>
      <Suspense fallback={<LoadingPage />}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <GraphBrowser knowledgeGraphData={knowledgeGraphData} />
        </div>
      </Suspense>
    </div>
  );
};

export default KnowledgeGraph;
