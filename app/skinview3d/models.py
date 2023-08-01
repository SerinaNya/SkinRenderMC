from pydantic import model_validator, Field, BaseModel
import base64
from typing_extensions import Annotated


class BackendInfo(BaseModel):
    slim: bool
    serverTimeJs: str


class CommonResponse(BaseModel):
    front: bytes | None = None
    back: bytes | None = None
    both: bytes | None = None
    backendInfo: BackendInfo

    @property
    def auto_image(self):
        if self.both:
            return self.both
        elif self.front:
            return self.front
        elif self.back:
            return self.back


class All_Response_Json(BaseModel):
    front_b64: str
    back_b64: str
    both_b64: str
    backendInfo: BackendInfo
    
    @model_validator(mode="before")
    @classmethod
    def convertToBase64(cls, values):
        for i in ("front", "back", "both"):
            values[f"{i}_b64"] = base64.b64encode(values[i]) if values[i] else ''
        return values

class CommonOptions(BaseModel):
    definition: Annotated[float, Field(ge=0.8, le=3.5)] = 1.5
    transparent: bool = False    

class CommonQuery(CommonOptions):
    skinUrl: str | None = None
    capeUrl: str | None = None
    nameTag: str | None = None
