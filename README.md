# CIAYN (Compliance Is All You Need) - Supply Chain ESG Risk Analysis Platform

![CIAYN Banner](https://img.shields.io/badge/CIAYN-Supply%20Chain%20ESG%20Analysis-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## Overview

CIAYN is an advanced platform designed to help businesses monitor, assess, and mitigate ESG (Environmental, Social, and Governance) risks across their supply chains. By leveraging real-time news analysis and AI-powered insights, CIAYN provides comprehensive risk assessments and actionable recommendations to ensure compliance with emerging regulations.

## Key Features

- **Real-time News Monitoring**: Automatically tracks and analyzes news about your suppliers from global sources
- **AI-Powered Risk Analysis**: Uses Google's Gemini 2.0 Flash API to provide intelligent assessment of ESG risks
- **Comprehensive Risk Categorization**: Classifies risks across four key domains:
  - 🌱 **Environmental**: Climate impact, pollution, resource usage
  - 👥 **Social**: Labor practices, human rights, community impact
  - 🏛️ **Governance**: Corporate structure, ethics, transparency
  - 📝 **Compliance**: Regulatory adherence, certifications, legal exposure
- **Sourced Insights**: Every finding links back to its source article for verification and deeper understanding
- **Actionable Recommendations**: Provides concrete steps for risk mitigation and due diligence
- **Supplier Dossiers**: Create and maintain detailed profiles of your suppliers including risk scores
- **Document Management**: Upload and organize relevant supplier documentation

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: Google Gemini 2.0 Flash
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Gemini API key
- Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ciayn.git
   cd ciayn
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env.local` file in the project root and add the following:
   ```
   # Supabase configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Google Gemini API key - required for AI analysis
   # Get your API key from https://makersuite.google.com/app/apikey
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Setting up the Gemini API

The AI analysis functionality requires a valid Google Gemini API key:

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey) to create an account and get your API key
2. Add the key to your `.env.local` file as `GEMINI_API_KEY=your_key_here`
3. Restart the development server if it's already running

## Usage Guide

### Supplier Search and Risk Assessment

1. **Search for a Supplier**: Enter the supplier name to search for relevant information
2. **View News Feed**: Review recent news articles about the supplier
3. **AI Analysis**: Click on the "AI Analysis" tab to generate a comprehensive risk assessment
4. **Explore Findings**: Review categorized risks, key findings, and recommendations
5. **Access Sources**: Click on link icons to access source articles for each finding
6. **Upload Documents**: Add relevant supplier documentation to complete your due diligence

### Understanding Risk Categories

- **Environmental**: Factors impacting the natural environment, climate change contributions, pollution, resource usage
- **Social**: Issues related to people, labor practices, human rights, workplace safety, diversity, and community relations
- **Governance**: Internal system of practices, controls, and procedures for company governance, ethics, and compliance
- **Compliance**: Adherence to regulations such as LKSG, CBAM, CSDD, CSRD, and REACH

## Architecture

The application follows a modern architecture pattern:

- **Page Components**: Main interface elements built with React and Next.js
- **API Routes**: Serverless functions for handling backend operations
- **Supabase Integration**: Database storage and authentication
- **AI Integration**: Connection to Google's Gemini API for analysis

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## About

CIAYN (Compliance Is All You Need) was developed to help businesses navigate the increasingly complex landscape of supply chain ESG risks and regulations. Our mission is to make compliance accessible, actionable, and integrated into everyday business operations.

---

© 2025 CIAYN - Compliance Is All You Need 
