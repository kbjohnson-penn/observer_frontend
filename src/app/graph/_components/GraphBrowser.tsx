"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import SpriteText from "three-spritetext";

import { ApiResponse } from "../../../interfaces/interfacesGraph";

import {
  NODE_COLORS,
  RACIAL_CATEGORIES,
  ETHNIC_CATEGORIES,
  GENDER_CATEGORIES,
} from "../../../constants";

interface GraphBrowserProps {
  knowledgeGraphData: ApiResponse;
}

const categories: Record<string, Record<string, string>> = {
  race: RACIAL_CATEGORIES,
  ethnicity: ETHNIC_CATEGORIES,
  sex: GENDER_CATEGORIES,
};

const setNodeColor = (node: any) => {
  if (node.labels.includes("MultiModalDataPathNode")) {
    return NODE_COLORS.MultiModalDataPathNode;
  } else if (node.labels.includes("ProviderNode")) {
    return NODE_COLORS.ProviderNode;
  } else if (node.labels.includes("EncounterNode")) {
    return NODE_COLORS.EncounterNode;
  } else if (node.labels.includes("PatientNode")) {
    return NODE_COLORS.PatientNode;
  } else if (node.labels.includes("DepartmentNode")) {
    return NODE_COLORS.DepartmentNode;
  }
  return "#000000";
};

const setNodeLabel = (node: any) => {
  if (node.labels.includes("MultiModalDataPathNode")) {
    return node.properties.multi_modal_data_id;
  } else if (node.labels.includes("ProviderNode")) {
    return node.properties.provider_id;
  } else if (node.labels.includes("EncounterNode")) {
    return node.properties.case_id;
  } else if (node.labels.includes("PatientNode")) {
    return node.properties.patient_id;
  } else if (node.labels.includes("DepartmentNode")) {
    return node.properties.name;
  }
  return "";
};

// Dynamically import the ForceGraph2D component
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

type HoverNodeType = {
  properties: {
    [key: string]: string;
  };
};
const GraphBrowser: React.FC<GraphBrowserProps> = ({ knowledgeGraphData }) => {
  const [hoverNode, setHoverNode] = useState<HoverNodeType | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (e: MouseEvent) =>
      setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", updatePosition);

    // Clean up event listener on unmount
    return () => window.removeEventListener("mousemove", updatePosition);
  }, []);

  return (
    <div>
      <ForceGraph2D
        width={800}
        height={600}
        backgroundColor="#ECF0F1"
        graphData={{
          nodes: knowledgeGraphData.nodes,
          links: knowledgeGraphData.edges,
        }}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        nodeRelSize={12}
        nodeAutoColorBy="group"
        onNodeDragEnd={(node) => {
          node.fx = node.x;
          node.fy = node.y;
          node.fz = node.z;
        }}
        nodeLabel={(node) => setNodeLabel(node)}
        nodeColor={(node) => setNodeColor(node)}
        linkLabel={(link) => link.type}
        minZoom={0.1}
        maxZoom={5}
        onNodeHover={(node: any) => setHoverNode(node)}
      />
      {hoverNode && (
        <div
          style={{
            position: "fixed",
            top: position.y + 25,
            left: position.x + 25,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            border: "1px solid #ddd",
            borderRadius: "5px",
            padding: "10px",
            boxShadow: "0px 0px 10px rgba(0,0,0,0.5)",
            zIndex: 1000,
            maxWidth: "200px",
            overflow: "auto",
          }}
        >
          {/* Display the properties of the node here */}
          {hoverNode &&
            Object.entries(hoverNode.properties).map(([key, value]) => {
              const category = categories[key];
              const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
              const formattedValue = category ? category[value] : value;
              return <p key={key}>{`${formattedKey}: ${formattedValue}`}</p>;
            })}
        </div>
      )}
    </div>
  );
};

export default GraphBrowser;
