"""
Utility functions for the backend application.
"""

def format_response(status, message=None, data=None):
    """
    Format API response in a consistent structure.
    
    Args:
        status (str): Response status ('success' or 'error')
        message (str): Optional message
        data (dict): Optional response data
        
    Returns:
        dict: Formatted response
    """
    response = {'status': status}
    if message:
        response['message'] = message
    if data:
        response['data'] = data
    return response
