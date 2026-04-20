from serpapi import GoogleSearch

def get_transcript(video_id: str):
    try:
        params = {
            "api_key": 'c4a6b331bf5030e299e0e5eb921f491c7cecd7047f02ee53dd2137bd105c6628',
            'engine': 'youtube_video_transcript',
            'v': video_id
        }

        search = GoogleSearch(params)
        result = search.get_dict()

        return ' '.join(s.get('snippet', '') for s in result['transcript'])
    
    except Exception as e:
        print(f"Error has occured. ", e)
        return ''