'use client';

import { Header } from "@/components/header"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { lksg_disclosure_items } from '@/lib/lksg_disclosure'

interface LKSGDisclosure {
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
}

export default function DisclosurePage() {
  const router = useRouter();
  const [disclosure, setDisclosure] = useState<LKSGDisclosure | null>(null);
  const [originalDisclosure, setOriginalDisclosure] = useState<LKSGDisclosure | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Check if current disclosure differs from original
  useEffect(() => {
    if (disclosure && originalDisclosure) {
      // Compare every field to see if there are changes
      const changed = Object.keys(disclosure).some(key => {
        if (key === 'last_updated') return false; // Ignore timestamp
        return disclosure[key as keyof LKSGDisclosure] !== originalDisclosure[key as keyof LKSGDisclosure];
      });
      setHasChanges(changed);
    } else {
      setHasChanges(false);
    }
  }, [disclosure, originalDisclosure]);

  useEffect(() => {
    const fetchDisclosure = async () => {
      try {
        // First check if user is authenticated
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError || !session) {
          console.error('Authentication error:', authError);
          router.push('/login');
          return;
        }
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No user found');
          router.push('/login');
          return;
        }

        console.log('Fetching disclosures for user:', user.id);
        
        // Now try to fetch the disclosure data
        const { data, error } = await supabase
          .from('lksg_disclosures')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 is the error code for no rows returned
          console.error('Error fetching disclosure:', error);
          setErrorMessage(`Error fetching disclosure data: ${error.message}`);
          return;
        }

        if (data) {
          console.log('Disclosure data found:', data);
          setDisclosure(data as LKSGDisclosure);
          setOriginalDisclosure(data as LKSGDisclosure);
        } else {
          console.log('No disclosure data found for user');
        }
      } catch (error) {
        console.error('Error in fetchDisclosure:', error);
        setErrorMessage('An unexpected error occurred. Please try again later.');
      }
    };

    fetchDisclosure();
  }, [router]);

  // Define the categories in the correct order
  const categories = [
    'Child Labor',
    'Forced Labor',
    'Slavery',
    'Forced Eviction',
    'Security Forces',
    'Workplace Safety',
    'Freedom of Association',
    'Employment Discrimination',
    'Fair Wages',
    'Mercury Usage',
    'Organic Pollutants',
    'Hazardous Waste',
    'Environmental Damage'
  ];
  
  // Map db_name prefixes to their categories
  const categoryMap: Record<string, string> = {
    'child': 'Child Labor',
    'forced_labor': 'Forced Labor',
    'slavery': 'Slavery',
    'forced_eviction': 'Forced Eviction',
    'security_forces': 'Security Forces',
    'workplace_safety': 'Workplace Safety',
    'freedom_association': 'Freedom of Association',
    'employment_discrimination': 'Employment Discrimination',
    'fair_wage': 'Fair Wages',
    'mercury': 'Mercury Usage',
    'organic_pollutants': 'Organic Pollutants',
    'hazardous_waste': 'Hazardous Waste',
    'environmental_damage': 'Environmental Damage'
  };
  
  // Build sections from disclosure items
  const sections = categories.map(category => {
    const fields = lksg_disclosure_items
      .filter(item => {
        // Match by the relevant db_name prefix
        return Object.entries(categoryMap).some(([prefix, cat]) => {
          return cat === category && item.db_name.startsWith(prefix);
        });
      })
      .map(item => ({
        id: item.db_name,
        label: item.question,
        yes_is_positive: item.yes_is_positive
      }));
    
    return {
      section: category,
      fields
    };
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">LKSG Disclosures</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <form 
            className="space-y-8"
            onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              setSubmitStatus('idle');
              setErrorMessage(null);
              
              try {
                // Get the current user
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                  setErrorMessage('You must be logged in to submit disclosures');
                  setSubmitStatus('error');
                  return;
                }
                
                // Create an object to hold all the form values
                const formValues: Record<string, boolean> = {};
                
                // Process all questions to ensure we have all field IDs
                lksg_disclosure_items.forEach(item => {
                  // Get the selected value for this field
                  const yesInput = document.getElementById(`${item.db_name}-yes`) as HTMLInputElement | null;
                  const noInput = document.getElementById(`${item.db_name}-no`) as HTMLInputElement | null;
                  
                  // Check which one is checked
                  if (yesInput && yesInput.checked) {
                    formValues[item.db_name] = true;
                  } else if (noInput && noInput.checked) {
                    formValues[item.db_name] = false;
                  } else {
                    // Default to false if neither is checked
                    formValues[item.db_name] = false;
                  }
                });
                
                console.log('Form values:', formValues);
                
                // Create the disclosure data
                const disclosureData = {
                  user_id: user.id,
                  ...formValues,
                  last_updated: new Date().toISOString()
                };
                
                console.log('Submitting data:', disclosureData);
                
                // Use Supabase directly
                const { data: existingData } = await supabase
                  .from('lksg_disclosures')
                  .select('id')
                  .eq('user_id', user.id)
                  .single();

                let error;
                if (existingData) {
                  // Update existing record
                  const { error: updateError } = await supabase
                    .from('lksg_disclosures')
                    .update(disclosureData)
                    .eq('id', existingData.id);
                  error = updateError;
                } else {
                  // Insert new record
                  const { error: insertError } = await supabase
                    .from('lksg_disclosures')
                    .insert(disclosureData);
                  error = insertError;
                }
                
                if (error) {
                  console.error('Database error:', error);
                  setErrorMessage(`Error saving disclosure: ${error.message}`);
                  setSubmitStatus('error');
                  return;
                }
                
                console.log('Disclosure saved successfully');
                setSubmitStatus('success');
                setDisclosure(disclosureData as LKSGDisclosure);
                setOriginalDisclosure(disclosureData as LKSGDisclosure);
              } catch (error) {
                console.error('Submission error:', error);
                setSubmitStatus('error');
                setErrorMessage('Network error. Please check your connection and try again.');
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {sections.map((section) => (
              <div key={section.section} className="border-b border-gray-200 pb-6 last:border-b-0">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{section.section}</h2>
                <div className="space-y-4">
                  {section.fields.map((field) => (
                    <div key={field.id} className="flex items-center gap-3">
                      <div className="flex-grow pr-2">
                        <label className="text-sm font-medium text-gray-700">
                          {field.label}
                        </label>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <input
                          type="radio"
                          name={field.id}
                          value="true"
                          id={`${field.id}-yes`}
                          checked={disclosure?.[field.id as keyof LKSGDisclosure] === true}
                          onChange={() => {
                            if (disclosure) {
                              setDisclosure({
                                ...disclosure,
                                [field.id]: true
                              } as LKSGDisclosure);
                            }
                          }}
                          className="hidden peer/yes"
                        />
                        <label
                          htmlFor={`${field.id}-yes`}
                          className={`px-3 py-1 text-sm font-medium border rounded-l cursor-pointer bg-white border-gray-200 
                            ${field.yes_is_positive ? 'hover:text-green-600' : 'hover:text-red-600'} 
                            ${disclosure?.[field.id as keyof LKSGDisclosure] === true ? 
                              (field.yes_is_positive ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600') : 
                              ''} 
                            transition-colors duration-200`}
                        >
                          Yes
                        </label>
                        <input
                          type="radio"
                          name={field.id}
                          value="false"
                          id={`${field.id}-no`}
                          checked={disclosure?.[field.id as keyof LKSGDisclosure] === false}
                          onChange={() => {
                            if (disclosure) {
                              setDisclosure({
                                ...disclosure,
                                [field.id]: false
                              } as LKSGDisclosure);
                            }
                          }}
                          className="hidden peer/no"
                        />
                        <label
                          htmlFor={`${field.id}-no`}
                          className={`px-3 py-1 text-sm font-medium border rounded-r cursor-pointer bg-white border-gray-200 
                            ${field.yes_is_positive ? 'hover:text-red-600' : 'hover:text-green-600'} 
                            ${disclosure?.[field.id as keyof LKSGDisclosure] === false ? 
                              (field.yes_is_positive ? 'border-red-500 text-red-600' : 'border-green-500 text-green-600') : 
                              ''} 
                            transition-colors duration-200`}
                        >
                          No
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="mt-6">
              {submitStatus === 'success' && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
                  Disclosures saved successfully!
                </div>
              )}
              
              {(submitStatus === 'error' || errorMessage) && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                  {errorMessage || 'Error saving disclosures. Please try again.'}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting || !hasChanges}
                className={`w-full rounded-md ${
                  isSubmitting || !hasChanges
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500'
                } px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
              >
                {isSubmitting ? 'Saving...' : hasChanges ? 'Save Disclosures' : 'No Changes to Save'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}