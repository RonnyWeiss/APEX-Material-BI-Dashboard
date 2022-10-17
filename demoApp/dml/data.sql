BEGIN
    -------------------------------------------------------------------------------------------------------------------------------------------------
    -- T_DASHBOARD_ITEM_TYPES
    -------------------------------------------------------------------------------------------------------------------------------------------------
    INSERT INTO T_DASHBOARD_ITEM_TYPES (
        TYPE_ID,
        TITLE,
        DESCRIPTION,
        ICON,
        DEFAULT_WIDTH,
        DEFAULT_HEIGHT
    ) VALUES (
        'calendar',
        'Calendar',
        'Add a new Calendar Item to the Dashboard.',
        'fa-calendar',
        4,
        4
    );

    INSERT INTO T_DASHBOARD_ITEM_TYPES (
        TYPE_ID,
        TITLE,
        DESCRIPTION,
        ICON,
        DEFAULT_WIDTH,
        DEFAULT_HEIGHT
    ) VALUES (
        'list',
        'List',
        'Add a new List Item to the Dashboard.',
        'fa-list',
        4,
        3
    );

    INSERT INTO T_DASHBOARD_ITEM_TYPES (
        TYPE_ID,
        TITLE,
        DESCRIPTION,
        ICON,
        DEFAULT_WIDTH,
        DEFAULT_HEIGHT
    ) VALUES (
        'note',
        'Shortnote',
        'Add some notes directly in the dashboard.',
        'fa-sticky-note-o',
        4,
        2
    );
    
    INSERT INTO T_DASHBOARD_ITEM_TYPES (
        TYPE_ID,
        TITLE,
        DESCRIPTION,
        ICON,
        DEFAULT_WIDTH,
        DEFAULT_HEIGHT
    ) VALUES (
        'clock',
        'Analogue Clock',
        'Add an analogue Clock to the dashboard',
        'fa-clock-o',
        2,
        2
    );
    
    INSERT INTO T_DASHBOARD_ITEM_TYPES (
        TYPE_ID,
        TITLE,
        DESCRIPTION,
        ICON,
        DEFAULT_WIDTH,
        DEFAULT_HEIGHT
    ) VALUES (
        'chart',
        'Charts',
        'Add different chart Types to the dashboard',
        'fa-combo-chart',
        4,
        4
    );
    
    INSERT INTO T_DASHBOARD_ITEM_TYPES (
        TYPE_ID,
        TITLE,
        DESCRIPTION,
        ICON,
        DEFAULT_WIDTH,
        DEFAULT_HEIGHT
    ) VALUES (
        'badge',
        'Badge',
        'Add badge card to the dashboard',
        'fa-badge-list',
        2,
        2
    );
    
    INSERT INTO T_DASHBOARD_ITEM_TYPES (
        TYPE_ID,
        TITLE,
        DESCRIPTION,
        ICON,
        DEFAULT_WIDTH,
        DEFAULT_HEIGHT
    ) VALUES (
        'card',
        'Card',
        'Add KPI card to the dashboard',
        'fa-id-card-o',
        2,
        1
    );
    
    INSERT INTO T_DASHBOARD_ITEM_TYPES (
        TYPE_ID,
        TITLE,
        DESCRIPTION,
        ICON,
        DEFAULT_WIDTH,
        DEFAULT_HEIGHT
    ) VALUES (
        'map',
        'Map',
        'Add an offline D3 map to the dashboard',
        'fa-globe',
        4,
        4
    );
    
    INSERT INTO T_DASHBOARD_ITEM_TYPES (
        TYPE_ID,
        TITLE,
        DESCRIPTION,
        ICON,
        DEFAULT_WIDTH,
        DEFAULT_HEIGHT
    ) VALUES (
        'table',
        'Table',
        'Add a table to the dashboard',
        'fa-table',
        3,
        3
    );
    
    INSERT INTO T_DASHBOARD_ITEM_TYPES (
        TYPE_ID,
        TITLE,
        DESCRIPTION,
        ICON,
        DEFAULT_WIDTH,
        DEFAULT_HEIGHT
    ) VALUES (
        'html',
        'HTML Item',
        'Add a HTML Item to the dashboard. You can select iFrames, Diashow and other HTML.',
        'fa-file-code-o',
        4,
        4
    );

    INSERT INTO T_DASHBOARD_ITEM_TYPES (
        TYPE_ID,
        TITLE,
        DESCRIPTION,
        ICON,
        DEFAULT_WIDTH,
        DEFAULT_HEIGHT
    ) VALUES (
        'calendarheatmap',
        'Calendar Heatmap',
        'Add a new Calendar Heatmap Item to the Dashboard.',
        'fa-calendar',
        4,
        2
    );


    -------------------------------------------------------------------------------------------------------------------------------------------------
    -- T_DASHBOARD_ITEMS
    -------------------------------------------------------------------------------------------------------------------------------------------------
    INSERT INTO T_DASHBOARD_ITEMS (
        DASHBOARD_IDENT,
        ITEM_TITLE,
        ITEM_WIDTH,
        ITEM_HEIGHT,
        ITEM_ORDER_NUMBER,
        TYPE_ID,
        ATTRIBUTE_01_C,
        ATTRIBUTE_01
    ) VALUES (
        1,
        'Gauge Chart',
        2,
        2,
        10,
        'chart',
        NULL,
        'gauge'
    );
    
    INSERT INTO T_DASHBOARD_ITEMS (
        DASHBOARD_IDENT,
        ITEM_TITLE,
        ITEM_WIDTH,
        ITEM_HEIGHT,
        ITEM_ORDER_NUMBER,
        TYPE_ID,
        ATTRIBUTE_01_C,
        ATTRIBUTE_01
    ) VALUES (
        1,
        'Calendar',
        4,
        4,
        1,
        'calendar',
        NULL,
        NULL
    );
    
    INSERT INTO T_DASHBOARD_ITEMS (
        DASHBOARD_IDENT,
        ITEM_TITLE,
        ITEM_WIDTH,
        ITEM_HEIGHT,
        ITEM_ORDER_NUMBER,
        TYPE_ID,
        ATTRIBUTE_01_C,
        ATTRIBUTE_01
    ) VALUES (
        1,
        'Map',
        4,
        4,
        4,
        'map',
        NULL,
        1
    );
    
    INSERT INTO T_DASHBOARD_ITEMS (
        DASHBOARD_IDENT,
        ITEM_TITLE,
        ITEM_WIDTH,
        ITEM_HEIGHT,
        ITEM_ORDER_NUMBER,
        TYPE_ID,
        ATTRIBUTE_01_C,
        ATTRIBUTE_01
    ) VALUES (
        1,
        NULL,
        2,
        2,
        3,
        'badge',
        NULL,
        NULL
    );
    
    INSERT INTO T_DASHBOARD_ITEMS (
        DASHBOARD_IDENT,
        ITEM_TITLE,
        ITEM_WIDTH,
        ITEM_HEIGHT,
        ITEM_ORDER_NUMBER,
        TYPE_ID,
        ATTRIBUTE_01_C,
        ATTRIBUTE_01
    ) VALUES (
        1,
        NULL,
        4,
        2,
        7,
        'note',
        '<div><b>Here you can enter notes or tasks that need to be done</b></div><div><b><br></b></div>' ||
        '<div><div><ol><li><strike>Cleanup the kitchen</strike></li><li>Weekly shopping</li><li><b>' ||
        'Call grandma</b></li></ol></div></div>',
        NULL
    );
    
    INSERT INTO T_DASHBOARD_ITEMS (
        DASHBOARD_IDENT,
        ITEM_TITLE,
        ITEM_WIDTH,
        ITEM_HEIGHT,
        ITEM_ORDER_NUMBER,
        TYPE_ID,
        ATTRIBUTE_01_C,
        ATTRIBUTE_01
    ) VALUES (
        1,
        'HTML Item',
        4,
        4,
        6,
        'html',
        NULL,
        'iframe'
    );
    
    INSERT INTO T_DASHBOARD_ITEMS (
        DASHBOARD_IDENT,
        ITEM_TITLE,
        ITEM_WIDTH,
        ITEM_HEIGHT,
        ITEM_ORDER_NUMBER,
        TYPE_ID,
        ATTRIBUTE_01_C,
        ATTRIBUTE_01
    ) VALUES (
        1,
        'Pie Chart',
        2,
        2,
        9,
        'chart',
        NULL,
        'pie'
    );
    
    INSERT INTO T_DASHBOARD_ITEMS (
        DASHBOARD_IDENT,
        ITEM_TITLE,
        ITEM_WIDTH,
        ITEM_HEIGHT,
        ITEM_ORDER_NUMBER,
        TYPE_ID,
        ATTRIBUTE_01_C,
        ATTRIBUTE_01
    ) VALUES (
        1,
        'Area Spline Chart',
        4,
        4,
        5,
        'chart',
        NULL,
        'area-spline'
    );
    
    INSERT INTO T_DASHBOARD_ITEMS (
        DASHBOARD_IDENT,
        ITEM_TITLE,
        ITEM_WIDTH,
        ITEM_HEIGHT,
        ITEM_ORDER_NUMBER,
        TYPE_ID,
        ATTRIBUTE_01_C,
        ATTRIBUTE_01
    ) VALUES (
        1,
        'Calendar Heatmap',
        4,
        2,
        8,
        'calendarheatmap',
        NULL,
        NULL
    );
    
    INSERT INTO T_DASHBOARD_ITEMS (
        DASHBOARD_IDENT,
        ITEM_TITLE,
        ITEM_WIDTH,
        ITEM_HEIGHT,
        ITEM_ORDER_NUMBER,
        TYPE_ID,
        ATTRIBUTE_01_C,
        ATTRIBUTE_01
    ) VALUES (
        1,
        NULL,
        2,
        2,
        2,
        'badge',
        NULL,
        NULL
    );
    
    COMMIT;
END;
/