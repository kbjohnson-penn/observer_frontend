import React, { type JSX } from 'react';

const Step = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h2 className="text-xl font-semibold mt-6 mb-3 text-blue-800">{title}</h2>
    <div>{children}</div>
  </div>
);

const Section = ({
  title,
  instructions,
  fields,
}: {
  title: string;
  instructions: JSX.Element;
  fields: JSX.Element;
}) => (
  <div>
    <h3 className="text-lg font-semibold mt-4 mb-2 text-blue-600">{title}</h3>
    <ul className="list-disc ml-8 mb-2">{instructions}</ul>
    <h4 className="font-medium ml-8 mt-2">Fields:</h4>
    <ul className="list-disc ml-12 mb-4">{fields}</ul>
  </div>
);

const Documentation: React.FC = () => {
  return (
    <main className="bg-slate-50 py-10">
      <div className="container mx-auto px-4">
        <div className="bg-white p-6 rounded shadow">
          <div className="p-8">
            <h1 style={{ color: '#950019' }} className="text-3xl font-bold mb-4 text-center">
              Observer Backend Documentation
            </h1>
            <p className="mb-4">
              This guide provides detailed instructions on how to use the Observer backend to manage
              data entries through the Django Admin interface. The Observer backend is a web-based
              application designed to store and manage data related to patient encounters, including
              patient information, provider details, and multimodal data paths. The backend allows
              users to create, edit, and delete entries for each of these data types, as well as
              view and search for existing records. This documentation outlines the steps required
              to log in to the Observer backend, fill out the necessary forms, review and submit the
              data, and log out securely.
            </p>
            <Step title="Step 1: Log In to the Observer Backend">
              <ul className="list-disc ml-8 mb-4">
                <li>Open your web browser and navigate to the login page.</li>
                <li>Enter your username and password in the respective fields.</li>
                {/* <li>Click the login button to access the dashboard.</li> */}
                <li>Navigate to the dashboard to access admin features.</li>
              </ul>
            </Step>

            <Step title="Step 2: Fill Out the Forms">
              <Section
                title="2.1 Encounter Source Form"
                instructions={
                  <>
                    <li>Navigate to the Encounter Source section in the admin panel.</li>
                    <li>Click on “Add Encounter Source” or “+Add”.</li>
                  </>
                }
                fields={
                  <>
                    <li>
                      <strong>Name:</strong> Enter a unique name for the encounter source. This
                      field is mandatory.
                    </li>
                  </>
                }
              />
              <Section
                title="2.2 Department Form"
                instructions={
                  <>
                    <li>Navigate to the Department section.</li>
                    <li>Click on “Add Department” or “+Add”.</li>
                  </>
                }
                fields={
                  <>
                    <li>
                      <strong>Name:</strong> Enter a unique name for the department. This field is
                      mandatory.
                    </li>
                  </>
                }
              />
              <Section
                title="2.3 Patient Form"
                instructions={
                  <>
                    <li>Navigate to the Patient section.</li>
                    <li>Click on “Add Patient” or “+Add”.</li>
                  </>
                }
                fields={
                  <>
                    <li>
                      <strong>Patient ID:</strong> Mandatory, unique identifier for the patient.
                    </li>
                    <li>
                      <strong>First Name:</strong> Optional.
                    </li>
                    <li>
                      <strong>Last Name:</strong> Optional.
                    </li>
                    <li>
                      <strong>Date of Birth:</strong> Optional. Use a date picker if available.
                    </li>
                    <li>
                      <strong>Sex:</strong> Optional. Select from predefined choices if available.
                    </li>
                    <li>
                      <strong>Race:</strong> Optional. Select from predefined choices if available.
                    </li>
                    <li>
                      <strong>Ethnicity:</strong> Optional. Select from predefined choices if
                      available.
                    </li>
                  </>
                }
              />
              <Section
                title="2.4 Provider Form"
                instructions={
                  <>
                    <li>Navigate to the Provider section.</li>
                    <li>Click on “Add Provider” or “+Add”.</li>
                  </>
                }
                fields={
                  <>
                    <li>
                      <strong>Provider ID:</strong> Mandatory, unique identifier for the provider.
                    </li>
                    <li>
                      <strong>First Name:</strong> Optional.
                    </li>
                    <li>
                      <strong>Last Name:</strong> Optional.
                    </li>
                    <li>
                      <strong>Date of Birth:</strong> Optional.
                    </li>
                    <li>
                      <strong>Sex:</strong> Optional. Select from predefined choices if available.
                    </li>
                    <li>
                      <strong>Race:</strong> Optional. Select from predefined choices if available.
                    </li>
                    <li>
                      <strong>Ethnicity:</strong> Optional. Select from predefined choices if
                      available.
                    </li>
                  </>
                }
              />
              <Section
                title="2.5 Multimodal Data Path Form"
                instructions={
                  <>
                    <li>Navigate to the Multimodal Data Path section.</li>
                    <li>Click on “Add Multimodal Data Path” or “+Add”.</li>
                  </>
                }
                fields={
                  <>
                    <li>
                      <strong>Multi Modal Data ID:</strong> Mandatory, unique identifier for the
                      multimodal data path.
                    </li>
                    <li>
                      <strong>Provider View:</strong> Optional, URL field.
                    </li>
                    <li>
                      <strong>Patient View:</strong> Optional, URL field.
                    </li>
                    <li>
                      <strong>Room View:</strong> Optional, URL field.
                    </li>
                    <li>
                      <strong>Audio:</strong> Optional, URL field.
                    </li>
                    <li>
                      <strong>Transcript:</strong> Optional, URL field.
                    </li>
                    <li>
                      <strong>Patient Survey:</strong> Optional, URL field.
                    </li>
                    <li>
                      <strong>Provider Survey:</strong> Optional, URL field.
                    </li>
                    <li>
                      <strong>RIAS Transcript:</strong> Optional, URL field.
                    </li>
                    <li>
                      <strong>RIAS Codes:</strong> Optional, URL field.
                    </li>
                  </>
                }
              />
              <Section
                title="2.6 Encounter Form"
                instructions={
                  <>
                    <li>Navigate to the Encounter section.</li>
                    <li>Click on “Add Encounter” or “+Add”.</li>
                  </>
                }
                fields={
                  <>
                    <li>
                      <strong>Case ID:</strong> Mandatory, unique identifier for the encounter.
                    </li>
                    <li>
                      <strong>Encounter Source:</strong> Select from a list. Mandatory.
                    </li>
                    <li>
                      <strong>Department:</strong> Select from a list. Mandatory.
                    </li>
                    <li>
                      <strong>Provider:</strong> Select from a list. Mandatory.
                    </li>
                    <li>
                      <strong>Patient:</strong> Select from a list. Mandatory.
                    </li>
                    <li>
                      <strong>Multi Modal Data:</strong> Select from a list. Mandatory.
                    </li>
                    <li>
                      <strong>Encounter Date and Time:</strong> Mandatory, date and time field.
                    </li>
                    <li>
                      <strong>Provider Satisfaction:</strong> Optional, default 0. Numeric field
                      with range validation.
                    </li>
                    <li>
                      <strong>Patient Satisfaction:</strong> Optional, default 0. Numeric field with
                      range validation.
                    </li>
                    <li>
                      <strong>Is Deidentified:</strong> Boolean, pre-selected as False.
                    </li>
                    <li>
                      <strong>Is Restricted:</strong> Boolean, pre-selected as True.
                    </li>
                  </>
                }
              />
            </Step>

            <Step title="Step 3: Review and Submit">
              Review the information to ensure accuracy and completeness before saving each form.
            </Step>

            <Step title="Step 4: Logout">
              After completing all form entries, securely log out of the admin interface to protect
              your data and access credentials.
            </Step>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Documentation;
