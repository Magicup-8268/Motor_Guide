# Manual PDF access-denied investigation

## Symptom

Clicking the original-manual PDF button opened an Alibaba OSS XML error:

`Code=AccessDenied`, `Message=You are denied by bucket referer policy`, `EC=0003-00000501`.

## Root cause

The initial diagnosis was incomplete. Removing `noreferrer` alone does not work because Kinco's product site first obtains a short-lived Alibaba OSS token, generates a signed PDF URL, then requests it with the corresponding Kinco product-page Referer.

The direct static PDF URL used by the local app had neither a valid signed URL nor the allowed official-page Referer, so the OSS bucket returned `0003-00000501`.

## Fix

- Added a Vite local-development endpoint at `/api/manual-pdf?series=...`.
- The endpoint obtains Kinco's short-lived token server-side, signs the requested object, and sends the official product-page Referer while fetching the PDF.
- The browser opens only the same-origin local endpoint and receives `application/pdf`; temporary credentials never reach the browser.
- Added regression tests asserting the proxy route, official Referer forwarding, and the absence of direct static-PDF popup links.

## Evidence

- A fresh local request for `MD` returned `200`, `Content-Type: application/pdf`, and the `%PDF-` file signature (4,933,895 bytes).
- A fresh local request for `iSMK` returned `200`, `Content-Type: application/pdf`, and the `%PDF-` file signature (7,673,191 bytes).
- `npm run test:links`: 3 tests passed.
- `npm run build`: passed.
- `npm audit --omit=dev`: 0 vulnerabilities.

## Status

DONE: The local proxy was restarted and fresh PDF bytes were retrieved through the exact URL that the manual button now opens. The in-app browser did not attach for a visual click test, but the button route, proxy response headers, and PDF file signature have all been verified.
