from rest_framework.renderers import JSONRenderer
import json

class UserRenderer(JSONRenderer):
    charset = 'utf-8'

    def render(self, data, accepted_media_type=None, renderer_context=None):
        """
        Custom JSON renderer that safely handles datetime, Decimal, and other
        non-serializable types by converting them to strings automatically.
        """
        try:
            return json.dumps(data, default=str)  # safely convert datetimes
        except Exception:
            # fallback to DRF’s JSONRenderer if any unexpected issue occurs
            return super().render(data, accepted_media_type, renderer_context)