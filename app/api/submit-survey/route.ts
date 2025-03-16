import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/database.types'

export async function POST(request: Request) {
  try {
    // Create a Supabase client configured for route handlers
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Parse JSON data
    const disclosureData = await request.json()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ 
        error: 'Authentication failed',
        details: authError.message
      }, { status: 401 })
    }

    if (!user) {
      console.error('No user found')
      return NextResponse.json({ 
        error: 'User not found',
        details: 'Please log in again'
      }, { status: 401 })
    }

    // Check if table exists first
    const { error: tableError } = await supabase
      .from('lksg_disclosures')
      .select('id')
      .limit(1)

    if (tableError && tableError.message.includes('relation "lksg_disclosures" does not exist')) {
      return NextResponse.json({
        error: 'Database setup required',
        details: 'The lksg_disclosures table does not exist. Please run the database migrations.'
      }, { status: 500 })
    }

    // First try to find existing record
    const { data: existingRecords, error: fetchError } = await supabase
      .from('lksg_disclosures')
      .select('id')
      .eq('user_id', user.id as string)

    if (fetchError) {
      console.error('Error fetching existing record:', fetchError)
      return NextResponse.json({
        error: 'Failed to check existing records',
        details: fetchError.message
      }, { status: 500 })
    }

    // Prepare data
    const data = {
      ...disclosureData,
      user_id: user.id,
      last_updated: new Date().toISOString()
    }

    console.log('Attempting to save disclosure data:', {
      user_id: user.id,
      table: 'lksg_disclosures',
      operation: existingRecords && existingRecords.length > 0 ? 'update' : 'insert'
    })

    let error
    if (existingRecords && existingRecords.length > 0) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('lksg_disclosures')
        .update(data)
        .eq('id', existingRecords[0].id)
      error = updateError
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('lksg_disclosures')
        .insert(data)
      error = insertError
    }

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({
        error: 'Failed to save disclosure',
        details: error.message
      }, { status: 500 })
    }

    console.log('Successfully saved disclosure data')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error submitting disclosures:', error)
    return NextResponse.json({
      error: 'Failed to submit disclosures',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}
