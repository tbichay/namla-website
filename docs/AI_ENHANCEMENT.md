# AI Image Enhancement Documentation

## Overview

The NAMLA website now includes real AI image enhancement functionality using multiple providers for high-quality real estate image processing.

## Supported Providers

### 1. OpenAI DALL-E 3
- **Best for**: Professional image editing and complex enhancements
- **Features**: Sky replacement, lighting correction, noise reduction
- **Cost**: ~$0.02 per image
- **Setup**: Add `OPENAI_API_KEY` to environment variables

### 2. Replicate
- **Best for**: Upscaling and general enhancement
- **Features**: 4x upscaling, noise reduction, detail enhancement
- **Cost**: ~$0.005 per image
- **Setup**: Add `REPLICATE_API_TOKEN` to environment variables

### 3. AutoEnhance (Placeholder)
- **Status**: API integration ready, requires valid API key
- **Setup**: Add `AUTOENHANCE_API_KEY` to environment variables

### 4. Deep Image (Placeholder)  
- **Status**: API integration ready, requires valid API key
- **Setup**: Add `DEEP_IMAGE_API_KEY` to environment variables

## Available Presets

### OpenAI-based Presets
- **AI Professional**: Complete enhancement with sky replacement and lighting
- **AI Quick Enhance**: Fast lighting and noise reduction
- **Real Estate Standard**: Basic real estate enhancements
- **Real Estate Premium**: Full real estate processing with HDR
- **High Resolution**: Upscaling and detail enhancement
- **Quick Fix**: Basic lighting and quality improvements

### Replicate-based Presets
- **Replicate Upscale**: 4x image upscaling with Real-ESRGAN
- **Replicate Enhance**: General image enhancement with GFPGAN

## How It Works

1. **Image Download**: Original image is downloaded from URL
2. **Pre-processing**: Image is converted to PNG and resized if needed (OpenAI requirement)
3. **AI Processing**: Image is sent to the selected AI provider
4. **Post-processing**: Enhanced image is downloaded from provider
5. **Storage**: Enhanced image is uploaded to R2 storage
6. **URL Return**: Internal media URL is returned to the application

## Technical Implementation

### Key Functions

- `enhanceImage()`: Main enhancement function
- `enhanceWithOpenAI()`: OpenAI DALL-E 3 integration
- `enhanceWithReplicate()`: Replicate models integration
- `downloadImage()`: Downloads images for processing
- `prepareImageForOpenAI()`: Converts and resizes images for OpenAI
- `uploadTempImage()`: Uploads processed images to storage

### Error Handling

- API key validation
- Image format conversion
- File size limits (4MB for OpenAI)
- Network timeouts
- Storage upload failures

## Setup Instructions

### 1. OpenAI Setup
```bash
# Get API key from https://platform.openai.com/api-keys
OPENAI_API_KEY="sk-proj-..."
```

### 2. Replicate Setup
```bash
# Get API token from https://replicate.com/account/api-tokens
REPLICATE_API_TOKEN="r8_..."
```

### 3. Environment Variables
Add to your `.env.local` file:
```env
OPENAI_API_KEY="your-openai-api-key"
REPLICATE_API_TOKEN="your-replicate-token"
AUTOENHANCE_API_KEY="your-autoenhance-api-key"
DEEP_IMAGE_API_KEY="your-deep-image-api-key"
```

## Usage in Admin Interface

1. Navigate to project edit page
2. Hover over any image in the media gallery
3. Click the purple "Enhance with AI" button (Sparkles icon)
4. Select enhancement preset from the modal
5. Click "Generate Enhancement"
6. Review before/after comparison
7. Click "Apply Enhancement" to save the enhanced image

## Cost Estimation

The system provides real-time cost estimates based on:
- Provider pricing
- Selected operations
- Image count
- Quality settings

## Dependencies

- `openai`: OpenAI API client
- `replicate`: Replicate API client  
- `sharp`: Image processing library
- Custom R2 storage integration

## File Structure

```
src/lib/services/ai-enhancement.ts     # Main AI enhancement service
src/components/admin/AIEnhanceModal.tsx # Frontend modal component
src/app/api/admin/projects/[id]/media/[mediaId]/enhance/route.ts # API endpoint
```

## Limitations

- OpenAI requires PNG format and 4MB max file size
- Replicate processing times vary by model (5-60 seconds)
- Network timeouts on large images
- API rate limits apply

## Future Enhancements

- Batch processing support
- More provider integrations
- Custom model training
- Real-time preview
- Cost optimization