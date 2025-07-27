# 🔎 Salesforce Dynamic List View Excel Exporter

This Lightning Web Component (LWC) allows users to export a filtered list view of Salesforce records to Excel with just a few clicks. It supports dynamic field selection, record type filtering, and owner mapping logic.


**Component Review **

https://github.com/user-attachments/assets/d74d514e-ddcb-4527-90b1-b69b23ced33f

## 📦 Features

- ✅ Export Salesforce records to Excel
- ✅ Dynamic SOQL query construction
- ✅ Handles complex fields like `RecordType.Name` and `Owner.Alias`
- ✅ Fallback logic for unsupported fields
- ✅ Retry mechanism for wire data load
- ✅ Configurable columns and record selection
- ✅ Toast notifications for error handling

## 🚀 How It Works

1. User select the particular List View of Object
2. Component fetches data using Apex via a dynamic SOQL query.
3. Fields like `Owner.Alias` and `RecordType.Name` are conditionally mapped.
4. Data is transformed and downloaded as an Excel file.

## 🛠️ Technologies Used

- Apex (dynamic SOQL)
- Lightning Web Components (LWC)
- JavaScript (Excel file generation)
- Salesforce UI APIs


