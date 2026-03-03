# Brian Home Document AI — App Summary

> **What it does:** Automatically reads invoices, receipts, and purchase orders and pulls out the important data for you — no manual typing required.

---

## 🧠 What Is This App?

Brian Home Document AI is a **web application** that uses **SAP's Artificial Intelligence** to read business documents (like invoices and receipts) and automatically extract key information such as:

- Invoice numbers
- Vendor names
- Dates
- Amounts (subtotal, tax, total)
- Line items (individual products/services listed on the invoice)

Instead of manually reading through documents and typing data into spreadsheets, you simply **upload the file** and the AI does the work for you in seconds.

---

## 🖥️ The Three Screens

### 1. Login Page
This is where you sign in to access the app.

| What you see | What it does |
|---|---|
| **Sign In tab** | Enter your email and password to log in |
| **Sign Up tab** | Create a new account if you don't have one |
| **Google button** | Sign in using your Google account (when configured) |

### 2. Extract Page (Main Screen)
This is where the magic happens — you upload documents and get data back.

| What you see | What it does |
|---|---|
| **Upload zone** | Drag & drop files or click to browse your computer |
| **File list** | Shows the files you've selected with previews |
| **Rotation selector** | Rotate images that are sideways or upside-down |
| **Document Type selector** | Tell the AI what kind of document it is (Invoice, Receipt, Purchase Order) |
| **Extract All button** | Starts the AI extraction process |
| **Results section** | Displays all the extracted data in organized cards |
| **Export to Excel button** | Downloads all extracted data as a spreadsheet file |
| **Processing History** | Shows a log of your recent extractions |

### 3. Dashboard Page
This shows your usage statistics and trends over time.

| What you see | What it does |
|---|---|
| **Total Documents** | How many documents you've processed overall |
| **Processed Today** | How many you've done today |
| **Avg Confidence** | How confident the AI is in its extractions (higher = better) |
| **Charts** | Visual graphs showing activity over time |
| **Recent Extractions table** | A list of your latest processed documents |

---

## 📄 Supported File Types

| File Type | Extension |
|---|---|
| PDF documents | `.pdf` |
| Photos / Scans | `.png`, `.jpg`, `.jpeg` |
| TIFF images | `.tiff`, `.tif` |

> 💡 **Tip:** For best results, make sure your documents are clear, not blurry, and right-side up. Use the rotation option for sideways scans.

---

## 🔄 How To Use It (Step by Step)

1. **Open the app** in your browser at `http://localhost:3000`
2. **Log in** with your email and password
3. **Upload** one or more documents (drag & drop or click to browse)
4. **Select** the document type (Invoice, Receipt, or Purchase Order)
5. **Click "Extract All"** and wait a few seconds
6. **Review** the extracted data — header fields and line items
7. **Export to Excel** if you want the data in a spreadsheet
8. **Visit the Dashboard** to see your processing trends

---

## 🎨 Design

The app uses **SAP Fiori design** — the same look and feel used by SAP enterprise software worldwide. This means:

- Clean, professional appearance with the **Morning Horizon** light theme
- Consistent blue accent colors (`SAP Blue`)
- Easy-to-read typography using the **SAP 72 font**
- Familiar card-based layout

---

## 🏗️ How It Works (Simple Explanation)

```
You upload a document
        ↓
The app sends it to SAP Document AI (the "brain")
        ↓
SAP AI reads the document and finds key fields
        ↓
The data comes back organized into:
  • Header Fields (invoice number, date, vendor, total, etc.)
  • Line Items (each product/service listed)
  • Confidence scores (how sure the AI is about each value)
        ↓
You review, verify, and export to Excel
```

---

## 🔑 Key Terms

| Term | Meaning |
|---|---|
| **Extraction** | The process of the AI reading a document and pulling out data |
| **Header Fields** | The main information at the top of a document (invoice number, date, vendor name, total amount) |
| **Line Items** | The individual rows in a document listing each product or service |
| **Confidence Score** | A percentage showing how sure the AI is about a value. Green (80%+) = very confident. Orange (50-79%) = somewhat confident. Red (below 50%) = needs review |
| **Batch Processing** | Uploading and extracting multiple documents at once |

---

## ⚠️ Things To Know

- The AI works best with **standard invoice formats** — handwritten or unusual layouts may have lower accuracy
- Always **review the extracted data** before using it, especially fields with low confidence scores (orange or red badges)
- The app stores your processing history **locally in your browser** — clearing browser data will erase this history
- You can process **multiple documents at once** — the app handles them one by one and shows progress

---

## 📁 Project Location

The app files are stored at:
```
C:\Users\b.kahihu.TROLLEY\.gemini\antigravity\scratch\document-ai-BTP-v2
```

| Folder/File | What's inside |
|---|---|
| `webapp/` | All the front-end code (what you see in the browser) |
| `app.py` | The back-end server that talks to SAP AI |
| `bills_data/` | Sample invoice files for testing |
| `requirements.txt` | List of software the server needs |
