# Model menu and original PDF fix

## User-visible changes

- Removed the duplicated upper-right capacity field from every model-menu card.
- Enlarged the voltage and exact rated-capacity line beneath the model name.
- Added a `통신` line that lists the model's recorded supported protocols, such as `CANopen · Modbus RTU · EtherCAT`.
- Changed the original-manual action to open the local signed PDF proxy rather than Kinco's protected direct object URL.

## Verification

- `npm run test:links`: passed (3 tests).
- `npm run build`: passed.
- `GET /api/manual-pdf?series=MD`: 200, `application/pdf`, `%PDF-`.
- `GET /api/manual-pdf?series=iSMK`: 200, `application/pdf`, `%PDF-`.

## Scope note

The PDF proxy is intentionally supplied by the Vite development server for local-PC use. A separately deployed production site will require the same server endpoint on its hosting platform; do not publish the Kinco temporary credentials to the browser.
