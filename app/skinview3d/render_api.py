from urllib.parse import urlencode

from playwright.async_api import async_playwright

from ..settings import settings
from .models import BackendInfo, CommonResponse


async def getViewRaw(
    shot_front: bool,
    shot_back: bool,
    skinUrl: str | None,
    capeUrl: str | None,
    nameTag: str | None,
    device_scale: float,
    omit_background: bool,
):
    params = urlencode(
        {
            "skinUrl": skinUrl,
            "capeUrl": capeUrl,
            "nameTag": nameTag,
        }
    )
    url = f"{settings.backendSkinView3D}?{params}"

    async with async_playwright() as p:
        browser = await p.chromium.connect_over_cdp(settings.browserWSEndpoint)
        context = await browser.new_context(
            viewport={"width": 1080, "height": 1920},
            device_scale_factor=device_scale,
        )
        page = await context.new_page()
        await page.goto(url)

        skin_container = page.locator("#skin_container")

        if shot_front:
            view_front = await skin_container.screenshot(
            type="png", omit_background=omit_background
        )

        await page.evaluate("showBack()")

        if shot_back:
            view_back = await skin_container.screenshot(
            type="png", omit_background=omit_background
        )

        backend_info = await page.evaluate(
            """() => {
            return {
                slim: skinViewer.playerObject.skin.slim,
                serverTimeJs: Date(),
            }
        }"""
        )

        await context.close()

    return CommonResponse(
        front=view_front if shot_front else None,
        back=view_back if shot_back else None,
        backendInfo=BackendInfo.parse_obj(backend_info),
    )
