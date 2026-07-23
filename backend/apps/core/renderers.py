from rest_framework.renderers import JSONRenderer


class MantraJSONRenderer(JSONRenderer):
    """
    Standardizes API output responses.
    Successful responses:
    {
        "success": true,
        "message": "Success",
        "data": { ... }
    }
    """
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get('response') if renderer_context else None
        
        # If response is already structured with success field, return as is
        if isinstance(data, dict) and 'success' in data:
            return super().render(data, accepted_media_type, renderer_context)

        status_code = response.status_code if response else 200
        success = status_code < 400

        if success:
            formatted_data = {
                "success": True,
                "message": "Success",
                "data": data if data is not None else {}
            }
        else:
            # Handle fallback for errors that bypass the exception handler
            message = "Error"
            errors = data
            if isinstance(data, dict):
                message = data.get('detail', 'Error occurred')
                if 'detail' in errors:
                    # Rename or separate detail key if it's there
                    errors = errors.copy()
                    del errors['detail']
            
            formatted_data = {
                "success": False,
                "message": message,
                "errors": errors if errors is not None else {}
            }

        return super().render(formatted_data, accepted_media_type, renderer_context)
