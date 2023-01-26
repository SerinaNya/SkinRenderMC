from pydantic import BaseModel, root_validator, confloat
import base64


class BackendInfo(BaseModel):
    slim: bool
    serverTimeJs: str


class Both(BaseModel):
    front: bytes | None
    back: bytes | None
    both: bytes | None = None
    backendInfo: BackendInfo


class All_Response_Json(BaseModel):
    front_b64: str
    back_b64: str
    both_b64: str
    backendInfo: BackendInfo
    
    @root_validator(pre=True)
    def convertToBase64(cls, values):
        for i in ("front", "back", "both"):
            values[f"{i}_b64"] = base64.b64encode(values[i]) if values[i] else ''
        return values


class CommonQuery(BaseModel):
    skinUrl: str | None = None
    capeUrl: str | None = None
    nameTag: str | None = None
    definition: confloat(ge=0.8, le=3.5) = 1.5
    transparent: bool = False