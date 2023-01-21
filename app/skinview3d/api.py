from urllib.parse import urlencode

from pyppeteer.launcher import connect

from ..settings import (backendSkinView3D, browserWSEndpoint,
                        elementScreenshotOptions)
from .models import BackendInfo, Both


async def getViewRaw(skinUrl: str | None, capeUrl: str | None, nameTag: str | None):
    browser = await connect(browserWSEndpoint=browserWSEndpoint)
    page = await browser.newPage()
    await page.setViewport(
        {"width": 1080, "height": 1920, "isMobile": True, "deviceScaleFactor": 3.0}
    )

    params = urlencode(
        {
            "skinUrl": skinUrl,
            "capeUrl": capeUrl,
            "nameTag": nameTag,
        }
    )
    url = f"{backendSkinView3D}?{params}"
    await page.goto(url)

    skin_container = await page.querySelector("#skin_container")

    view_front = await skin_container.screenshot(elementScreenshotOptions)

    await page.evaluate("showBack()")

    view_back = await skin_container.screenshot(elementScreenshotOptions)

    backend_info = await page.evaluate(
        """() => {
        return {
            slim: skinViewer.playerObject.skin.slim,
            serverTimeJs: Date(),
        }
    }"""
    )

    await page.close()
    await browser.disconnect()

    return Both(
        front=view_front,
        back=view_back,
        backendInfo=BackendInfo.parse_obj(backend_info),
    )
