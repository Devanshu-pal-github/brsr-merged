export const turnoverTableMetadata = {
    headers: [
        {
            label: "Male",
            cell_type: "decimal",
            required: true,
            parent: "FY (Turnover rate in current FY)",
            min_value: 0,
            max_value: 100
        },
        {
            label: "Female",
            cell_type: "decimal",
            required: true,
            parent: "FY (Turnover rate in current FY)",
            min_value: 0,
            max_value: 100
        },
        {
            label: "Total",
            cell_type: "decimal",
            required: true,
            parent: "FY (Turnover rate in current FY)",
            min_value: 0,
            max_value: 100
        },
        {
            label: "Male",
            cell_type: "decimal",
            required: true,
            parent: "FY (Turnover rate in previous FY)",
            min_value: 0,
            max_value: 100
        },
        {
            label: "Female",
            cell_type: "decimal",
            required: true,
            parent: "FY (Turnover rate in previous FY)",
            min_value: 0,
            max_value: 100
        },
        {
            label: "Total",
            cell_type: "decimal",
            required: true,
            parent: "FY (Turnover rate in previous FY)",
            min_value: 0,
            max_value: 100
        },
        {
            label: "Male",
            cell_type: "decimal",
            required: true,
            parent: "FY (Turnover rate in the year prior to the previous FY)",
            min_value: 0,
            max_value: 100
        },
        {
            label: "Female",
            cell_type: "decimal",
            required: true,
            parent: "FY (Turnover rate in the year prior to the previous FY)",
            min_value: 0,
            max_value: 100
        },
        {
            label: "Total",
            cell_type: "decimal",
            required: true,
            parent: "FY (Turnover rate in the year prior to the previous FY)",
            min_value: 0,
            max_value: 100
        }
    ],
    rows: [
        {
            name: "Permanent Employees",
            required: true
        },
        {
            name: "Permanent Workers",
            required: true
        }
    ],
    column_groups: [
        {
            label: "FY (Turnover rate in current FY)",
            span: 3
        },
        {
            label: "FY (Turnover rate in previous FY)",
            span: 3
        },
        {
            label: "FY (Turnover rate in the year prior to the previous FY)",
            span: 3
        }
    ],
    restrictions: {
        min_rows: 2,
        max_rows: 2,
        decimal_places: 2,
        min_value: 0,
        max_value: 100
    }
}; 