// Custom prompts for AI analysis based on regulation type

export function getLksgPrompt(companyName: string): string {
  return `Analyze recent news and regulatory updates about ${companyName} as a supplier from a compliance perspective. 
  Focus on human rights issues, environmental violations, or supply chain risks that could affect their compliance with the German Supply Chain Act (LkSG).
  Identify specific incidents that might create compliance risks for companies doing business with them.
  Highlight areas where a purchasing company might need to implement additional due diligence measures when working with this supplier.
  Evaluate how well the supplier meets LkSG requirements and what documentation a purchasing company should request.
  DO NOT include any action items, recommendations, or next steps in your analysis.`;
}

export function getCsrdPrompt(companyName: string): string {
  return `Analyze recent news and regulatory updates about ${companyName} as a supplier from a compliance perspective.
  Focus on the supplier's sustainability reporting practices and ESG disclosures that may impact a purchasing company's CSRD compliance obligations.
  Identify sustainability reporting gaps that could create risks for companies in their value chain.
  Highlight what additional information a purchasing company should request to ensure this supplier's activities align with CSRD requirements.
  Evaluate specific sustainability risks that might need to be included in a purchasing company's own CSRD reporting.
  DO NOT include any action items, recommendations, or next steps in your analysis.`;
}

export function getCbamPrompt(companyName: string): string {
  return `Analyze recent news and regulatory updates about ${companyName} as a supplier from a compliance perspective.
  Focus on the supplier's carbon emissions reporting, carbon pricing impacts, and how their products might be affected by CBAM.
  Identify specific carbon-intensive products that could create CBAM compliance costs for purchasing companies.
  Highlight what emissions data a purchasing company should request from this supplier to meet CBAM reporting requirements.
  Evaluate how this supplier's carbon footprint might affect a purchasing company's climate targets and reporting obligations.
  DO NOT include any action items, recommendations, or next steps in your analysis.`;
}

export function getReachPrompt(companyName: string): string {
  return `Analyze recent news and regulatory updates about ${companyName} as a supplier from a compliance perspective.
  Focus on the supplier's chemical substances management, REACH registration compliance, and product safety reporting.
  Identify specific substances of concern in their products that could create compliance issues for purchasing companies.
  Highlight what chemical safety documentation a purchasing company should request from this supplier.
  Evaluate how well the supplier meets REACH requirements and potential compliance risks for companies using their products.
  DO NOT include any action items, recommendations, or next steps in your analysis.`;
}

export function getGeneralPrompt(companyName: string): string {
  return `Analyze recent news and regulatory updates about ${companyName} as a supplier from a compliance perspective.
  Focus on compliance issues that might create regulatory, reputational, or legal risks for companies in their supply chain.
  Identify key ESG (Environmental, Social, and Governance) factors that purchasing companies should monitor.
  Highlight what documentation and information a purchasing company should request to verify compliance.
  Evaluate overall compliance risks and how they might impact a purchasing company's due diligence obligations.
  DO NOT include any action items, recommendations, or next steps in your analysis.`;
} 