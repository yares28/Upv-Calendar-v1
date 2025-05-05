# Content Security Policy (CSP) Configuration Guide

## Overview

This document explains how Content Security Policy is configured in our application and how to troubleshoot and update it.

## What is CSP?

Content Security Policy (CSP) is a security feature that helps prevent Cross-Site Scripting (XSS) and other code injection attacks by controlling which resources can be loaded and executed by the browser.

## Current Configuration

Our CSP is configured to allow:

1. Scripts: Only from our own domain, with 'unsafe-eval' to support Angular features
2. Styles: From our domain and Google Fonts
3. Fonts: From our domain, data URIs, and Google Fonts
4. Images: From our domain and data URIs
5. Connections: To our domain, backend API, and specific CDNs

## Files Where CSP is Configured

1. `docker-nginx.conf` - Main CSP configuration used in Docker containers
2. `nginx.conf` - Development configuration 
3. `angular.json` - Contains CSP for development server
4. `Dockerfile` - Contains script to ensure CSP is properly set at runtime

## Common CSP Issues

1. **Blocked resources**: External resources not listed in CSP directives will be blocked
2. **'eval' usage**: Angular requires 'unsafe-eval' to be allowed
3. **Inline styles**: Angular requires 'unsafe-inline' to be allowed for styles

## How to Update CSP

If new external resources need to be allowed:

1. Update `docker-nginx.conf` with the new domain
2. Update the CSP_CONFIG in the `Dockerfile` script
3. Update the development CSP in `angular.json`
4. For running containers, use the `update-container-config.ps1` script

## Quick Fix for Running Containers

To update a running container without rebuilding:

```powershell
# Update the container ID as needed
$CONTAINER_ID = "your-container-id"

# Run the update script
powershell -ExecutionPolicy Bypass -File update-container-config.ps1
```

## Best Practices

1. Only allow trusted domains in your CSP
2. Consider moving external resources to your own domain when possible
3. Regularly audit your CSP configuration
4. Test CSP changes before deploying to production

## Angular Development Server CSP

For the Angular development server (running on port 4200), CSP is applied in two ways:

1. Via the `angular.json` configuration (headers section)
2. Via a meta tag in `index.html`

To ensure Google Fonts and other external resources work correctly in development:

1. We've added a CSP meta tag in index.html
2. We've explicitly imported Google Fonts in styles.scss
3. We've provided a specific npm script for running the development server with the correct configuration:

```bash
npm run start:dev
```

### Restarting Development Server

After making CSP changes, restart your development server:

```bash
# Stop any running dev server (Ctrl+C)
# Then start with the dev configuration:
npm run start:dev
```

## Troubleshooting

If you encounter CSP errors:

1. Check browser console for specific blocked resources
2. Add required domains to the appropriate CSP directives
3. Reload the nginx configuration in running containers
4. Rebuild containers if needed

## Favicon Implementation

We've replaced the traditional favicon.ico file with a base64 encoded SVG data URI in the index.html file:

1. This approach eliminates the 404 errors for favicon.ico
2. The SVG favicon is embedded directly in HTML using base64 encoding, removing the need for an external file
3. It leverages the CSP's allowance for data URIs in the img-src directive
4. Base64 encoding prevents CSP issues that can occur with raw SVG data URIs
5. The color of the SVG icon matches our primary brand color (#1976d2)

If you need to modify the favicon:
1. Create your SVG icon
2. Convert it to base64 (using tools like https://www.base64encode.org/)
3. Update the data URI in index.html

## CSP Troubleshooting

Common issues with CSP and their solutions:

1. **Syntax issues**: Ensure your CSP directives are properly formatted with semicolons between them
2. **Directive order**: Some browsers may be sensitive to directive order; keep default-src first
3. **Base64 vs raw data URIs**: Use base64 encoding for data URIs to avoid parsing issues
4. **Headers vs meta tags**: Both methods should work, but in some environments, one may take precedence

## Troubleshooting

If you encounter CSP errors:

1. Check browser console for specific blocked resources
2. Add required domains to the appropriate CSP directives
3. Reload the nginx configuration in running containers
4. Rebuild containers if needed

## Favicon Implementation

We've replaced the traditional favicon.ico file with an inline SVG data URI in the index.html file:

1. This approach eliminates the 404 errors for favicon.ico
2. The SVG favicon is embedded directly in HTML, removing the need for an external file
3. It leverages the CSP's allowance for data URIs in the img-src directive
4. The color of the SVG icon matches our primary brand color (#1976d2)

If you need to modify the favicon:
1. Edit the SVG path in the data URI in index.html
2. For more complex icons, consider using a tool like [RealFaviconGenerator](https://realfavicongenerator.net/) and then convert to a data URI 