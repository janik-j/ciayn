'use client';

import { Header } from "@/components/header"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        
        // Refresh the schema cache before fetching data
        try {
          await supabase.rpc('refresh_schema_cache');
          console.log('Schema cache refreshed');
        } catch (cacheError) {
          console.log('Schema cache refresh not available, continuing anyway');
        }

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

  const questions = [
    { section: 'Child Labor', fields: [
      { id: 'child_labor_processes', label: 'Do you have processes to prevent child labor?' },
     { id: 'child_labor_violation', label: 'Have there been any child labor violations?' }
    ]},
    { section: 'Forced Labor', fields: [
      { id: 'forced_labor_processes', label: 'Do you have processes to prevent forced labor?' }
    ]},
    { section: 'Slavery', fields: [
      { id: 'slavery_violation', label: 'Have there been any slavery-related violations?' },
      { id: 'slavery_processes', label: 'Do you have processes to prevent slavery?' }
    ]},
    { section: 'Forced Eviction', fields: [
      { id: 'forced_eviction_violation', label: 'Have there been any forced eviction violations?' },
      { id: 'forced_eviction_processes', label: 'Do you have processes to prevent forced evictions?' }
    ]},
    { section: 'Security Forces', fields: [
      { id: 'security_forces_violation', label: 'Have there been any security forces-related violations?' },
      { id: 'security_forces_processes', label: 'Do you have processes regarding security forces?' }
    ]},
    { section: 'Workplace Safety', fields: [
      { id: 'workplace_safety_violation', label: 'Have there been any workplace safety violations?' },
      { id: 'workplace_safety_processes', label: 'Do you have workplace safety processes?' }
    ]},
    { section: 'Freedom of Association', fields: [
      { id: 'freedom_association_violation', label: 'Have there been any freedom of association violations?' },
      { id: 'freedom_association_processes', label: 'Do you have processes to protect freedom of association?' }
    ]},
    { section: 'Employment Discrimination', fields: [
      { id: 'employment_discrimination_violation', label: 'Have there been any discrimination violations?' },
      { id: 'employment_discrimination_processes', label: 'Do you have anti-discrimination processes?' }
    ]},
    { section: 'Fair Wages', fields: [
      { id: 'fair_wage_violation', label: 'Have there been any fair wage violations?' },
      { id: 'fair_wage_processes', label: 'Do you have fair wage processes?' }
    ]},
    { section: 'Mercury Usage', fields: [
      { id: 'mercury_violation', label: 'Have there been any mercury-related violations?' },
      { id: 'mercury_processes', label: 'Do you have processes regarding mercury handling?' }
    ]},
    { section: 'Organic Pollutants', fields: [
      { id: 'organic_pollutants_violation', label: 'Have there been any organic pollutant violations?' },
      { id: 'organic_pollutants_processes', label: 'Do you have processes for handling organic pollutants?' }
    ]},
    { section: 'Hazardous Waste', fields: [
      { id: 'hazardous_waste_violation', label: 'Have there been any hazardous waste violations?' },
      { id: 'hazardous_waste_processes', label: 'Do you have hazardous waste management processes?' }
    ]},
    { section: 'Environmental Damage', fields: [
      { id: 'environmental_damage_violation', label: 'Have there been any environmental damage violations?' },
      { id: 'environmental_damage_processes', label: 'Do you have environmental protection processes?' }
    ]}
  ];

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
                questions.forEach(section => {
                  section.fields.forEach(field => {
                    // Get the selected value for this field
                    const yesInput = document.getElementById(`${field.id}-yes`) as HTMLInputElement | null;
                    const noInput = document.getElementById(`${field.id}-no`) as HTMLInputElement | null;
                    
                    // Check which one is checked
                    if (yesInput && yesInput.checked) {
                      formValues[field.id] = true;
                    } else if (noInput && noInput.checked) {
                      formValues[field.id] = false;
                    } else {
                      // Default to false if neither is checked
                      formValues[field.id] = false;
                    }
                  });
                });
                
                console.log('Form values:', formValues);
                
                // Create the disclosure data
                const disclosureData = {
                  user_id: user.id,
                  child_labor_violation: formValues.child_labor_violation || false,
                  child_labor_processes: formValues.child_labor_processes || false,
                  forced_labor_processes: formValues.forced_labor_processes || false,
                  slavery_violation: formValues.slavery_violation || false,
                  slavery_processes: formValues.slavery_processes || false,
                  forced_eviction_violation: formValues.forced_eviction_violation || false,
                  forced_eviction_processes: formValues.forced_eviction_processes || false,
                  security_forces_violation: formValues.security_forces_violation || false,
                  security_forces_processes: formValues.security_forces_processes || false,
                  workplace_safety_violation: formValues.workplace_safety_violation || false,
                  workplace_safety_processes: formValues.workplace_safety_processes || false,
                  freedom_association_violation: formValues.freedom_association_violation || false,
                  freedom_association_processes: formValues.freedom_association_processes || false,
                  employment_discrimination_violation: formValues.employment_discrimination_violation || false,
                  employment_discrimination_processes: formValues.employment_discrimination_processes || false,
                  fair_wage_violation: formValues.fair_wage_violation || false,
                  fair_wage_processes: formValues.fair_wage_processes || false,
                  mercury_violation: formValues.mercury_violation || false,
                  mercury_processes: formValues.mercury_processes || false,
                  organic_pollutants_violation: formValues.organic_pollutants_violation || false,
                  organic_pollutants_processes: formValues.organic_pollutants_processes || false,
                  hazardous_waste_violation: formValues.hazardous_waste_violation || false,
                  hazardous_waste_processes: formValues.hazardous_waste_processes || false,
                  environmental_damage_violation: formValues.environmental_damage_violation || false,
                  environmental_damage_processes: formValues.environmental_damage_processes || false,
                  last_updated: new Date().toISOString()
                };
                
                console.log('Submitting data:', disclosureData);
                
                // Try to use the API route first (which has better error handling)
                try {
                  const response = await fetch('/api/submit-survey', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(disclosureData),
                  });
                  
                  if (response.ok) {
                    const result = await response.json();
                    console.log('Submission result:', result);
                    setSubmitStatus('success');
                    setDisclosure(disclosureData as LKSGDisclosure);
                    return;
                  }
                  
                  console.log('API route failed, falling back to direct Supabase access');
                } catch (apiError) {
                  console.error('API route error:', apiError);
                  console.log('Falling back to direct Supabase access');
                }
                
                // Use client-side Supabase directly as fallback
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
              } catch (error) {
                console.error('Submission error:', error);
                setSubmitStatus('error');
                setErrorMessage('Network error. Please check your connection and try again.');
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {questions.map((section) => (
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
                          defaultChecked={disclosure?.[field.id as keyof LKSGDisclosure] === true}
                          className="hidden peer/yes"
                        />
                        <label
                          htmlFor={`${field.id}-yes`}
                          className="px-3 py-1 text-sm font-medium border rounded-l cursor-pointer bg-white border-gray-200 hover:text-red-600 peer-checked/yes:border-red-500 peer-checked/yes:text-red-600 transition-colors duration-200"
                        >
                          Yes
                        </label>
                        <input
                          type="radio"
                          name={field.id}
                          value="false"
                          id={`${field.id}-no`}
                          defaultChecked={disclosure?.[field.id as keyof LKSGDisclosure] === false}
                          className="hidden peer/no"
                        />
                        <label
                          htmlFor={`${field.id}-no`}
                          className="px-3 py-1 text-sm font-medium border rounded-r cursor-pointer bg-white border-gray-200 hover:text-green-600 peer-checked/no:border-green-500 peer-checked/no:text-green-600 transition-colors duration-200"
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
                disabled={isSubmitting}
                className={`w-full rounded-md ${
                  isSubmitting 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500'
                } px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
              >
                {isSubmitting ? 'Saving...' : 'Save Disclosures'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}