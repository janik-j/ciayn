import { NextResponse } from 'next/server'

// This is a debug endpoint that can be used to inspect the current analysis result
// Useful for diagnosing issues with the environmental analysis section

export async function GET() {
  try {
    return NextResponse.json({
      message: "Debug endpoint active. Use POST to send test data.",
      status: "ok"
    })
  } catch (error) {
    return NextResponse.json({ error: "Error in debug endpoint" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Log the received data for debugging
    console.log("Debug endpoint received data:", JSON.stringify(data, null, 2))
    
    // Check specifically for environmental risks
    if (data.esgRisks && data.esgRisks.environmental) {
      console.log("Environmental risks found:", data.esgRisks.environmental.length)
      
      // Check if the array exists but is empty
      if (data.esgRisks.environmental.length === 0) {
        console.log("Environmental risks array is empty")
      }
    } else {
      console.log("No environmental risks section found in the data")
    }
    
    // Return the data back for inspection
    return NextResponse.json({
      message: "Data received and logged",
      dataReceived: data,
      environmentalRisksCount: data.esgRisks?.environmental?.length || 0
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json({ 
      error: "Error processing debug data",
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
} 