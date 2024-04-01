import React, { Suspense } from "react";
import LoadingPage from "../components/LoadingPage";

const Home: React.FC = async () => {
  return (
    <main className="bg-gray-100 py-10">
      <div className="container mx-auto px-4">
        <div className="bg-white p-6 rounded shadow">
          <h1
            style={{ color: "#950019" }}
            className="text-4xl font-bold mb-4 text-center text-blue-700"
          >
            Welcome to the Observer Project
          </h1>
          <p className="text-lg text-justify mx-8 py-8 text-gray-700">
            Welcome to The Observer Repository. We specialize in aggregating and
            curating comprehensive clinic visit data, including video, audio,
            transcript, EHR data, and audit log information, to provide an
            unparalleled view of the dynamics of patient-provider interactions.
            Adhering to the FAIR data management principles, our repository is
            designed for researchers seeking to delve into the depths of
            telemedicine and in-person consultations. Here, we invite
            collaboration, foster innovation, and aim to unlock new insights in
            medical research and pave the way for advancements in patient care
            and healthcare delivery.
          </p>
          <p className="text-lg text-justify mx-8 text-gray-700">
            The Observer Repository is a state-of-the-art multimodal platform
            equipped to store a variety of data formats, including MOV and MP4
            for high-quality video, MP3 for audio, TXT for text transcripts, and
            EHR audit log files in formats like .log, .xml, .csv, or .txt. This
            range ensures a detailed capture of clinic visit dynamics, providing
            a rich, multidimensional dataset for exploring the complexities of
            patient-provider interactions, from verbal exchanges to non-verbal
            cues.
          </p>
          <div className="flex flex-col items-center justify-center py-5">
            <div className="w-full max-w-4xl p-4 bg-gray-200 rounded-md shadow-md mt-6">
              <h2 className="text-2xl font-bold mb-2 text-blue-700">
                Demographics Table
              </h2>
              <Suspense fallback={<LoadingPage />}></Suspense>
            </div>
            <p className="text-lg text-justify mx-8 mt-6 text-gray-700">
              This table contains real-time details regarding patient
              participant population demographics for visits housed in The
              Observer Repository.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
