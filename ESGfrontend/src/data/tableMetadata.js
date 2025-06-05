export const policyDisclosures = {
  sections: [
    {
      title: "Policy and management processes",
      table_metadata: {
        columns: [
          { col_id: "question", label: "Questions", type: "string", width: 400 },
          { col_id: "p1", label: "P1", type: "radio" },
          { col_id: "p2", label: "P2", type: "radio" },
          { col_id: "p3", label: "P3", type: "radio" },
          { col_id: "p4", label: "P4", type: "radio" },
          { col_id: "p5", label: "P5", type: "radio" },
          { col_id: "p6", label: "P6", type: "radio" },
          { col_id: "p7", label: "P7", type: "radio" },
          { col_id: "p8", label: "P8", type: "radio" },
          { col_id: "p9", label: "P9", type: "radio" }
        ],
        rows: [
          {
            row_id: "policy_coverage",
            label: "Whether your entity's policy/policies cover each principle and its core elements",
            note: "Select Yes/No for each principle"
          },
          {
            row_id: "board_approval",
            label: "Has the policy been approved by the Board?",
            note: "Select Yes/No for each principle"
          },
          {
            row_id: "policy_links",
            label: "Web Link of the Policies, if available",
            note: "Enter web link if available"
          }
        ]
      }
    },
    {
      title: "Governance, leadership and oversight",
      table_metadata: {
        columns: [
          { col_id: "question", label: "Questions", type: "string", width: 400 },
          { col_id: "p1", label: "P1", type: "radio" },
          { col_id: "p2", label: "P2", type: "radio" },
          { col_id: "p3", label: "P3", type: "radio" },
          { col_id: "p4", label: "P4", type: "radio" },
          { col_id: "p5", label: "P5", type: "radio" },
          { col_id: "p6", label: "P6", type: "radio" },
          { col_id: "p7", label: "P7", type: "radio" },
          { col_id: "p8", label: "P8", type: "radio" },
          { col_id: "p9", label: "P9", type: "radio" }
        ],
        rows: [
          {
            row_id: "value_chain",
            label: "Do the enlisted policies extend to your value chain partners?",
            note: "Select Yes/No for each principle"
          },
          {
            row_id: "certifications",
            label: "Name of the national and international codes/certifications/labels/standards",
            note: "Enter details for each principle"
          }
        ]
      }
    }
  ]
};
