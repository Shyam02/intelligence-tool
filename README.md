# AI Marketing Intelligence Tool

A testing tool for generating foundational marketing intelligence and search queries for content marketing strategy.

## Setup Instructions

### Prerequisites
- Node.js (version 14 or higher)
- Claude API key from Anthropic

### Installation Steps

1. **Create the project folder and navigate to it:**
   ```bash
   mkdir intelligence-tool
   cd intelligence-tool
   ```

2. **Create all the files** as provided in the setup (package.json, server.js, .env, and public folder files)

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Set up environment variables:**
   - Open the `.env` file
   - Replace `YOUR_CLAUDE_API_KEY_HERE` with your actual Claude API key
   ```
   CLAUDE_API_KEY=sk-ant-api03-your-actual-key-here
   PORT=3000
   ```

5. **Start the application:**
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   - Go to `http://localhost:3000`
   - You should see the AI Marketing Intelligence Tool interface

## How to Use

1. **Fill out the onboarding form** with your business information
2. **Submit the form** to generate foundational intelligence
3. **Copy the results** using the copy buttons for your records
4. **Generate search queries** based on the intelligence
5. **Test individual queries** using the search test feature
6. **Copy all outputs** to your Google Sheets or Notion for analysis

## Features

- ✅ Dynamic form that adapts based on business stage and website presence
- ✅ AI-powered foundational intelligence generation
- ✅ Automatic search query generation for competitors, keywords, and content
- ✅ Copy buttons for all outputs
- ✅ Live search testing with Claude's web search
- ✅ Responsive design for desktop and mobile

## File Structure

```
intelligence-tool/
├── package.json          # Project dependencies
├── server.js            # Backend server and API routes
├── .env                 # Environment variables (add your Claude API key here)
├── public/
│   ├── index.html       # Main interface
│   ├── style.css        # Styling
│   └── script.js        # Frontend JavaScript
└── README.md           # This file
```

## Troubleshooting

### Common Issues:

1. **"Module not found" errors:**
   - Make sure you ran `npm install` in the project directory

2. **"API key not found" errors:**
   - Check that your `.env` file has the correct Claude API key
   - Make sure the key starts with `sk-ant-api03-`

3. **"Port already in use" errors:**
   - Change the PORT in `.env` to a different number (e.g., 3001)
   - Or stop any other applications using port 3000

4. **Application not loading:**
   - Check the console for error messages
   - Make sure all files are in the correct locations
   - Restart the server with `npm start`

## Next Steps for Testing

1. Test with different types of businesses (B2B, B2C, SaaS, ecommerce)
2. Try various business stages (pre-launch, launched, growth)
3. Test with and without websites
4. Validate the quality of generated search queries
5. Execute the search queries to see actual results
6. Iterate on the prompts and logic based on results

## Development Notes

- The tool uses Claude Sonnet 3.5 for intelligence generation
- Web search is powered by Claude's built-in web_search tool
- All data is processed in memory (no database)
- Copy buttons allow easy export to external tools
- Form dynamically adapts based on user inputs