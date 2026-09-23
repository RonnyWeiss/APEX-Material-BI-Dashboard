 # APEX-Material-BI-Dashboard

![Screenshot](https://raw.githubusercontent.com/RonnyWeiss/APEX-Material-BI-Dashboard/main/screenshot.gif)

This plug-in allows to integrate a freely configurable user defined dashboards into Oracle APEX.

It offers many display options, e.g. charts, lists, KPI cards, world map, tables, HTML, analog clock, calendar and much more. Each dashboard item can also be customized and that too at runtime!

The main advantage of the dashboard is that end-users of your APEX app can configure one or more dashboards at runtime without having to touch the display by a developer! This was not possible in APEX so far! Of course, the dashboard can also be used as a fixed region.

The plug-in requires an APEX 5.1.3 or newer and an Oracle 12c or newer. The Sample App requires an APEX 20.2 or newer. However, you can quickly install it in a free workspace on apex.oracle.com and then get started right away with the help of the Sample App!

The item dialog in the Sample App is just a very simplified example, of course in your application the respective data source (table, view, function...) and many setting options for the respective dashboard item can be offered there.

You can find a tutorial at https://www.youtube.com/watch?v=amzzRHLT5KY&list=PL9daxiSwWyTbIm8fTa0ypeC6dFfMgXALq

For working Demo just click on:

https://apex.oracle.com/pls/apex/f?p=103428

**Important clarification: My work in the development team of Oracle APEX is in no way related to my open source projects or the plug-ins on apex.world! All plug-ins are built in my spare time and are not supported by Oracle!**

## How This Dashboard Works

This dashboard is a powerful visualization component for Oracle APEX that allows users to create interactive dashboards with various chart types and data visualizations. 

### Architecture Overview

The dashboard is built as an APEX plugin with the following components:

1. **APEX Plugin**: The main plugin file (`region_type_plugin_apex_bi_dashboard_d3.sql`) defines the plugin structure, attributes, and functionality
2. **Frontend JavaScript**: The `index.html` file contains the main dashboard interface with:
   - Initialization code that sets up the dashboard configuration
   - Configuration objects for various components (charts, tables, clocks, maps, etc.)
   - AJAX call handling for data retrieval
3. **Bridge Component**: The `js/bridge.js` file acts as an intermediary between APEX and JavaScript components
4. **Build Components**: Pre-built JavaScript libraries in the `build/` directory provide core functionality

### Key Features

- **Multiple Visualization Types**: Supports charts, maps, tables, clocks, calendars, HTML items, and more
- **Runtime Configuration**: End-users can customize dashboard items at runtime without developer intervention
- **Flexible Data Sources**: Can work with various data sources including APEX processes
- **Responsive Design**: Built with Bootstrap for responsive layouts
- **Customizable Appearance**: Configurable colors, sizes, and styling options

### Technical Components

1. **Plugin Definition**:
   - Defines plugin attributes like activated features (charts, maps, tables, etc.)
   - Includes helper functions for string operations and data handling
   - Implements data processing logic for different visualization types

2. **Frontend Interface**:
   - Uses D3.js libraries for charting capabilities 
   - Integrates with APEX AJAX framework
   - Supports dynamic loading of dashboard items

3. **Configuration System**:
   - `mainConf`: Main dashboard configuration (size, refresh, styling)
   - `chartConf`: Chart-specific configurations 
   - `tableConf`: Table styling options
   - `clockConf`: Clock display settings
   - `mapConf`: Map rendering parameters

### Usage Flow

1. **Plugin Installation**: The plugin is installed as an APEX region type plugin
2. **Dashboard Creation**: Users create dashboard regions in their APEX applications
3. **Configuration**: Users configure dashboard items through the APEX interface
4. **Data Retrieval**: AJAX calls fetch data from backend processes or database queries
5. **Rendering**: Data is rendered using various visualization components

### Key Files

- `region_type_plugin_apex_bi_dashboard_d3.sql`: Main plugin definition file 
- `index.html`: Frontend dashboard interface
- `js/bridge.js`: Communication bridge between APEX and JavaScript
- `build/bida*.min.js`: Core dashboard JavaScript libraries