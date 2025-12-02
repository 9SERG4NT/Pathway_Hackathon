# 🚀 Pathway Real-Time AI Pipeline — Hackathon Project

📦 **GitHub Repo:** https://github.com/9SERG4NT/Pathway_Hackathon  
🏆 **Submission for Pathway Hackathon 2025**

---

## 🧠 Overview

This project showcases a production-grade **real-time AI pipeline** built using **Pathway**, a Python framework for:

- Live data ingestion from streams  
- Incremental & low-latency transformations  
- Automatic chunking, embedding, and indexing of documents  
- Hybrid RAG search (Vector + BM25)  
- LLM-powered insights updated in real-time  

The system demonstrates how Pathway enables always-fresh data intelligence and eliminates the limitations of batch systems.

---

# 📌 Problem Statement

Most Retrieval-Augmented Generation (RAG) systems rely on external vector databases and batch ingestion. This leads to:

- Stale indexes  
- Delayed updates  
- Expensive re-ingestion cycles  

**Pathway solves this with a live-document-store architecture**, where:

- The vector index lives *inside* the pipeline  
- Data sources sync automatically  
- Updates propagate instantly  
- RAG queries always use fresh data  

This project implements a fully working example of real-time ingestion → processing → RAG → LLM insights → live UI.

---

# 🎯 Project Use Case

> A real-time unified data pipeline that ingests live or simulated streaming data, performs incremental transformations, builds a continuously updated document index, and exposes an LLM-powered RAG API for instant insights.

This architecture can support:

- IoT telemetry monitoring  
- ETA predictions for logistics  
- Predictive maintenance  
- Streaming fraud detection  
- Real-time finance analytics  
- Live personal financial advisory  
- Agentic AI systems requiring fresh context  

Our implementation demonstrates Pathway’s entire ecosystem end-to-end.

---

# 🛠️ Features

### 🔌 1. Live Data Ingestion
- Uses Pathway connectors + demo streams  
- Supports custom Python connectors  
- Continuously updates tables as new data arrives  

### 🧮 2. Streaming Transformations
- Incremental filters, joins, aggregations  
- Stateful computations  
- Temporal windows for feature engineering  

### 📚 3. Pathway Document Store
- Automatic chunking  
- Embedding + vector index  
- BM25 + semantic hybrid search  
- Always in sync with data  

### 🤖 4. Real-Time RAG + LLM xPack
- Live retrieval across continuously changing documents  
- Summaries, analytics, reasoning  
- Answers always reflect the latest data  

### 🌐 5. Web Interface + API
- Query engine powered by LLM  
- Real-time output  
- Clean and simple UX  

---

# 🧩 Architecture

         ┌─────────────────────────┐
         │     Live / Simulated     │
         │      Data Source         │
         └───────────┬─────────────┘
                     ▼
          ┌──────────────────────┐
          │   Pathway Connect    │
          │ (Ingestion Layer)    │
          └───────────┬──────────┘
                      ▼
      ┌──────────────────────────────────┐
      │  Streaming Transformations        │
      │ - filters, joins, windows         │
      │ - low-latency incremental logic   │
      └──────────────────┬───────────────┘
                         ▼
    ┌──────────────────────────────────────┐
    │   Pathway Document Store (RAG Core)  │
    │ - chunk + embed + index              │
    │ - BM25 + vector hybrid search        │
    └───────────────────┬──────────────────┘
                        ▼
        ┌─────────────────────────────────┐
        │     LLM xPack (RAG Engine)      │
        │  Query → Retrieve → Generate    │
        └─────────────────┬───────────────┘
                          ▼
           ┌────────────────────────────┐
           │     Web App / API Layer     │
           └────────────────────────────┘

---



The demo displays:

- Streaming ingestion  
- Real-time updates  
- Queryable RAG insights  
- Latest data reflections with no lag  


---

# ⚙️ Installation

### 1️⃣ Clone the repo
```bash
git clone https://github.com/9SERG4NT/Pathway_Hackathon.git
cd Pathway_Hackathon
```
2️⃣ Create virtual environment
```bash
python3 -m venv venv
source venv/bin/activate
```
3️⃣ Install dependencies
```bash
pip install -r requirements.txt
```
▶️ Running the Project
Start the backend (Pathway pipeline)
```bash
python app/server.py
```
Start the frontend (optional)
```bash
cd web
npm install
npm run dev
```
🧪 Hackathon Compliance Checklist
Requirement	Status
Live or simulated streaming data	✅ Yes
Use of Pathway connectors	✅ Yes
Incremental computations	✅ Yes
Windowing, joins, filters	✅ Yes
Real-time feature engineering	✅ Yes
LLM integration with xPack	✅ Yes
Document Store RAG pipeline	✅ Yes
Production readiness + deployment	✅ Yes
Follows Pathway templates/docs	✅ Yes

This project uses Pathway to its full potential as required.

📘 Pathway References Used

Connectors — https://pathway.com/developers/user-guide/connect/connectors-in-pathway

Custom connectors tutorial

Windowing & transforms — https://pathway.com/developers/user-guide/data-transformation/table-operations

LLM xPack — https://pathway.com/developers/user-guide/llm-xpack/overview

Live Data Framework templates

Agentic RAG cookbooks

Deployment & persistence guide

🔮 Future Improvements

Multi-source streaming RAG agent

Kafka-based ingestion

Predictive ML for anomalies or ETA

Real-time dashboards

Autonomous agent loops with LangGraph

🤝 Contributors

👤 Team Git Pushy
Developed for Pathway Hackathon 2025

⭐ Support

If you found this project helpful, consider giving the repository a ⭐ on GitHub!


