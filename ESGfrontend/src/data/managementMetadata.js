export const managementData = {
  table_metadata: {
    sections: [
      {
        title: "Policy and management processes",
        metadata: {
          columns: [
            { col_id: "question", label: "Questions", type: "string", width: 400 },
            { col_id: "p1", label: "P1", type: "radio", options: ["Yes", "No"] },
            { col_id: "p2", label: "P2", type: "radio", options: ["Yes", "No"] },
            { col_id: "p3", label: "P3", type: "radio", options: ["Yes", "No"] },
            { col_id: "p4", label: "P4", type: "radio", options: ["Yes", "No"] },
            { col_id: "p5", label: "P5", type: "radio", options: ["Yes", "No"] },
            { col_id: "p6", label: "P6", type: "radio", options: ["Yes", "No"] },
            { col_id: "p7", label: "P7", type: "radio", options: ["Yes", "No"] },
            { col_id: "p8", label: "P8", type: "radio", options: ["Yes", "No"] },
            { col_id: "p9", label: "P9", type: "radio", options: ["Yes", "No"] }
          ],
          rows: [
            {
              row_id: "policy_coverage",
              label: "Whether your entity's policy/policies cover each principle and its core elements of the NGRBCs.",
              type: "radio"
            },
            {
              row_id: "board_approval",
              label: "Has the policy been approved by the Board?",
              type: "radio"
            },
            {
              row_id: "policy_links",
              label: "Web Link of the Policies, if available",
              type: "text"
            },
            {
              row_id: "policy_procedures",
              label: "Whether the entity has translated the policy into procedures.",
              type: "radio"
            }
          ]
        }
      },
      {
        title: "Details of Review of NGRBCs by the Company",
        metadata: {
          columns: [
            { col_id: "subject", label: "Subject for Review", type: "string", width: 300 },
            { col_id: "review_by", label: "Indicate whether review was undertaken by Director/Committee of the Board/Any other Committee", type: "radio", options: ["Director", "Committee", "Other"] },
            { col_id: "frequency", label: "Frequency", type: "select", options: ["Annually", "Half yearly", "Quarterly", "Other"] }
          ],
          rows: [
            {
              row_id: "performance_review",
              label: "Performance against above policies and follow up action"
            },
            {
              row_id: "compliance_review",
              label: "Compliance with statutory requirements of relevance to the principles, and rectification of any non-compliances"
            }
          ]
        }
      },
      {
        title: "Non-compliance explanation",
        metadata: {
          columns: [
            { col_id: "reason", label: "Questions", type: "string", width: 400 },
            { col_id: "p1", label: "P1", type: "radio", options: ["Yes", "No"] },
            { col_id: "p2", label: "P2", type: "radio", options: ["Yes", "No"] },
            { col_id: "p3", label: "P3", type: "radio", options: ["Yes", "No"] },
            { col_id: "p4", label: "P4", type: "radio", options: ["Yes", "No"] },
            { col_id: "p5", label: "P5", type: "radio", options: ["Yes", "No"] },
            { col_id: "p6", label: "P6", type: "radio", options: ["Yes", "No"] },
            { col_id: "p7", label: "P7", type: "radio", options: ["Yes", "No"] },
            { col_id: "p8", label: "P8", type: "radio", options: ["Yes", "No"] },
            { col_id: "p9", label: "P9", type: "radio", options: ["Yes", "No"] }
          ],
          rows: [
            {
              row_id: "not_material",
              label: "The entity does not consider the Principles material to its business"
            },
            {
              row_id: "not_at_stage",
              label: "The entity is not at a stage where it is in a position to formulate and implement the policies on specified principles"
            },
            {
              row_id: "no_resources",
              label: "The entity does not have the financial or/human and technical resources available for the task"
            },
            {
              row_id: "next_year",
              label: "It is planned to be done in the next financial year"
            },
            {
              row_id: "other_reason",
              label: "Any other reason (please specify)",
              type: "text"
            }
          ]
        }
      }
    ]
  }
};
