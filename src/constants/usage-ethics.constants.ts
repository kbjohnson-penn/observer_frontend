import type { UsageEthics } from '@/interfaces/dataset.d';

export const USAGE_ETHICS: UsageEthics = {
  citation: {
    text: "Observer Repository",
    bibtex: `@article{johnson2025observer,
  title={The Observer Repository: Advancing Ambulatory Care Innovation Through Video-Based Clinical Ethnography},
  author={Johnson, Kevin B and Alasaly, Basam and Jang, Kuk Jin and Eaton, Eric and Mopidevi, Sriharsha and Koppel, Ross},
  journal={medRxiv},
  pages={2025--05},
  year={2025},
  publisher={Cold Spring Harbor Laboratory Press}
}`,
    doi: "10.1101/2025.05.18.25327837",
    url: "https://doi.org/10.1101/2025.05.18.25327837",
    apa: "Johnson, K. B., Alasaly, B., Jang, K. J., Eaton, E., Mopidevi, S., & Koppel, R. (2025). The Observer Repository: Advancing Ambulatory Care Innovation Through Video-Based Clinical Ethnography. medRxiv, 2025-05.",
    mla: "Johnson, Kevin B., et al. \"The Observer Repository: Advancing Ambulatory Care Innovation Through Video-Based Clinical Ethnography.\" medRxiv (2025): 2025-05.",
    chicago: "Johnson, Kevin B., Basam Alasaly, Kuk Jin Jang, Eric Eaton, Sriharsha Mopidevi, and Ross Koppel. \"The Observer Repository: Advancing Ambulatory Care Innovation Through Video-Based Clinical Ethnography.\" medRxiv (2025): 2025-05.",
    harvard: "Johnson, K.B., Alasaly, B., Jang, K.J., Eaton, E., Mopidevi, S. and Koppel, R., 2025. The Observer Repository: Advancing Ambulatory Care Innovation Through Video-Based Clinical Ethnography. medRxiv, pp.2025-05.",
    vancouver: "Johnson KB, Alasaly B, Jang KJ, Eaton E, Mopidevi S, Koppel R. The Observer Repository: Advancing Ambulatory Care Innovation Through Video-Based Clinical Ethnography. medRxiv. 2025:2025-05."
  },
  dataUseAgreement: {
    title: "Observer Repository Data Use Agreement",
    sections: [
      {
        title: "Permitted Uses", 
        content: "This dataset may be used for academic research, educational purposes, and non-commercial healthcare informatics studies. Users must obtain appropriate IRB approval when required by their institution."
      },
      {
        title: "Restrictions",
        content: "Commercial use is prohibited without explicit written permission. Re-identification attempts are strictly forbidden. Data may not be redistributed or shared outside approved research teams without permission."
      },
      {
        title: "Attribution Requirements",
        content: "All publications, presentations, or derivative works must cite the dataset using the provided citation format. Acknowledgment of the data contributors and funding sources is required."
      },
      {
        title: "Data Security",
        content: "Users must implement appropriate technical and administrative safeguards to protect the data. Access should be limited to authorized research team members only."
      },
      {
        title: "Publication Guidelines", 
        content: "Research findings should be reported in aggregate form. Individual case details should not be presented in ways that could potentially enable re-identification."
      }
    ]
  },
  privacy: {
    deidentificationMethods: [
      "Face blurring in all video recordings",
      "Voice modification in audio content to prevent speaker identification",
      "Removal of direct identifiers (names, addresses, phone numbers, etc.)",
      "Date shifting with preservation of temporal relationships",
      "Geographic generalization to region level",
      "Suppression of rare demographic combinations"
    ],
    privacyProtections: [
      "HIPAA Safe Harbor compliance verification",
      "Expert determination review of deidentification adequacy", 
      "Statistical disclosure control analysis",
      "Legal review of privacy protection measures",
      "Ongoing monitoring for potential re-identification risks"
    ],
    dataRetention: "Dataset will be maintained for a minimum of 10 years to support reproducible research. Access controls and monitoring will be maintained throughout the retention period."
  },
  version: {
    current: "1.0",
    releaseDate: "2024-01-15",
    changelog: [
      {
        version: "1.0",
        date: "2024-01-15", 
        changes: [
          "Initial release of Observer Repository platform",
          "FAIR data principles implementation",
          "Multimodal data format support (MOV/MP4, MP3, text, EHR logs)",
          "Comprehensive clinic visit data aggregation and curation",
          "Telemedicine and in-person consultation data support",
          "Complete OMOP CDM v6.0 implementation",
          "Advanced deidentification with research utility preservation"
        ]
      }
    ]
  }
};