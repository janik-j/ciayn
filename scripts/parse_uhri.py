import json
import os
from pathlib import Path
from pprint import pprint
import dotenv
from supabase import create_client, Client

dotenv.load_dotenv(".env.local")

"""
<class 'list'> 250021

{'AffectedPersons': ['Disappeared persons',
                     'Children',
                     'Youth & juveniles',
                     'Women & girls'],
 'AnnotationId': 'a9ceae8c-fe1c-40f9-a326-1529e0ab678f',
 'AnnotationType': '- Concerns/Observations',
 'Body': '- CRC',
 'Countries': ['Peru'],
 'DocumentId': '41a0b08f-5a9a-4eb5-985f-05b47986ad82',
 'PublicationDate': '2025-02-12T00:00:00',
 'PublicationDateOnUhri': '2025-03-03T10:53:45.827',
 'Regions': ['Latin America and the Caribbean'],
 'Sdgs': ['16.2 - Protect children from abuse, exploitation, trafficking and '
          'violence',
          '5.2 - End all violence against and exploitation of women',
          '16.9 - Universal legal identity and birth registration'],
 'Symbol': 'CRC/C/PER/CO/6-7',
 'Text': '4.The Committee reminds the State party of the indivisibility and '
         'interdependence of all the rights enshrined in the Convention and '
         'emphasizes the importance of all the recommendations contained in '
         'the present concluding observations. The Committee would like to '
         'draw the State party's attention to the recommendations concerning '
         'the following areas, in respect of which urgent measures must be '
         'taken: birth registration and nationality (para. 18); abuse, '
         'neglect, sexual abuse and exploitation, and disappearances (paras. '
         '23 and 27); gender-based violence (para. 25); adolescent health '
         '(para. 35); and the administration of child justice (para. 45). ',
 'Themes': ['Violence against women',
            'Rights related to name, identity & nationality',
            'Administration of justice & fair trial',
            'Children: protection against exploitation',
            'Right to health',
            'Enforced disappearances',
            'Sexual & gender-based violence'],
 'UprCycle': None,
 'UprPositions': [],
 'UprRecommendingCountry': [],
 'UprRecommendingRegions': [],
 'UprSession': []}
"""

def get_uhri_data():
    path = Path("/Users/nico/tmp/export-full-en.json")
    with path.open("r") as f:
        data = json.load(f)
    return data

def unique_types(data):
    types = set()
    for item in data:
        types.add(item["AnnotationType"])
    return types

def concerns_observations(data):
    return [item for item in data if item["AnnotationType"] == "- Concerns/Observations"]

def init_supabase():
    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    
    if not supabase_url or not supabase_key:
        raise ValueError("Missing Supabase credentials in environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.")
    
    return create_client(supabase_url, supabase_key)

def insert_concerns_to_supabase(concerns, supabase_client):
    table = "uhri_incidents"
    total_count = 0
    errors = []
    batch_size = 100  # Adjust based on your data size and Supabase limits
    
    print(f"Preparing to insert {len(concerns)} concern observations to Supabase using batch requests...")
    
    # Process in batches
    for i in range(0, len(concerns), batch_size):
        batch = concerns[i:i+batch_size]
        batch_data = []
        
        # Prepare batch data
        for concern in batch:
            incident_data = {
                "affected_persons": concern.get("AffectedPersons", []),
                "countries": concern.get("Countries", []),
                "regions": concern.get("Regions", []),
                "themes": concern.get("Themes", []),
            }
            batch_data.append(incident_data)
        
        try:
            # Insert the batch in a single request
            result = supabase_client.table(table).insert(batch_data).execute()
            
            if result.data:
                count = len(result.data)
                total_count += count
                print(f"Inserted batch of {count} records. Total: {total_count}/{len(concerns)}")
            else:
                errors.append({"batch_start": i, "error": result.error})
                
        except Exception as e:
            errors.append({"batch_start": i, "batch_size": len(batch_data), "error": str(e)})
    
    print(f"Successfully inserted {total_count} records to Supabase")
    
    if errors:
        print(f"Encountered {len(errors)} errors during batch insertion")
        print("Errors:")
        for error in errors:
            print(error)


def main():
    # Get the UHRI data
    print("Loading UHRI data...")
    data = get_uhri_data()
    
    # Filter for concerns/observations
    print("Filtering for concern observations...")
    concerns = concerns_observations(data)
    print(f"Found {len(concerns)} concern observations")
    
    # Initialize Supabase client
    print("Initializing Supabase client...")
    supabase_client = init_supabase()
    
    # Insert the concerns into Supabase
    insert_concerns_to_supabase(concerns, supabase_client)

if __name__ == "__main__":
    main()


