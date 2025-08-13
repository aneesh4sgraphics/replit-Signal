# Troubleshooting PDFs Directory

This directory contains troubleshooting PDFs that are indexed for the AI chatbot's local search functionality.

## How to Add PDFs

1. **Add your PDF files to this directory**
   - Place any troubleshooting PDFs directly in this folder
   - Supported files: `.pdf` format only
   - Examples:
     - `Graffiti Machine Settings-Ver3.01.pdf`
     - `Trouble Shooting Guide for Digital Printing.pdf`
     - `SIMPLE+STATIC+REMOVER.pdf`
     - `TIPS FOR CLEANING Menus.pdf`

2. **Run the ingestion script**
   ```bash
   npx ts-node scripts/ingest.ts
   ```
   This will:
   - Parse all PDFs in this directory
   - Create searchable chunks of text
   - Build a BM25 search index
   - Save the index to `data/index/`

3. **Restart the application**
   - The chatbot will automatically use the new index
   - It will search these PDFs when answering questions

## Features

- **Hybrid Search**: The chatbot tries OpenAI first, then falls back to local PDF search if credits are exhausted
- **Source Citations**: Responses include references to specific PDFs and page numbers
- **Works Offline**: Local search works even without OpenAI API access

## Testing

Ask the chatbot questions like:
- "How to troubleshoot printing issues?"
- "What are the machine settings for digital printing?"
- "Tips for cleaning and maintenance"
- "How to remove static?"

The chatbot will search through the indexed PDFs and provide relevant answers with source citations.