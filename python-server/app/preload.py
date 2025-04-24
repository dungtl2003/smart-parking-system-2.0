import pathlib
import os
import sys


class Settings:
    def __init__(self):
        video_publish_url = os.getenv("VIDEO_PUBLISH_URL")
        api_route = os.getenv("API_ROUTE")
        version = os.getenv("VERSION")

        assert video_publish_url is not None, "VIDEO_PUBLISH_URL is required"
        assert api_route is not None, "API_ROUTE is required"
        assert version is not None, "VERSION is required"

        self.video_publish_url = video_publish_url
        self.title = os.getenv("TITLE") or "API"
        self.version = version
        self.api_route = api_route
        self.description = os.getenv("DESCRIPTION") or "API description"
        self.debug = bool(os.getenv("DEBUG")) or False


# remember to update the path when adding new modules
def resolve_path():
    curr_directory = str(pathlib.Path(__file__).parent.resolve())

    modules = [
        str(curr_directory),
        os.path.join(curr_directory, "processes"),
    ]

    [sys.path.append(module) if module not in sys.path else None for module in modules]


print("Resolving path")
resolve_path()

print("Loading settings")
settings = Settings()
