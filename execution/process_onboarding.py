import json
import os
import sys
from datetime import datetime

def process_onboarding_data(data):
    """
    Takes the JSON output from the onboarding chat and processes it.
    For now, it saves a 'Discovery Dossier' for the agent to review.
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    company_slug = data.get('company_name', 'unknown').lower().replace(' ', '_')
    filename = f"dossier_{company_slug}_{timestamp}.json"
    
    output_path = os.path.join('/home/koli/Koliguides/.tmp', filename)
    
    # Ensure .tmp exists
    os.makedirs('/home/koli/Koliguides/.tmp', exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=4)
    
    print(f"ONBOARDING_SUCCESS: Dossier created at {output_path}")
    return output_path

if __name__ == "__main__":
    # In practice, the orchestrator passes the JSON as a command line argument or via stdin
    try:
        if len(sys.argv) > 1:
            raw_data = sys.argv[1]
            data = json.loads(raw_data)
            process_onboarding_data(data)
        else:
            print("ERROR: No data provided to the execution script.")
    except Exception as e:
        print(f"ERROR: Failed to process onboarding data: {str(e)}")
