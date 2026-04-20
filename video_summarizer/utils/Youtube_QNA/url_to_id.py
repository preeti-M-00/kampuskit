import re

def get_videoID(url: str) -> str:
    patterns = [
        r'(?:v=|\/)([0-9A-Za-z_-]{11})(?:[&?\/]|$)',
        r'(?:youtu\.be\/)([0-9A-Za-z_-]{11})',
        r'(?:embed\/)([0-9A-Za-z_-]{11})',
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, url)
        if matches:
            return matches[0]
    
    return None