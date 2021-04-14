create or replace PACKAGE PKG_DASHBOARD_MGMT AS    
    -------------------------------------------------------------------------------------------------------------------------------------------------
    -- Section 1: Execute Dashboard
    -------------------------------------------------------------------------------------------------------------------------------------------------
    -- used to get dashboard data for different modes
    FUNCTION GET_DASHBOARD (
        P_IN_DASHBOARD_IDENT   NUMBER,
        P_IN_LOADING_MODE      VARCHAR2 := 'S',
        P_IN_ITEM_IDENT        NUMBER := NULL
    ) RETURN BLOB;
    
    -------------------------------------------------------------------------------------------------------------------------------------------------
    -- Section 2: Edit Dashboard (Create, Edit or Delete Dashboards and Items
    -------------------------------------------------------------------------------------------------------------------------------------------------

    PROCEDURE ADD_ITEM (
        P_IN_DASHBOARD_IDENT     NUMBER,
        P_IN_TYPE_ID             VARCHAR2,
        P_IN_ITEM_TITLE          VARCHAR2,
        P_IN_ITEM_WIDTH          NUMBER,
        P_IN_ITEM_HEIGHT         NUMBER,
        P_IN_ITEM_ORDER_NUMBER   NUMBER,
        P_IN_ATTRIBUTE_01        VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_02        VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_03        VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_04        VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_05        VARCHAR2 := NULL
    );
    
    PROCEDURE EDIT_ITEM (
        P_IN_ITEM_IDENT          NUMBER,
        P_IN_TYPE_ID             VARCHAR2,
        P_IN_ITEM_TITLE          VARCHAR2,
        P_IN_ITEM_WIDTH          NUMBER,
        P_IN_ITEM_HEIGHT         NUMBER,
        P_IN_ITEM_ORDER_NUMBER   NUMBER,
        P_IN_ATTRIBUTE_01        VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_02        VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_03        VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_04        VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_05        VARCHAR2 := NULL
    );

    PROCEDURE DELETE_ITEM (
        P_IN_ITEM_IDENT NUMBER
    );
    
    PROCEDURE STORE_NEW_ITEM_ORDER (
        P_IN_DASHBOARD_IDENT   NUMBER,
        P_IN_ITEMS             VARCHAR
    );
    
END;
/

create or replace PACKAGE BODY PKG_DASHBOARD_MGMT AS
    -------------------------------------------------------------------------------------------------------------------------------------------------
    -- Section 1: Execute Dashboard
    -------------------------------------------------------------------------------------------------------------------------------------------------
    
    -- used to get dashboard data for different modes
    FUNCTION GET_DASHBOARD (
        P_IN_DASHBOARD_IDENT   NUMBER,
        P_IN_LOADING_MODE      VARCHAR2 := 'S',
        P_IN_ITEM_IDENT        NUMBER := NULL
    ) RETURN BLOB AS

        B_BINARY_JSON   BLOB := EMPTY_BLOB();
        B_COMMA         CONSTANT BLOB := UTL_RAW.CAST_TO_RAW(',');
        I               PLS_INTEGER := 0;
    BEGIN
        DBMS_LOB.CREATETEMPORARY(
            LOB_LOC   => B_BINARY_JSON,
            CACHE     => TRUE,
            DUR       => DBMS_LOB.CALL
        );

        FOR REC IN (
            SELECT
                ITEMS.*,
                COUNT(*) OVER() AS ITEMS_COUNT
            FROM
                (
                    SELECT
                        JSON_OBJECT (
                            /* required - ID of each item that is needed for async load and resort */
                            'itemID' VALUE TDI.ITEM_IDENT, 
                            /* required -  type of the item e.g. chart or calendar */
                            'itemType' VALUE TDI.TYPE_ID,
                            /* optional - title of the dashboard item */
                            'title' VALUE TDI.ITEM_TITLE,
                            /* optional - set background color of dashboard item */
                            'backColor' VALUE NULL, 
                            /* optional - set a background color for the item title */
                            'titleBackColor' VALUE NULL,
                            /* optional - set a icon for the item title */
                            'titleIcon' VALUE NULL, 
                            /* optional - set a color for the item title */
                            'titleColor' VALUE NULL,
                            /* optional - set width of the item between 1 and 12 */
                            'colSpan' VALUE TDI.ITEM_WIDTH,
                            /* optional - set height of the item */
                            'height' VALUE ( TDI.ITEM_HEIGHT * 90 ),
                            /* optional - set if the item is marked */
                            'isMarked' VALUE NULL,
                            /* optional - set if the item has auto refresh (Only for async items) */
                            'refresh' VALUE NULL,
                            /* optional - set if the item is loaded async */
                            'isAsync' VALUE CASE WHEN TDI.TYPE_ID IN ('chart', 'calendar') THEN 1 ELSE 0 END,
                            /* optional - set an url for the options link */
                            'optionsLink' VALUE APEX_PAGE.GET_URL(
                                P_PAGE     => 3,
                                P_ITEMS    => 'P3_ITEM_IDENT',
                                P_VALUES   => TDI.ITEM_IDENT
                            ),
                            /* optional - set icon for the options link */
                            'optionsLinkIcon' VALUE 'fa-edit',
                            /* optional - set background color for the options link */
                            'optionsLinkBackColor' VALUE NULL,
                            /* optional - set color for the options link */
                            'optionsLinkColor' VALUE NULL,
                            /* optional - set an url for the options link top */
                            'optionsLinkTop' VALUE NULL,
                            /* optional - set icon for the options link top */
                            'optionsLinkTopIcon' VALUE 'fa-edit',
                            /* optional - set background color for the options link top */
                            'optionsLinkTopBackColor' VALUE NULL,
                            /* optional - set color for the options link top */
                            'optionsLinkTopColor' VALUE NULL,
                            /* optional - when using sanitizer and want to exclude the item from sanitizing then set this 1 */
                            'noSanitize' VALUE NULL,
                            /* optional - here is the item config loaded */
                            'itemConfig' VALUE PKG_DASHBOARD_ITEM_DATA.GET_ITEM_CONFIG(
                                P_IN_IN_ITEM_IDENT => TDI.ITEM_IDENT,
                                P_IN_TYPE_ID => TDI.TYPE_ID,
                                P_IN_ATTRIBUTE_01 => TDI.ATTRIBUTE_01,
                                P_IN_ATTRIBUTE_02 => TDI.ATTRIBUTE_02,
                                P_IN_ATTRIBUTE_03 => TDI.ATTRIBUTE_03,
                                P_IN_ATTRIBUTE_04 => TDI.ATTRIBUTE_04,
                                P_IN_ATTRIBUTE_05 => TDI.ATTRIBUTE_05
                            ) FORMAT JSON,
                            /* optional - here is the item data loaded */
                            'itemData' VALUE PKG_DASHBOARD_ITEM_DATA.GET_ITEM_DATA(
                                P_IN_IN_ITEM_IDENT => TDI.ITEM_IDENT,
                                P_IN_TYPE_ID => TDI.TYPE_ID,
                                P_IN_LOADING_MODE => P_IN_LOADING_MODE,
                                P_IN_ATTRIBUTE_01 => TDI.ATTRIBUTE_01,
                                P_IN_ATTRIBUTE_02 => TDI.ATTRIBUTE_02,
                                P_IN_ATTRIBUTE_03 => TDI.ATTRIBUTE_03,
                                P_IN_ATTRIBUTE_04 => TDI.ATTRIBUTE_04,
                                P_IN_ATTRIBUTE_05 => TDI.ATTRIBUTE_05
                            ) FORMAT JSON 
                        RETURNING BLOB ) AS JSON_BLOB
                    FROM
                        T_DASHBOARD_ITEMS TDI
                    WHERE
                        TDI.DASHBOARD_IDENT = P_IN_DASHBOARD_IDENT
                        AND (TDI.ITEM_IDENT = P_IN_ITEM_IDENT
                            OR P_IN_ITEM_IDENT IS NULL)
                    ORDER BY
                        TDI.ITEM_ORDER_NUMBER
                ) ITEMS
        ) LOOP
            I := I + 1;
            DBMS_LOB.APPEND(
                B_BINARY_JSON,
                REC.JSON_BLOB
            );
                -- exit when it's the last item and don't add a comma at the end
            IF I = REC.ITEMS_COUNT THEN
                EXIT;
            ELSE
                DBMS_LOB.APPEND(
                    B_BINARY_JSON,
                    B_COMMA
                );
            END IF;

        END LOOP;

        RETURN B_BINARY_JSON;
    END;
    
    -------------------------------------------------------------------------------------------------------------------------------------------------
    -- Section 2: Edit Dashboard (Create, Edit or Delete Dashboards and Items
    -------------------------------------------------------------------------------------------------------------------------------------------------
    -- add a new dashboard item
    PROCEDURE ADD_ITEM (
        P_IN_DASHBOARD_IDENT     NUMBER,
        P_IN_TYPE_ID             VARCHAR2,
        P_IN_ITEM_TITLE          VARCHAR2,
        P_IN_ITEM_WIDTH          NUMBER,
        P_IN_ITEM_HEIGHT         NUMBER,
        P_IN_ITEM_ORDER_NUMBER   NUMBER,
        P_IN_ATTRIBUTE_01        VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_02        VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_03        VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_04        VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_05        VARCHAR2 := NULL
    ) AS
    BEGIN
        INSERT INTO T_DASHBOARD_ITEMS (
            DASHBOARD_IDENT,
            TYPE_ID,
            ITEM_TITLE,
            ITEM_WIDTH,
            ITEM_HEIGHT,
            ITEM_ORDER_NUMBER,
            ATTRIBUTE_01,
            ATTRIBUTE_02,
            ATTRIBUTE_03,
            ATTRIBUTE_04,
            ATTRIBUTE_05
        ) VALUES (
            P_IN_DASHBOARD_IDENT,
            P_IN_TYPE_ID,
            P_IN_ITEM_TITLE,
            P_IN_ITEM_WIDTH,
            P_IN_ITEM_HEIGHT,
            P_IN_ITEM_ORDER_NUMBER,
            P_IN_ATTRIBUTE_01,
            P_IN_ATTRIBUTE_02,
            P_IN_ATTRIBUTE_03,
            P_IN_ATTRIBUTE_04,
            P_IN_ATTRIBUTE_05
        );

    END;

    -- edit a dashboard item

    PROCEDURE EDIT_ITEM (
        P_IN_ITEM_IDENT          NUMBER,
        P_IN_TYPE_ID             VARCHAR2,
        P_IN_ITEM_TITLE          VARCHAR2,
        P_IN_ITEM_WIDTH          NUMBER,
        P_IN_ITEM_HEIGHT         NUMBER,
        P_IN_ITEM_ORDER_NUMBER   NUMBER,
        P_IN_ATTRIBUTE_01        VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_02        VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_03        VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_04        VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_05        VARCHAR2 := NULL
    ) AS
    BEGIN
        UPDATE T_DASHBOARD_ITEMS
        SET
            TYPE_ID = P_IN_TYPE_ID,
            ITEM_TITLE = P_IN_ITEM_TITLE,
            ITEM_WIDTH = P_IN_ITEM_WIDTH,
            ITEM_HEIGHT = P_IN_ITEM_HEIGHT,
            ITEM_ORDER_NUMBER = P_IN_ITEM_ORDER_NUMBER,
            ATTRIBUTE_01 = P_IN_ATTRIBUTE_01,
            ATTRIBUTE_02 = P_IN_ATTRIBUTE_02,
            ATTRIBUTE_03 = P_IN_ATTRIBUTE_03,
            ATTRIBUTE_04 = P_IN_ATTRIBUTE_04,
            ATTRIBUTE_05 = P_IN_ATTRIBUTE_05
        WHERE
            ITEM_IDENT = P_IN_ITEM_IDENT;

    END;

    -- delete a dashboard item
    PROCEDURE DELETE_ITEM (
        P_IN_ITEM_IDENT NUMBER
    ) AS
    BEGIN
        DELETE FROM T_DASHBOARD_ITEMS
        WHERE
            ITEM_IDENT = P_IN_ITEM_IDENT;

    END;
    
    PROCEDURE STORE_NEW_ITEM_ORDER (
        P_IN_DASHBOARD_IDENT   NUMBER,
        P_IN_ITEMS             VARCHAR
    ) AS
    BEGIN
        FOR REC IN (
            SELECT
                COLUMN_VALUE AS ITEM_IDENT,
                ROWNUM AS ITEM_ORDER_NUMBER
            FROM
                TABLE ( APEX_STRING.SPLIT(
                    P_IN_ITEMS,
                    ':'
                ) )
        ) LOOP
            UPDATE T_DASHBOARD_ITEMS
            SET
                ITEM_ORDER_NUMBER = REC.ITEM_ORDER_NUMBER
            WHERE
                ITEM_IDENT = REC.ITEM_IDENT
                AND DASHBOARD_IDENT = P_IN_DASHBOARD_IDENT;

        END LOOP;
    END;

END;
/

CREATE OR REPLACE PACKAGE PKG_DASHBOARD_ITEM_DATA AS   
    -------------------------------------------------------------------------------------------------------------------------------------------------
    -- Section 1: Get Data/Config of Dashboard Items
    -------------------------------------------------------------------------------------------------------------------------------------------------
    -- used in get_dashboard to get config for each item
    FUNCTION GET_ITEM_CONFIG (
        P_IN_IN_ITEM_IDENT   NUMBER,
        P_IN_TYPE_ID         VARCHAR2,
        P_IN_ATTRIBUTE_01    VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_02    VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_03    VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_04    VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_05    VARCHAR2 := NULL
    ) RETURN BLOB;
    
    -- used in get_dashboard to get data for each item
    FUNCTION GET_ITEM_DATA (
        P_IN_IN_ITEM_IDENT   NUMBER,
        P_IN_TYPE_ID         VARCHAR2,
        P_IN_LOADING_MODE    VARCHAR2 := 'S',
        P_IN_ATTRIBUTE_01    VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_02    VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_03    VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_04    VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_05    VARCHAR2 := NULL
    ) RETURN BLOB;

END;
/

create or replace PACKAGE BODY PKG_DASHBOARD_ITEM_DATA AS   
    -------------------------------------------------------------------------------------------------------------------------------------------------
    -- Section 1: internal functions that created item data and config for item types
    -------------------------------------------------------------------------------------------------------------------------------------------------
    --------------------------------------------------------------------------------------------------------------------
    -- Calendar
    --------------------------------------------------------------------------------------------------------------------
    FUNCTION GET_CALENDAR_ITEM_CONFIG RETURN BLOB AS
        VR_BLOB BLOB := EMPTY_BLOB();
    BEGIN
        SELECT
            JSON_OBJECT (
                 /* optional - set how many events are shown without submenu per day [number] */
                'eventLimitPerDay' VALUE 2,
                /* optional -  set type of the calendar view. Possible Types are dayGridMonth: Month view displays 
                the current month’s days, and usually a few days of the previous and next months, in a table-like format, 
                dayGridWeek: A DayGrid view is a view with one or more columns, each representing a day, 
                timeGridWeek: A TimeGrid view displays one-or-more horizontal days as well as an axis of time and listWeek,
                listMonth, listDay: A list view displays events in a simple vertical list for a specific interval of time [string] */
                'viewType' VALUE 'dayGridMonth',
                /* optional - Set if time is shown or only date [boolean]*/
                'displayTime' VALUE 'true' FORMAT JSON,
                /* optional - Use 12 hours or 24 hours. [boolean] */
                'hours12' VALUE 'false' FORMAT JSON,
                /* optional - Set time of scroll position for timeGridWeek [string] */
                'timeGridStartTime' VALUE '06:00:00'
            RETURNING BLOB )
        INTO VR_BLOB
        FROM
            DUAL;

        RETURN VR_BLOB;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN VR_BLOB;
    END;
    
    FUNCTION GET_CALENDAR_ITEM_DATA RETURN BLOB AS
        VR_BLOB BLOB := EMPTY_BLOB();
    BEGIN
        SELECT
            JSON_ARRAYAGG(
                JSON_OBJECT(
                /* required - set title for the calendar event [string] */
                'title' VALUE 'Event ' || ROWNUM,
                /* required - set start ts [date] */
                'start' VALUE TRUNC(SYSDATE,'MM') + ROWNUM + ROUND(DBMS_RANDOM.VALUE(1,20)) / 24,
                /* required - set end ts [date] */
                'end' VALUE TRUNC(SYSDATE,'MM') + ROWNUM + ROUND(DBMS_RANDOM.VALUE(21,23)) / 24,
                /* optional - set event color [string] */
                'color' VALUE 'hsl(' || MOD(ROWNUM * 23,350) || ', 79%, 45%)',
                /* optional -  set color of the event text [string] */
                'textColor' VALUE 'white',
                /* optional -  add an url when click on the event [string] */
                'url' VALUE 'https://linktr.ee/ronny.weiss',
                /* optional -  add details that are shown in tooltip [string] */
                'details' VALUE 'Here are details for event ' || ROWNUM
            RETURNING BLOB)
        RETURNING BLOB)
        INTO VR_BLOB
        FROM
            DUAL
        CONNECT BY
            ROWNUM <= 30;

        RETURN VR_BLOB;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN VR_BLOB;
    END;
    
    --------------------------------------------------------------------------------------------------------------------
    -- Map
    --------------------------------------------------------------------------------------------------------------------
    FUNCTION GET_MAP_ITEM_CONFIG(P_IN_TOUR_ENABLED NUMBER := NULL) RETURN BLOB AS
        VR_BLOB BLOB := EMPTY_BLOB();
    BEGIN
        SELECT
            JSON_OBJECT(
               /* optional - enable or disable tour [sqlbool (1,0)] */
               'tourEnabled' VALUE NVL(P_IN_TOUR_ENABLED,1),
               /* optional - enable or disable shadow effects for tour [sqlbool (1,0)] */
               'tourShadowEffect' VALUE 1,
               /* optional - set speed of tour [number] */
               'tourSpeed' VALUE 7,
               /* optional - set start rotation of tour [number] */
               'tourStart' VALUE -30,
               /* optional - set direction of tour (left, right) [string] */
               'tourDirection' VALUE 'right',
               /* optional - set default radius of circles [number] */
               'circlesRadius' VALUE NULL,
               /* optional - set default color of circles [number] */
               'circlesColor' VALUE NULL,
               /* optional - set default opacity of circles [number] */
               'circlesOpacity' VALUE NULL,
               /* optional - set default opacity on hover of circles [number] */
               'circlesOpacityHover' VALUE NULL,
               /* optional - set default longitude center of map [number] */
               'mapCenterLongitude' VALUE 0,
               /* optional - set default latitude center of map [number] */
               'mapCenterLatitude' VALUE 0,
               /* optional - enable or disable zoom for map [sqlbool (1,0)] */
               'mapZoomEnabled' VALUE 1,
               /* optional - set default zoom of map [number] */
               'mapInitialZoom' VALUE 1,
               /* optional - set default color of map [string] */
               'mapColor' VALUE DECODE(NVL(P_IN_TOUR_ENABLED,1),1,'black',NULL),
               /* optional - set default color for strokes of map [string] */
               'mapStroke' VALUE DECODE(NVL(P_IN_TOUR_ENABLED,1),1,'white',NULL),
               /* optional - set default width of strokes of map [string] */
               'mapStrokeWidth' VALUE '0.5px',
               /* optional - enable or disable shadow effects for map [sqlbool (1,0)] */
               'mapShadows' VALUE 1
           RETURNING BLOB)
        INTO VR_BLOB
        FROM
            DUAL;

        RETURN VR_BLOB;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN VR_BLOB;
    END;
    
    FUNCTION GET_MAP_ITEM_DATA RETURN BLOB AS
        VR_BLOB BLOB := EMPTY_BLOB();
    BEGIN
        SELECT
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    /* optional - set radius of circle [number] */
                    'radius' VALUE ROUND(DBMS_RANDOM.VALUE(8,15)),
                    /* optional - set latitude of circle [number] */
                    'latitude' VALUE ROUND(DBMS_RANDOM.VALUE(-60,60)),
                    /* optional - set longitude of circle [number] */
                    'longitude' VALUE ROUND(DBMS_RANDOM.VALUE(-120,120)),
                    /* optional - set color of circle [string] */
                    'color' VALUE 'hsl('||MOD(ROWNUM*23,200)||',55%,60%)',
                    /* optional - add content of tooltip when hover the circle [string] */
                    'tooltip' VALUE 'This is tooltip ' || ROWNUM,
                    /* optional -  add an url when click on the circle [string] */
                    'link' VALUE 'https://linktr.ee/ronny.weiss'
                RETURNING BLOB)
            RETURNING BLOB)
        INTO VR_BLOB
        FROM
            DUAL CONNECT BY ROWNUM <= 40;

        RETURN VR_BLOB;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN VR_BLOB;
    END;
    
    --------------------------------------------------------------------------------------------------------------------
    -- Table
    --------------------------------------------------------------------------------------------------------------------
    FUNCTION GET_TABLE_ITEM_DATA RETURN BLOB AS
        VR_BLOB BLOB := EMPTY_BLOB();
    BEGIN
        SELECT
            JSON_OBJECT ( 
                'header' VALUE (SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        /* required - header text [string] */
                        'text' VALUE 'Col ' || ROWNUM,
                        /* optional - header background color [string] */
                        'background' VALUE NULL,
                        /* optional - header text align (left, center, right) [string] */
                        'textAlign' VALUE 'center',
                        /* optional - header font color [string] */
                        'color' VALUE NULL,
                        /* optional - header border style [string] */
                        'border' VALUE NULL
                    RETURNING BLOB)
                RETURNING BLOB) FROM DUAL CONNECT BY ROWNUM <=3),
                'data' VALUE (SELECT
                    JSON_ARRAYAGG(
                        JSON_ARRAY(
                            JSON_OBJECT(
                                /* required - cell text [string] */
                                'text' VALUE ROWNUM,
                                /* optional - cell background color [string] */
                                'background' VALUE null,
                                /* optional - cell text align (left, center, right) [string] */
                                'textAlign' VALUE 'center',
                                /* optional - cell font color [string] */
                                'color' VALUE null,
                                /* optional - cell border style [string] */
                                'border' VALUE null 
                            RETURNING BLOB),
                            JSON_OBJECT(
                                /* required - cell text [string] */
                                'text' VALUE 'This is the text of row ' || ROWNUM,
                                /* optional - cell background color [string] */
                                'background' VALUE null,
                                /* optional - cell text align (left, center, right) [string] */
                                'textAlign' VALUE 'center',
                                /* optional - cell font color [string] */
                                'color' VALUE null,
                                /* optional - cell border style [string] */
                                'border' VALUE null 
                            RETURNING BLOB),
                            JSON_OBJECT(
                                /* required - cell text [string] */
                                'text' VALUE 'This is the text of row ' || ROWNUM,
                                /* optional - cell background color [string] */
                                'background' VALUE null,
                                /* optional - cell text align (left, center, right) [string] */
                                'textAlign' VALUE 'center',
                                /* optional - cell font color [string] */
                                'color' VALUE null,
                                /* optional - cell border style [string] */
                                'border' VALUE null 
                            RETURNING BLOB)
                        RETURNING BLOB)
                    RETURNING BLOB) FROM DUAL CONNECT BY ROWNUM <= 8) 
               RETURNING BLOB)  
            INTO VR_BLOB
            FROM DUAL CONNECT BY ROWNUM <= 13;

        RETURN VR_BLOB;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN VR_BLOB;
    END;
    
    --------------------------------------------------------------------------------------------------------------------
    -- Clock
    --------------------------------------------------------------------------------------------------------------------
    FUNCTION GET_CLOCK_ITEM_CONFIG RETURN BLOB AS
        VR_BLOB BLOB := EMPTY_BLOB();
    BEGIN
        SELECT
            JSON_OBJECT(
               /* optional - color of the first label e.g. #ff0000 [string] */
               'labelColor' VALUE NULL,
               /* optional - color of the second label e.g. #ff0000 [string] */
               'labelColor2' VALUE NULL,
               /* optional - color of the hours label e.g. #ff0000 [string] */
               'hourLabelColor' VALUE NULL,
               /* optional - color of the hourly ticks e.g. #ff0000 [string] */
               'hourTickColor' VALUE NULL,
               /* optional - color of the seconds ticks e.g. #ff0000 [string] */
               'secondTickColor' VALUE NULL,
               /* optional - color of the hands e.g. #ff0000 [string] */
               'handColor' VALUE NULL,
               /* optional - enable label for seconds [sqlbool (1,0)] */
               'secondLabel' VALUE 0,
               /* optional - circle outer width [number] */
               'circleWidth' VALUE NULL,
               /* optional - circle fill color [string] */
               'circleFillColor' VALUE 'hsl(' || MOD(ROUND(DBMS_RANDOM.VALUE(1,8)) * 32,220) || ', 80%, 70%)',
               /* optional - circle stroke color*/
               'circleColor' VALUE NULL,
               /* optional - hands cover size [number]*/
               'handsCoverSize' VALUE NULL,
               /* optional - hands cover fill color [string] */
               'handCoverFillColor' VALUE NULL,
               /* optional - hands cover stroke color [string] */
               'handCoverStrokeColor' VALUE NULL,
               /* optional - hands color [string] */
               'handColor' VALUE NULL
           RETURNING BLOB)
        INTO VR_BLOB
        FROM
            DUAL;

        RETURN VR_BLOB;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN VR_BLOB;
    END;
    
    FUNCTION GET_CLOCK_ITEM_DATA RETURN BLOB AS
        VR_BLOB BLOB := EMPTY_BLOB();
    BEGIN
        SELECT
            JSON_OBJECT(
            /* optional - set time of the clock, when omit client time is used [date]*/
            'startDate' VALUE SYSDATE,
            /* optional - set label at the top of the clock [string]*/
            'label' VALUE NULL,
            /* optional - set label at the bottom of the clock [string]*/
            'label2' VALUE NULL
            RETURNING BLOB)
        INTO VR_BLOB
        FROM
            DUAL;

        RETURN VR_BLOB;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN VR_BLOB;
    END;
    
    --------------------------------------------------------------------------------------------------------------------
    -- Charts
    --------------------------------------------------------------------------------------------------------------------
    FUNCTION GET_CHART_ITEM_CONFIG(P_IN_CHART_TYPE VARCHAR2 := NULL) RETURN BLOB AS
        VR_BLOB BLOB := EMPTY_BLOB();
    BEGIN
        SELECT
            JSON_OBJECT(
               /* optional - set chart title */
               'chartTitle' VALUE NULL,
               /* optional - set position of axis labels avail. values are inner1, inner2, inner3, outer1, outer2, outer2 */
               'axisLabelPosition' VALUE NULL,
               /* optional - Set min value for gauge chart [number] */
               'gaugeMin' VALUE NULL,
               /* optional - Set max value for gauge chart [number] */
               'gaugeMax' VALUE NULL,
               /* optional - Set type of the gauge (single, multi) [string] */
               'gaugeType' VALUE 'single',
               /* optional - Set width of the gauge [number] */
               'gaugeWidth' VALUE NULL,
               /* optional - Set min width of the gauge arcs [number] */
               'gaugeArcMinWidth' VALUE NULL,
               /* optional - Set if gauge is full circled [sqlbool (1,0)] */
               'gaugeFullCircle' VALUE 0,
               /* optional - Set title in the center of the gauge */
               'gaugeTitle' VALUE NULL,
               /* optional - Set length of transitions [number] */
               'transitionDuration' VALUE NULL,
               /* optional - Set Charts should show absolute values e.g. pie, gauge and donut [sqlbool (1,0)] */
               'showAbsoluteValues' VALUE 0,
               /* optional - Add x grid lines [sqlbool (1,0)] */
               'gridX' VALUE 0,
               /* optional - Add y grid lines [sqlbool (1,0)] */
               'gridY' VALUE 0,
               /* optional - Bottom padding (height) of the x axis [number] */
               'xAxisHeight' VALUE 0,
               /* optional - Add legend to chart [sqlbool (1,0)] */
               'legendShow' VALUE DECODE(P_IN_CHART_TYPE,'gauge',0,1),
               /* optional - Change the position of legend. avail. values are: bottom, right and inset are supported */
               'legendPosition' VALUE DECODE(P_IN_CHART_TYPE,'pie','right','bottom'),
			   /* optional - Set step type for step and area step charts available options are: step, step-after, step-before */
			   'lineStep' VALUE 'step',
               /* optional - Padding on the bottom of chart [number] */
               'paddingBottom' VALUE NULL,
               /* optional - Padding on the left of chart [number] */
               'paddingLeft' VALUE NULL,
               /* optional - Padding on the right of chart [number] */
               'paddingRight' VALUE NULL,
               /* optional - Padding on the top of chart [number] */
               'paddingTop' VALUE NULL,
               /* optional - Rotate y and x axis [sqlbool (1,0)] */
               'rotateAxis' VALUE 0,
               /* optional - Show or hide labels on each data points [sqlbool (1,0)] */
               'showDataLabels' VALUE 0,
               /* optional - Whether to show each point in line [sqlbool (1,0)] */
               'showDataPoints' VALUE 1,
               /* optional - Cut tick text after num of characters [number] */
               'tickCutAfter' VALUE 30,
               /* optional - Set maximum num of tick texts on a axis [number] */
               'tickMaxnum' VALUE 15,
               /* optional - Show or hide tooltip [sqlbool (1,0)] */
               'tooltipShow' VALUE 1,
               /* optional - Set if tooltip is grouped or not for the data points [sqlbool (1,0)] */
               'tooltipGrouped' VALUE 1,
               /* optional - Set if x axis is shown [sqlbool (1,0)] */
               'xShow' VALUE NULL,
               /* optional - Label of the x axis [string] */
               'xLabel' VALUE 'X Axis',
               /* optional - Set type of x axis. avail types are indexed own index is generated, 
               category x values are taken from data set, timeseries dates are taken from data 
               set x.timeFormat has to be set [string] */
               'xType' VALUE 'category',
               /* optional - Set max length of tick text [number] */
               'xTickCutAfter' VALUE NULL,
               /* optional - Set max number of ticks [number] */
               'xTickMaxNumber' VALUE NULL,
               /* optional - Set rotation of ticks [number] */
               'xTickRotation' VALUE NULL,
               /* optional - Set if x tick labels hould auto rotate depending on length and size of chart [sqlbool (1,0)] */
               'xTickAutoRotate' VALUE 1,
               /* optional - Set if ticks are shown single or multiline [sqlbool (1,0)] */
               'xTickMultiline' VALUE NULL,
               /* optional - Set time format of time series x axis default is ts iso, if you want to change it then you have to use 
               JavaScript notation e.g. %Y-%m-%dT%H:%M:%S, when change this format you have to make TO_CHAR in x Value of chart data [string] */
               'xTimeFormat' VALUE NULL,
               /* optional - Set time format of x axis ticks when using time series - in JavaScript notation e.g. "%m-%d %H:%M" [string] */
               'xTickTimeFormat' VALUE NULL,
               /* if true ticks will be positioned according to x value of the data points, if false ticks will be positioned nicely to have same intervals [sqlbool (1,0)] */
               'xTickFit' VALUE 1,
               /* optional - Label of the y axis [string] */
               'yLabel' VALUE 'Y Axis',
               /* optional - Set max range the y axis [number] */
               'yMax' VALUE NULL,
               /* optional - Set min range the y axis [number] */
               'yMin' VALUE NULL,
               /* optional - Enable or disable log scale of y [sqlbool (1,0)] */
               'yLog' VALUE 0,
               /* optional - Add unit to y [string] */
               'yUnit' VALUE NULL,
               /* optional - Set max tick number [string] */
               'yTickMaxNumber' VALUE NULL,
               /* optional - Label of the y2 axis [string] */
               'y2Label' VALUE 'Y2 Axis',
               /* optional - Set max range the y2 axis [number] */
               'y2Max' VALUE NULL,
               /* optional - Set min range the y2 axis [number] */
               'y2Min' VALUE NULL,
               /* optional - Enable or disable log scale of y2 [sqlbool (1,0)] */
               'y2Log' VALUE 0,
               /* optional - Add unit to y2 [string] */
               'y2Unit' VALUE NULL,
               /* optional - Set max tick number [string] */
               'y2TickMaxNumber' VALUE NULL,
               /* optional - Enable or disable zoom [sqlbool (1,0)] */
               'zoomEnabled' VALUE 1,
               /* optional - Set zoom type of chart (subchart, scroll, drag) [string] */
               'zoomType' VALUE 'scroll',
               /* optional - Set if y axis should rescale on zoom [sqlbool (1,0)] */
               'zoomRescale' VALUE 0
        RETURNING BLOB)
        INTO VR_BLOB
        FROM
            DUAL;

        RETURN VR_BLOB;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN VR_BLOB;
    END;
    
    FUNCTION GET_CHART_ITEM_DATA(P_IN_CHART_TYPE VARCHAR2 := NULL) RETURN BLOB AS
        VR_BLOB BLOB := EMPTY_BLOB();
    BEGIN
        SELECT 
            JSON_ARRAYAGG(
                JSON_OBJECT(
                   /* required - ID that references the series [alphanum] */
                   'seriesID' VALUE 'Series ' || SERIES_ID,
                   /* optional - ID that references the group [alphanum] */
                   'groupID' VALUE 1,
                   /* optional - label of the series [string] */
                   'label' VALUE 'Series ' || SERIES_ID,
                   /* required - set if series is y or y2 axis (y, y2) [string] */
                   'yAxis' VALUE 'y',
                   /* required - type of the chart (bar, line, area, area-spline, bubble, donut, gauge, pie, radar, scatter, spline, step, area-step) [string] */
                   'type' VALUE NVL(P_IN_CHART_TYPE,'area-spline'), 
                   /* optional - link when point of series is clicked [string] */
                   'link' VALUE 'https://linktr.ee/ronny.weiss',
                   /* optional - color of series e.g #ff0000 [string] */
                   'color' VALUE NULL,
                   /* required - data for x axis [depends on x axis type - number, string, date]*/
                   'x' VALUE X,
                   /* required - data for y axis [number] */
                   'y' VALUE Y * SERIES_ID,
                   /* optional - set a custom tooltip [string] */
                   'tooltip' VALUE NULL
                RETURNING BLOB)
            RETURNING BLOB)
            INTO VR_BLOB
        FROM 
            (
                SELECT
                    'Val ' || ROWNUM AS X,
                    ROUND(
                        DBMS_RANDOM.VALUE(
                            1,
                            100
                        )
                    ) AS Y
                FROM
                    DUAL
                CONNECT BY
                    ROWNUM <= 30
            )
            JOIN (
                SELECT
                    ROWNUM AS SERIES_ID
                FROM
                    DUAL
                CONNECT BY
                    ROWNUM <= 4
            ) SERIES
            ON 1 = 1;

        RETURN VR_BLOB;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN VR_BLOB;
    END;
    
    --------------------------------------------------------------------------------------------------------------------
    -- Badge
    --------------------------------------------------------------------------------------------------------------------
    FUNCTION GET_BADGE_ITEM_DATA RETURN BLOB AS
        VR_BLOB BLOB := EMPTY_BLOB();
        BEGIN 
             SELECT
                JSON_OBJECT(
                    /* optional - title of the badge [string] */
                   'title' VALUE DECODE(ROUND(DBMS_RANDOM.VALUE(1,4)),1,'Berlin',2,'New York',3,'Hong Kong','Dresden'),
                   /* optional - title color of the badge [string] */
                   'titleColor' VALUE NULL,
                   /* optional - icon of the badge [string] */
                   'icon' VALUE 'fa-sun-o',
                   /* optional - icon color of the badge [string] */
                   'iconColor' VALUE NULL,
                   /* optional - value that is shown [string] */
                   'value' VALUE ROUND(DBMS_RANDOM.VALUE(-10,30))||' °C',
                   /* optional - value color of the badge [string] */
                   'valueColor' VALUE NULL,
                   /* optional - link on click [string] */
                   'link' VALUE 'https://linktr.ee/ronny.weiss'
                RETURNING BLOB)
                INTO VR_BLOB
            FROM
                DUAL;
              RETURN VR_BLOB;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN VR_BLOB;
        END;
        
    --------------------------------------------------------------------------------------------------------------------
    -- Card
    --------------------------------------------------------------------------------------------------------------------
    FUNCTION GET_CARD_ITEM_DATA RETURN BLOB AS
        VR_BLOB BLOB := EMPTY_BLOB();
        BEGIN 
             SELECT
                JSON_OBJECT(
                   /* optional - icon of the card [string] */
                   'icon' VALUE DECODE(
                                    ROUND(DBMS_RANDOM.VALUE(1,2)),
                                    1,
                                    'fa-apex',
                                    'https://raw.githubusercontent.com/RonnyWeiss/APEX-Advent-Calendar/master/img/thumb/0' || ROUND(DBMS_RANDOM.VALUE(1,9)) || '.jpg'
                                ),
                   /* optional - icon color of the card [string] */
                   'iconColor' VALUE 'white',
                   /* optional - background color of the card [string] */
                   'iconBackColor' VALUE NULL,
                   /* optional - value that is shown [string] */
                   'value' VALUE ROUND(DBMS_RANDOM.VALUE(80,90))||' %',
                   /* optional - footer text [string] */
                   'footer' VALUE 'This is a Dashboard KPI Card.',
                   /* optional - link on click [string] */
                   'link' VALUE 'https://linktr.ee/ronny.weiss'
                RETURNING BLOB)
                INTO VR_BLOB
            FROM
                DUAL;
              RETURN VR_BLOB;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN VR_BLOB;
        END;
    
    --------------------------------------------------------------------------------------------------------------------
    -- List
    --------------------------------------------------------------------------------------------------------------------
    FUNCTION GET_LIST_ITEM_DATA RETURN BLOB AS
        VR_BLOB BLOB := EMPTY_BLOB();
        BEGIN 
             SELECT
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        /* optional - title of the list item [string] */
                        'title' VALUE 'List item ' || ROWNUM,
                        /* optional - group list items with group id [string] */
                        'group' VALUE NULL,
                        /* optional - font-color of the group [string] */
                        'groupColor' VALUE 'inerhit',
                        /* optional - color of the group [string] */
                        'groupBackColor' VALUE NULL,
                        /* optional - text of the list item [string] */
                        'text' VALUE 'This is a list item (Font-APEX or images)',
                        /* optional - icon of the card [string] */
                        'icon' VALUE 'fa-apex',
                        /* optional - set text instead of an icon [string] */
                        'iconText' VALUE NULL,
                        /* optional - icon color of the card [string] */
                        'iconColor' VALUE 'white',
                        /* optional - background color of the card [string] */
                        'iconBackColor' VALUE NULL,
                        /* optional - link when click on list item [string] */
                        'link' VALUE 'https://linktr.ee/ronny.weiss' 
                    RETURNING BLOB) 
                RETURNING BLOB)
                INTO VR_BLOB
            FROM
                DUAL
            CONNECT BY
                ROWNUM <= 6;
              RETURN VR_BLOB;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN VR_BLOB;
        END;
    
    --------------------------------------------------------------------------------------------------------------------
    -- Short Note
    --------------------------------------------------------------------------------------------------------------------
    FUNCTION GET_NOTE_ITEM_DATA(P_IN_IN_ITEM_IDENT NUMBER) RETURN BLOB AS
        VR_BLOB BLOB := EMPTY_BLOB();
    BEGIN
        SELECT
            JSON_OBJECT ( 
                 /* optional - value of the note editor [string] */
                'text' VALUE ATTRIBUTE_01_C RETURNING BLOB )
        INTO VR_BLOB
        FROM
            T_DASHBOARD_ITEMS
        WHERE ITEM_IDENT = P_IN_IN_ITEM_IDENT;

        RETURN VR_BLOB;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN VR_BLOB;
    END;
    
    --------------------------------------------------------------------------------------------------------------------
    -- HTML
    --------------------------------------------------------------------------------------------------------------------
    FUNCTION GET_HTML_ITEM_DATA(P_IN_SAMPLE_TYPE VARCHAR2 := NULL) RETURN BLOB AS
        VR_BLOB BLOB := EMPTY_BLOB();
    BEGIN
        CASE 
            WHEN P_IN_SAMPLE_TYPE = 'iframe' THEN
                SELECT
                    JSON_ARRAY(
                        JSON_OBJECT(
                            /* required - html for the frame [string] */
                            'html' VALUE '<iframe style="width:100%;border:none;height:290px" src="https://www.youtube.com/embed/vqz8c4ZP3Wg"></iframe>',
                            /* required - set duration after next slide is loaded [number] */
                            'duration' VALUE 20
                        RETURNING BLOB),
                        JSON_OBJECT(
                            /* required - html for the frame [string] */
                            'html' VALUE '<iframe style="width:100%;border:none;height:290px" src="https://www.youtube.com/embed/o2hOoQmy1CU"></iframe>',
                            /* required - set duration after next slide is loaded [number] */
                            'duration' VALUE 20
                        RETURNING BLOB)
                    RETURNING BLOB)
                INTO VR_BLOB
                FROM
                    DUAL;
            WHEN P_IN_SAMPLE_TYPE = 'diashow' THEN
                SELECT
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            /* required - html for the frame [string] */
                            'html' VALUE '<div style="width:100%;height:100%;background-size:cover;background-position:center;' ||
                                         'background-size:cover;background-repeat:no-repeat;background-image:' ||
                                         'url(' || V('APP_IMAGES') ||
                                         '0' || ROWNUM || '.jpg)"></div>',
                            /* required - set duration after next slide is loaded [number] */
                            'duration' VALUE 5
                        RETURNING BLOB)
                    RETURNING BLOB)
                INTO VR_BLOB
                FROM
                    DUAL CONNECT BY ROWNUM <= 6;
            ELSE
                SELECT
                    JSON_ARRAY(
                        JSON_OBJECT(
                            /* required - html for the frame [string] */
                            'html' VALUE '<p><strong>Hello Wolrd<br /></strong></p>' ||
                                         '<p><strong>In this Item you can load HTML, iFrames, Video any many more</strong></p>' ||
                                         '<span aria-hidden="true" class="fa fa-emoji-sweet-smile fa-lg"></span>'
                        RETURNING BLOB)
                    RETURNING BLOB)
                INTO VR_BLOB
                FROM
                    DUAL;
            END CASE;

        RETURN VR_BLOB;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN VR_BLOB;
    END;
    
    -------------------------------------------------------------------------------------------------------------------------------------------------
    -- Section 2: Public Functions to Get Data/Config of Dashboard Items
    -------------------------------------------------------------------------------------------------------------------------------------------------
    -- used in get_dashboard to get config for each item
    FUNCTION GET_ITEM_CONFIG (
        P_IN_IN_ITEM_IDENT   NUMBER,
        P_IN_TYPE_ID         VARCHAR2,
        P_IN_ATTRIBUTE_01    VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_02    VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_03    VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_04    VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_05    VARCHAR2 := NULL
    ) RETURN BLOB AS
    BEGIN
        CASE
            WHEN P_IN_TYPE_ID = 'calendar' THEN
                RETURN GET_CALENDAR_ITEM_CONFIG;
            WHEN P_IN_TYPE_ID = 'clock' THEN
                RETURN GET_CLOCK_ITEM_CONFIG;
            WHEN P_IN_TYPE_ID = 'chart' THEN
                RETURN GET_CHART_ITEM_CONFIG(P_IN_CHART_TYPE => P_IN_ATTRIBUTE_01);
            WHEN P_IN_TYPE_ID = 'map' THEN
                RETURN GET_MAP_ITEM_CONFIG(P_IN_TOUR_ENABLED => P_IN_ATTRIBUTE_01);
            ELSE
                RETURN NULL;
        END CASE;
    END;
    
    -- used in get_dashboard to get data for each item

    FUNCTION GET_ITEM_DATA (
        P_IN_IN_ITEM_IDENT   NUMBER,
        P_IN_TYPE_ID         VARCHAR2,
        P_IN_LOADING_MODE    VARCHAR2 := 'S',
        P_IN_ATTRIBUTE_01    VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_02    VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_03    VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_04    VARCHAR2 := NULL,
        P_IN_ATTRIBUTE_05    VARCHAR2 := NULL
    ) RETURN BLOB AS
    BEGIN
        CASE 
            WHEN P_IN_LOADING_MODE = 'S' AND P_IN_TYPE_ID IN ('chart', 'calendar') THEN
                RETURN NULL;
            WHEN P_IN_TYPE_ID = 'calendar' THEN
                RETURN GET_CALENDAR_ITEM_DATA;
            WHEN P_IN_TYPE_ID = 'list' THEN
                RETURN GET_LIST_ITEM_DATA;
            WHEN P_IN_TYPE_ID = 'clock' THEN
                RETURN GET_CLOCK_ITEM_DATA;
            WHEN P_IN_TYPE_ID = 'note' THEN
                RETURN GET_NOTE_ITEM_DATA(P_IN_IN_ITEM_IDENT => P_IN_IN_ITEM_IDENT);
            WHEN P_IN_TYPE_ID = 'chart' THEN
                RETURN GET_CHART_ITEM_DATA(P_IN_CHART_TYPE => P_IN_ATTRIBUTE_01);
            WHEN P_IN_TYPE_ID = 'badge' THEN
                RETURN GET_BADGE_ITEM_DATA;
            WHEN P_IN_TYPE_ID = 'card' THEN
                RETURN GET_CARD_ITEM_DATA;
            WHEN P_IN_TYPE_ID = 'map' THEN
                RETURN GET_MAP_ITEM_DATA;
            WHEN P_IN_TYPE_ID = 'table' THEN
                RETURN GET_TABLE_ITEM_DATA;
            WHEN P_IN_TYPE_ID = 'html' THEN
                RETURN GET_HTML_ITEM_DATA(P_IN_SAMPLE_TYPE => P_IN_ATTRIBUTE_01);
            ELSE
                RETURN NULL;
        END CASE;
    END;

END;
/
