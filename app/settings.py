from pydantic import BaseSettings


class Settings(BaseSettings):
    browserWSEndpoint: str
    backendSkinView3D: str

settings = Settings()