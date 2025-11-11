# Vapi Call Dashboard

A Next.js web application for making AI-powered voice calls using Vapi + Vobiz integration. This dashboard allows you to make single or bulk calls recursively with configurable delays.

## Features

✅ **Single Call** - Make one call at a time
✅ **Bulk Calls** - Enter multiple numbers (one per line) and make calls recursively
✅ **Assistant Selection** - Choose from available Vapi AI assistants
✅ **Configurable Delay** - Set delay between calls (1-5 seconds)
✅ **Real-time Results** - See success/failure for each call
✅ **Call Statistics** - View total, successful, and failed calls
✅ **Copy Call IDs** - Click to copy Call ID for tracking

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vapi API** - AI voice calling
- **Vobiz SIP** - Phone infrastructure

## Prerequisites

- Node.js 18+ or Bun
- Vapi account with API key
- Vobiz SIP trunk configured
- Phone number registered in Vapi

## Setup

### 1. Install Dependencies

```bash
npm install
# or
bun install
```

### 2. Configure Environment

The `.env.local` file is already configured with your credentials:

```env
VAPI_PRIVATE_KEY=90de59da-fccc-47c1-91ff-f7fc8ce5b016
VAPI_PHONE_NUMBER_ID=6627f74b-5892-4a05-bde7-49e79b9f464f
VAPI_DEFAULT_ASSISTANT_ID=9fb6d4c5-9403-49ea-afeb-9b493d63b474
VAPI_FROM_PHONE=08071387149
```

**Important:** Never commit `.env.local` to git!

### 3. Run Development Server

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Making a Single Call

1. Select an AI assistant from the dropdown
2. Enter a phone number in the "Single Phone Number" field
   - Format: `+919148227303` or `09148227303`
3. Click "Make Call(s)"

### Making Bulk Calls

1. Select an AI assistant from the dropdown
2. Enter multiple phone numbers in the "Multiple Phone Numbers" textarea
   - **One number per line**
   - Example:
     ```
     +919148227303
     +919876543210
     +918071387149
     ```
3. Adjust the delay slider (1-5 seconds between calls)
4. Click "Make Call(s)"

**The calls will be made recursively** - one after another with the configured delay.

### Understanding Results

After making calls, you'll see:

- ✅ **Green checkmark** - Call successfully initiated
- ❌ **Red X** - Call failed
- **Call ID** - Unique identifier for tracking
- **Status** - Current call status (queued, ringing, etc.)
- **Error message** - If the call failed

## How It Works

### Call Flow

```
Frontend → /api/make-calls → Vapi API → Vobiz SIP → Phone Network → Destination
```

### Recursive Calling Logic

The backend (`/api/make-calls/route.ts`) processes calls sequentially:

```typescript
for (const phoneNumber of phoneNumbers) {
  // 1. Make call to Vapi API
  const result = await makeSingleCall(assistantId, phoneNumber, phoneNumberId);

  // 2. Store result
  results.push(result);

  // 3. Wait before next call (configurable delay)
  await sleep(delay);
}
```

This ensures:
- Calls are made one by one (not in parallel)
- Configurable delay prevents rate limiting
- Each call result is tracked individually

## API Routes

### `GET /api/assistants`

Fetches all available Vapi assistants.

**Response:**
```json
{
  "success": true,
  "assistants": [
    {
      "id": "9fb6d4c5-9403-49ea-afeb-9b493d63b474",
      "name": "New Assistant",
      "model": { "model": "gpt-4.1-nano" },
      "voice": { "voiceId": "8N2ng9i2uiUWqstgmWlH" }
    }
  ],
  "count": 2
}
```

### `POST /api/make-calls`

Makes calls to multiple phone numbers recursively.

**Request:**
```json
{
  "assistantId": "9fb6d4c5-9403-49ea-afeb-9b493d63b474",
  "phoneNumbers": ["+919148227303", "+919876543210"],
  "delay": 2000
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "number": "+919148227303",
      "callId": "019a70e9-7686-7aae-a75a-16791d94cada",
      "status": "queued",
      "timestamp": "2025-11-11T03:15:39.782Z"
    }
  ],
  "totalCalls": 2,
  "successfulCalls": 2,
  "failedCalls": 0
}
```

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx                    # Main dashboard UI
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   └── api/
│       ├── assistants/route.ts     # List assistants endpoint
│       └── make-calls/route.ts     # Make calls endpoint (recursive)
├── components/
│   ├── CallForm.tsx                # Form for making calls
│   └── CallResults.tsx             # Display call results
├── types/
│   └── index.ts                    # TypeScript type definitions
├── .env.local                      # Environment variables (DO NOT COMMIT)
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── tailwind.config.ts              # Tailwind config
└── README.md                       # This file
```

## Configuration

### Changing Delay Range

Edit the delay slider in `components/CallForm.tsx`:

```typescript
<input
  type="range"
  min="1000"    // Minimum delay (1 second)
  max="5000"    // Maximum delay (5 seconds)
  step="500"    // Increment (0.5 seconds)
/>
```

### Changing Default Assistant

Update `.env.local`:

```env
VAPI_DEFAULT_ASSISTANT_ID=your-assistant-id-here
```

## Troubleshooting

### "Unauthorized" Error

- Check that `VAPI_PRIVATE_KEY` in `.env.local` is correct
- Verify the key hasn't expired in Vapi dashboard

### Calls Not Connecting

- Verify phone numbers are in correct format (+919148227303 or 09148227303)
- Check Vobiz account has sufficient balance
- Ensure `VAPI_PHONE_NUMBER_ID` is correct

### No Assistants Showing

- Check Vapi API key is valid
- Ensure you have created assistants in Vapi dashboard
- Check browser console for errors

## Development

### Build for Production

```bash
npm run build
npm start
```

### Type Checking

```bash
npx tsc --noEmit
```

## Deployment

This app is ready to deploy to:

- **Vercel** (recommended) - One-click deploy
- **Railway**
- **AWS/Azure/GCP**

Make sure to set environment variables in your deployment platform.

## Support

For issues related to:
- **Vapi API**: [Vapi Documentation](https://docs.vapi.ai)
- **Vobiz SIP**: support@vobiz.ai
- **This Application**: Check console logs and API responses

## License

MIT

---

**Built with ❤️ using Next.js + TypeScript**
