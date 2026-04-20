from serpapi import GoogleSearch
import os
from dotenv import load_dotenv

load_dotenv()

def get_transcript(video_id: str):
    try:
        params = {
            "api_key": os.getenv("SERPAPI_KEY"),
            'engine': 'youtube_video_transcript',
            'v': video_id
        }

        search = GoogleSearch(params)
        result = search.get_dict()

        return ' '.join(s.get('snippet', '') for s in result['transcript'])
    
    except Exception as e:
        print(f"Error has occured. ", e)
        return ''