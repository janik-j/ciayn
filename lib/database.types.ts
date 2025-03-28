export interface Database {
  public: {
    Tables: {
      lksg_disclosures: {
        Row: {
          id: number;
          user_id: string;
          child_labor_violation: boolean;
          child_labor_processes: boolean;
          forced_labor_processes: boolean;
          slavery_violation: boolean;
          slavery_processes: boolean;
          forced_eviction_violation: boolean;
          forced_eviction_processes: boolean;
          security_forces_violation: boolean;
          security_forces_processes: boolean;
          workplace_safety_violation: boolean;
          workplace_safety_processes: boolean;
          freedom_association_violation: boolean;
          freedom_association_processes: boolean;
          employment_discrimination_violation: boolean;
          employment_discrimination_processes: boolean;
          fair_wage_violation: boolean;
          fair_wage_processes: boolean;
          mercury_violation: boolean;
          mercury_processes: boolean;
          organic_pollutants_violation: boolean;
          organic_pollutants_processes: boolean;
          hazardous_waste_violation: boolean;
          hazardous_waste_processes: boolean;
          environmental_damage_violation: boolean;
          environmental_damage_processes: boolean;
          last_updated: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          child_labor_violation?: boolean;
          child_labor_processes?: boolean;
          forced_labor_processes?: boolean;
          slavery_violation?: boolean;
          slavery_processes?: boolean;
          forced_eviction_violation?: boolean;
          forced_eviction_processes?: boolean;
          security_forces_violation?: boolean;
          security_forces_processes?: boolean;
          workplace_safety_violation?: boolean;
          workplace_safety_processes?: boolean;
          freedom_association_violation?: boolean;
          freedom_association_processes?: boolean;
          employment_discrimination_violation?: boolean;
          employment_discrimination_processes?: boolean;
          fair_wage_violation?: boolean;
          fair_wage_processes?: boolean;
          mercury_violation?: boolean;
          mercury_processes?: boolean;
          organic_pollutants_violation?: boolean;
          organic_pollutants_processes?: boolean;
          hazardous_waste_violation?: boolean;
          hazardous_waste_processes?: boolean;
          environmental_damage_violation?: boolean;
          environmental_damage_processes?: boolean;
          last_updated?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          child_labor_violation?: boolean;
          child_labor_processes?: boolean;
          forced_labor_processes?: boolean;
          slavery_violation?: boolean;
          slavery_processes?: boolean;
          forced_eviction_violation?: boolean;
          forced_eviction_processes?: boolean;
          security_forces_violation?: boolean;
          security_forces_processes?: boolean;
          workplace_safety_violation?: boolean;
          workplace_safety_processes?: boolean;
          freedom_association_violation?: boolean;
          freedom_association_processes?: boolean;
          employment_discrimination_violation?: boolean;
          employment_discrimination_processes?: boolean;
          fair_wage_violation?: boolean;
          fair_wage_processes?: boolean;
          mercury_violation?: boolean;
          mercury_processes?: boolean;
          organic_pollutants_violation?: boolean;
          organic_pollutants_processes?: boolean;
          hazardous_waste_violation?: boolean;
          hazardous_waste_processes?: boolean;
          environmental_damage_violation?: boolean;
          environmental_damage_processes?: boolean;
          last_updated?: string;
        };
      };
    };
  };
}
