import { supabase } from '../lib/supabase/client'

async function insertLksgDisclosure() {
  const { data, error } = await supabase
    .from('lksg_disclosures')
    .insert({
      user_id: '3d67e898-2421-4cc1-8412-c88eed525014',
      child_labor_violation: true,
      child_labor_processes: true,
      forced_labor_violation: true,
      forced_labor_processes: true,
      slavery_violation: true,
      slavery_processes: true,
      forced_eviction_violation: true,
      forced_eviction_processes: true,
      security_forces_violation: true,
      security_forces_processes: true,
      workplace_safety_violation: true,
      workplace_safety_processes: true,
      freedom_association_violation: true,
      freedom_association_processes: true,
      employment_discrimination_violation: true,
      employment_discrimination_processes: true,
      fair_wage_violation: true,
      fair_wage_processes: true,
      mercury_violation: true,
      mercury_processes: true
    })
    .select()

  if (error) {
    console.error('Error inserting LKSG disclosure:', error)
    return
  }

  console.log('Successfully inserted LKSG disclosure:', data)
}

insertLksgDisclosure() 