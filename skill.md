# APEX Material BI Dashboard Skill

## Project Overview

The APEX Material BI Dashboard is a powerful visualization component for Oracle APEX that allows users to create interactive dashboards with various chart types and data visualizations. It's designed as an APEX plugin that enables end-users to configure dashboard items at runtime without requiring developer intervention.

## Architecture

### Core Components

1. **APEX Plugin**: The main plugin file (`region_type_plugin_apex_bi_dashboard_d3.sql`) defines:
   - Plugin structure and attributes
   - Helper functions for string operations and data handling  
   - Data processing logic for different visualization types
   - Configuration options for dashboard features

2. **Frontend Interface**: The `index.html` file contains:
   - Main dashboard interface with initialization code
   - Configuration objects for various components (charts, tables, clocks, maps, etc.)
   - AJAX call handling for data retrieval
   - Integration with D3.js libraries for charting capabilities

3. **Bridge Component**: The `js/bridge.js` file acts as:
   - Communication bridge between APEX and JavaScript components
   - Handles server communication and data processing
   - Manages loading indicators and error handling

4. **Build Components**: Pre-built JavaScript libraries in the `build/` directory provide:
   - Core dashboard functionality 
   - D3.js charting capabilities
   - Layout management (Masonry grid)
   - Data sanitization features

## Key Features

- **Multiple Visualization Types**: Supports charts, maps, tables, clocks, calendars, HTML items, and more
- **Runtime Configuration**: End-users can customize dashboard items at runtime without developer intervention
- **Flexible Data Sources**: Can work with various data sources including APEX processes and database queries
- **Responsive Design**: Built with Bootstrap for responsive layouts
- **Customizable Appearance**: Configurable colors, sizes, and styling options

## Technical Details

### Plugin Attributes

The plugin supports several configurable attributes:
- Activated Features: Charts, Maps, Tables, Clocks, Calendars, etc.
- Dashboard size and layout settings
- Refresh intervals
- Styling options (colors, backgrounds, shadows)
- Configuration objects for each visualization type

### Data Flow

1. **Plugin Installation**: The plugin is installed as an APEX region type plugin
2. **Dashboard Creation**: Users create dashboard regions in their APEX applications
3. **Configuration**: Users configure dashboard items through the APEX interface
4. **Data Retrieval**: AJAX calls fetch data from backend processes or database queries  
5. **Rendering**: Data is rendered using various visualization components

### Configuration Objects

- `mainConf`: Main dashboard configuration (size, refresh, styling)
- `chartConf`: Chart-specific configurations 
- `tableConf`: Table styling options
- `clockConf`: Clock display settings
- `mapConf`: Map rendering parameters
- `sanitizerConf`: HTML sanitization rules

## Supported Visualization Types

1. **D3 Billboard Charts**: Interactive charting capabilities using D3.js
2. **D3 World Map**: Geographical visualization with map features  
3. **HTML Tables**: Structured data presentation
4. **Analogue Clock**: Real-time clock display with customizable design
5. **Calendar Views**: Date-based visualization
6. **Note Items**: Text-based dashboard elements

## Requirements

- Oracle APEX 5.1.3 or newer
- Oracle Database 12c or newer  
- Compatible with APEX 20.2 or newer for Sample App

## Usage Example

The dashboard can be used both as:
- A runtime configurable dashboard where users customize items at runtime
- A fixed region in applications with predefined configurations

## Development Environment

This project uses:
- HTML5 and JavaScript for frontend components
- D3.js for charting capabilities
- Bootstrap 4 for responsive design
- jQuery for DOM manipulation and AJAX handling
- APEX AJAX framework integration

The plugin is designed to be easily integrated into existing Oracle APEX applications through the standard plugin installation process.