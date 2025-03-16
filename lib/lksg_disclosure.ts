type LksgDisclosureItem = {
  label: string;
  db_name: string;
  question: string;
  yes_is_positive: boolean;
};

export const lksg_disclosure_items: LksgDisclosureItem[] = [
  // Child Labor
  {
    label: "Child Labor Prevention Processes",
    db_name: "child_labor_processes",
    question: "Do you have processes to prevent child labor?",
    yes_is_positive: true
  },
  {
    label: "Child Labor Violations",
    db_name: "child_labor_violation",
    question: "Have there been any child labor violations?",
    yes_is_positive: false
  },
  
  // Forced Labor
  {
    label: "Forced Labor Prevention Processes",
    db_name: "forced_labor_processes",
    question: "Do you have processes to prevent forced labor?",
    yes_is_positive: true
  },
  
  // Slavery
  {
    label: "Slavery Violations",
    db_name: "slavery_violation",
    question: "Have there been any slavery-related violations?",
    yes_is_positive: false
  },
  {
    label: "Slavery Prevention Processes",
    db_name: "slavery_processes",
    question: "Do you have processes to prevent slavery?",
    yes_is_positive: true
  },
  
  // Forced Eviction
  {
    label: "Forced Eviction Violations",
    db_name: "forced_eviction_violation",
    question: "Have there been any forced eviction violations?",
    yes_is_positive: false
  },
  {
    label: "Forced Eviction Prevention Processes",
    db_name: "forced_eviction_processes",
    question: "Do you have processes to prevent forced evictions?",
    yes_is_positive: true
  },
  
  // Security Forces
  {
    label: "Security Forces Violations",
    db_name: "security_forces_violation",
    question: "Have there been any security forces-related violations?",
    yes_is_positive: false
  },
  {
    label: "Security Forces Management Processes",
    db_name: "security_forces_processes",
    question: "Do you have processes regarding security forces?",
    yes_is_positive: true
  },
  
  // Workplace Safety
  {
    label: "Workplace Safety Violations",
    db_name: "workplace_safety_violation",
    question: "Have there been any workplace safety violations?",
    yes_is_positive: false
  },
  {
    label: "Workplace Safety Processes",
    db_name: "workplace_safety_processes",
    question: "Do you have workplace safety processes?",
    yes_is_positive: true
  },
  
  // Freedom of Association
  {
    label: "Freedom of Association Violations",
    db_name: "freedom_association_violation",
    question: "Have there been any freedom of association violations?",
    yes_is_positive: false
  },
  {
    label: "Freedom of Association Protection Processes",
    db_name: "freedom_association_processes",
    question: "Do you have processes to protect freedom of association?",
    yes_is_positive: true
  },
  
  // Employment Discrimination
  {
    label: "Discrimination Violations",
    db_name: "employment_discrimination_violation",
    question: "Have there been any discrimination violations?",
    yes_is_positive: false
  },
  {
    label: "Anti-Discrimination Processes",
    db_name: "employment_discrimination_processes",
    question: "Do you have anti-discrimination processes?",
    yes_is_positive: true
  },
  
  // Fair Wages
  {
    label: "Fair Wage Violations",
    db_name: "fair_wage_violation",
    question: "Have there been any fair wage violations?",
    yes_is_positive: false
  },
  {
    label: "Fair Wage Processes",
    db_name: "fair_wage_processes",
    question: "Do you have fair wage processes?",
    yes_is_positive: true
  },
  
  // Mercury Usage
  {
    label: "Mercury-Related Violations",
    db_name: "mercury_violation",
    question: "Have there been any mercury-related violations?",
    yes_is_positive: false
  },
  {
    label: "Mercury Handling Processes",
    db_name: "mercury_processes",
    question: "Do you have processes regarding mercury handling?",
    yes_is_positive: true
  },
  
  // Organic Pollutants
  {
    label: "Organic Pollutant Violations",
    db_name: "organic_pollutants_violation",
    question: "Have there been any organic pollutant violations?",
    yes_is_positive: false
  },
  {
    label: "Organic Pollutants Handling Processes",
    db_name: "organic_pollutants_processes",
    question: "Do you have processes for handling organic pollutants?",
    yes_is_positive: true
  },
  
  // Hazardous Waste
  {
    label: "Hazardous Waste Violations",
    db_name: "hazardous_waste_violation",
    question: "Have there been any hazardous waste violations?",
    yes_is_positive: false
  },
  {
    label: "Hazardous Waste Management Processes",
    db_name: "hazardous_waste_processes",
    question: "Do you have hazardous waste management processes?",
    yes_is_positive: true
  },
  
  // Environmental Damage
  {
    label: "Environmental Damage Violations",
    db_name: "environmental_damage_violation",
    question: "Have there been any environmental damage violations?",
    yes_is_positive: false
  },
  {
    label: "Environmental Protection Processes",
    db_name: "environmental_damage_processes",
    question: "Do you have environmental protection processes?",
    yes_is_positive: true
  }
]