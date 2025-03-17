// eslint-disable-next-line no-unused-vars
const apexBIDashBoard = function ( apex, $, DOMPurify, Masonry, pell ) {
    "use strict";
    const util = {
        "featureDetails": {
            name: "Material-BI-Dashboard",
            scriptVersion: "23.10.09",
            utilVersion: "22.11.28",
            url: "https://github.com/RonnyWeiss",
            url2: "https://linktr.ee/ronny.weiss",
            license: "MIT License"
        },
        isDefinedAndNotNull: function ( pInput ) {
            if ( typeof pInput !== "undefined" && pInput !== null && pInput !== "" ) {
                return true;
            } else {
                return false;
            }
        },
        debounce: function ( pFunction, pTimeout = 50 ){
            let timer;
            return ( ...args ) => {
                clearTimeout( timer );
                timer = setTimeout( 
                    function() { 
                        pFunction.apply( this, args );
                    }, pTimeout );
            };
        },
        groupObjectArray: function ( objectArr, jSONKey ) {
            if ( objectArr && Array.isArray( objectArr ) ) {
                return objectArr.reduce( function ( retVal, x ) {
                    let key = x[jSONKey];
                    if ( key ) {
                        /* workaround for object sort of numbers */
                        key = "\u200b" + key;
                        ( retVal[key] = retVal[key] || [] ).push( x );
                    }
                    return retVal;
                }, {} );
            } else {
                return [];
            }
        },
        link: function ( pLink, pTarget = "_parent" ) {
            if ( typeof pLink !== "undefined" && pLink !== null && pLink !== "" ) {
                window.open( pLink, pTarget );
            }
        },
        tooltip: {
            show: function ( htmlContent, backgroundColor, maxWidth ) {
                try {
                    if ( $( "#dynToolTip" ).length === 0 ) {
                        const tooltip = $( "<div></div>" )
                            .attr( "id", "dynToolTip" )
                            .css( "color", "#111" )
                            .css( "max-width", "400px" )
                            .css( "position", "absolute" )
                            .css( "top", "0px" )
                            .css( "left", "0px" )
                            .css( "z-index", "2000" )
                            .css( "background-color", "rgba(240, 240, 240, 1)" )
                            .css( "padding", "10px" )
                            .css( "display", "block" )
                            .css( "top", "0" )
                            .css( "overflow-wrap", "break-word" )
                            .css( "word-wrap", "break-word" )
                            .css( "-ms-hyphens", "auto" )
                            .css( "-moz-hyphens", "auto" )
                            .css( "-webkit-hyphens", "auto" )
                            .css( "hyphens", "auto" );
                        if ( backgroundColor ) {
                            tooltip.css( "background-color", backgroundColor );
                        }
                        if ( maxWidth ) {
                            tooltip.css( "max-width", maxWidth );
                        }
                        $( "body" ).append( tooltip );
                    } else {
                        $( "#dynToolTip" ).css( "visibility", "visible" );
                    }
    
                    $( "#dynToolTip" ).html( htmlContent );
                    $( "#dynToolTip" )
                        .find( "*" )
                        .css( "max-width", "100%" )
                        .css( "overflow-wrap", "break-word" )
                        .css( "word-wrap", "break-word" )
                        .css( "-ms-hyphens", "auto" )
                        .css( "-moz-hyphens", "auto" )
                        .css( "-webkit-hyphens", "auto" )
                        .css( "hyphens", "auto" )
                        .css( "white-space", "normal" );
                    $( "#dynToolTip" )
                        .find( "img" )
                        .css( "object-fit", "contain" )
                        .css( "object-position", "50% 0%" );
                } catch ( e ) {
                    apex.debug.error( {
                        "module": "utils.js",
                        "msg": "Error while try to show tooltip",
                        "err": e
                    } );
                }
            },
            setPosition: function ( event ) {
                $( "#dynToolTip" ).position( {
                    my: "left+6 top+6",
                    of: event,
                    collision: "flipfit"
                } );
            },
            hide: function () {
                $( "#dynToolTip" ).css( "visibility", "hidden" );
            },
            remove: function () {
                $( "#dynToolTip" ).remove();
            }
        },
        escapeHTML: function ( str ) {
            if ( str === null ) {
                return null;
            }
            if ( typeof str === "undefined" ) {
                return;
            }
            if ( typeof str === "object" ) {
                try {
                    str = JSON.stringify( str );
                } catch ( e ) {
                    /*do nothing */
                }
            }
            return apex.util.escapeHTML( String( str ) );
        },
        loader: {
            start: function ( id, setMinHeight ) {
                if ( setMinHeight ) {
                    $( id ).css( "min-height", "100px" );
                }
                apex.util.showSpinner( $( id ) );
            },
            stop: function ( id, removeMinHeight ) {
                if ( removeMinHeight ) {
                    $( id ).css( "min-height", "" );
                }
                $( id + " > .u-Processing" ).remove();
                $( id + " > .ct-loader" ).remove();
            }
        },
        splitString2Array: function ( pString ) {
            if ( typeof pString !== "undefined" && pString !== null && pString !== "" && pString.length > 0 ) {
                if ( apex && apex.server && apex.server.chunk ) {
                    return apex.server.chunk( pString );
                } else {
                    /* apex.server.chunk only avail on APEX 18.2+ */
                    const splitSize = 8000;
                    let tmpSplit;
                    let retArr = [];
                    if ( pString.length > splitSize ) {
                        for ( retArr = [], tmpSplit = 0; tmpSplit < pString.length; ) {
                            retArr.push( pString.substr( tmpSplit, splitSize ) );
                            tmpSplit += splitSize;
                        }
                        return retArr;
                    }
                    retArr.push( pString );
                    return retArr;
                }
            } else {
                return [];
            }
        },
        jsonSaveExtend: function ( srcConfig, targetConfig ) {
            let finalConfig = {};
            let tmpJSON = {};
            /* try to parse config json when string or just set */
            if ( typeof targetConfig === 'string' ) {
                try {
                    tmpJSON = JSON.parse( targetConfig );
                } catch ( e ) {
                    apex.debug.error( {
                        "module": "util.js",
                        "msg": "Error while try to parse targetConfig. Please check your Config JSON. Standard Config will be used.",
                        "err": e,
                        "targetConfig": targetConfig
                    } );
                }
            } else {
                tmpJSON = $.extend( true, {}, targetConfig );
            }
            /* try to merge with standard if any attribute is missing */
            try {
                finalConfig = $.extend( true, {}, srcConfig, tmpJSON );
            } catch ( e ) {
                finalConfig = $.extend( true, {}, srcConfig );
                apex.debug.error( {
                    "module": "util.js",
                    "msg": "Error while try to merge 2 JSONs into standard JSON if any attribute is missing. Please check your Config JSON. Standard Config will be used.",
                    "err": e,
                    "finalConfig": finalConfig
                } );
            }
            return finalConfig;
        },
        printDOMMessage: {
            show: function ( id, text, icon, color ) {
                const div =$( "<div>" );
                if ( $( id ).height() >= 150 ) {
                    const subDiv = $( "<div></div>" );
    
                    const iconSpan = $( "<span></span>" )
                        .addClass( "fa" )
                        .addClass( icon || "fa-info-circle-o" )
                        .addClass( "fa-2x" )
                        .css( "height", "32px" )
                        .css( "width", "32px" )
                        .css( "margin-bottom", "16px" )
                        .css( "color", color || "#D0D0D0" );
    
                    subDiv.append( iconSpan );
    
                    const textSpan = $( "<span></span>" )
                        .text( text )
                        .css( "display", "block" )
                        .css( "color", "#707070" )
                        .css( "text-overflow", "ellipsis" )
                        .css( "overflow", "hidden" )
                        .css( "white-space", "nowrap" )
                        .css( "font-size", "12px" );
    
                    div
                        .css( "margin", "12px" )
                        .css( "text-align", "center" )
                        .css( "padding", "10px 0" )
                        .addClass( "dominfomessagediv" )
                        .append( subDiv )
                        .append( textSpan );
                } else {  
                    const iconSpan = $( "<span></span>" )
                        .addClass( "fa" )
                        .addClass( icon || "fa-info-circle-o" )
                        .css( "font-size", "22px" )
                        .css( "line-height", "26px" )
                        .css( "margin-right", "5px" )
                        .css( "color", color || "#D0D0D0" );
    
                    const textSpan = $( "<span></span>" )
                        .text( text )
                        .css( "color", "#707070" )
                        .css( "text-overflow", "ellipsis" )
                        .css( "overflow", "hidden" )
                        .css( "white-space", "nowrap" )
                        .css( "font-size", "12px" )
                        .css( "line-height", "20px" );
    
                    div
                        .css( "margin", "10px" )
                        .css( "text-align", "center" )
                        .addClass( "dominfomessagediv" )
                        .append( iconSpan )
                        .append( textSpan );
                }
                $( id ).append( div );
            },
            hide: function ( id ) {
                $( id ).children( '.dominfomessagediv' ).remove();
            }
        },
        noDataMessage: {
            show: function ( id, text ) {
                util.printDOMMessage.show( id, text, "fa-search" );
            },
            hide: function ( id ) {
                util.printDOMMessage.hide( id );
            }
        },
        errorMessage: {
            show: function ( id, text ) {
                util.printDOMMessage.show( id, text, "fa-exclamation-triangle", "#FFCB3D" );
            },
            hide: function ( id ) {
                util.printDOMMessage.hide( id );
            }
        },
        cutString: function ( text, textLength ) {
            try {
                if ( textLength < 0 ) {return text;}
                else {
                    return ( text.length > textLength ) ?
                        text.substring( 0, textLength - 3 ) + "..." :
                        text;
                }
            } catch ( e ) {
                return text;
            }
        },
        isBetween: function ( pValue, pValue2, pRange ) {
            const range = pRange || 0,
                  min = pValue2 - range,
                  max = pValue2 + range;
            return ( pValue >= min && pValue <= max );
        }
    };

    /***********************************************************************
     **
     ** Used to format a date nice
     **
     ***********************************************************************/
    function formatDate( pDate ) {
        const date = new Date ( pDate );
        const lang = ( apex.locale && apex.locale.getLanguage ) ? apex.locale.getLanguage() : undefined;
        return date.toLocaleDateString( lang );
    }

    /***********************************************************************
     **
     ** Used to set parameter from data or from config 
     **
     ***********************************************************************/
    function setObjectParameter( srcValue, cfgValue, convData2Bool ) {
        if ( convData2Bool ) {
            if ( typeof srcValue !== "undefined" && srcValue != null ) {
                if ( srcValue === 1 || srcValue === 'true' ) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return cfgValue;
            }
        } else {
            if ( util.isDefinedAndNotNull( srcValue ) ) {
                return srcValue;
            } else {
                return cfgValue;
            }
        }
    }

    /***********************************************************************
     **
     ** Used to define svg shadows if needed
     **
     ***********************************************************************/
    function defineSVGShadows( pSVG, pID, pY, pX, pSize ) {
        const defs = pSVG.append( "defs" );

        const filter = defs.append( "filter" )
            .attr( "id", pID );

        filter.append( "feGaussianBlur" )
            .attr( "in", "SourceAlpha" )
            .attr( "stdDeviation", pSize )
            .attr( "result", "blur" );
        filter.append( "feOffset" )
            .attr( "in", "blur" )
            .attr( "dx", pX )
            .attr( "dy", pY )
            .attr( "result", "offsetBlur" );
        filter.append( "feFlood" )
            .attr( "in", "offsetBlur" )
            .attr( "flood-color", "#000" )
            .attr( "flood-opacity", "0.26" )
            .attr( "result", "offsetColor" );
        filter.append( "feComposite" )
            .attr( "in", "offsetColor" )
            .attr( "in2", "offsetBlur" )
            .attr( "operator", "in" )
            .attr( "result", "offsetBlur" );

        const feMerge = filter.append( "feMerge" );

        feMerge.append( "feMergeNode" )
            .attr( "in", "offsetBlur" );
        feMerge.append( "feMergeNode" )
            .attr( "in", "SourceGraphic" );
    }

    /***********************************************************************
     **
     ** Used to add the footer to the region
     **
     ***********************************************************************/
    function addCFooter( pRegion ) {
        const footer = $( "<div></div>" );
        footer.css( "position", "absolute" );
        footer.css( "margin", "-5px" );
        footer.css( "bottom", "0px" );
        footer.css( "right", "10px" );
        footer.css( "font-size", "9px" );
        footer.css( "color", "rgb(0,0,0,0.3)" );
        footer.css( "line-height", "9px" );

        const logo = $( "<i></i>" );
        logo.addClass( "fa" );
        logo.addClass( "fa-heart" );
        logo.css( "font-size", "9px" );
        logo.css( "color", "inherit" );
        logo.css( "opacity", "0.3" );
        logo.css( "line-height", "10px" );

        const link = $( "<a></a>" );
        link.attr( "href", "https://linktr.ee/ronny.weiss" );
        link.attr( "target", "_blank" );
        link.css( "color", "inherit" );

        link.append( logo );

        const logo1 = $( "<i></i>" );
        logo1.addClass( "fa" );
        logo1.addClass( "fa-apex" );
        logo1.css( "font-size", "9px" );
        logo1.css( "color", "inherit" );
        logo1.css( "opacity", "0.3" );
        logo1.css( "line-height", "10px" );

        const link1 = $( "<a></a>" );
        link1.attr( "href", "https://apex.oracle.com" );
        link1.attr( "target", "_blank" );
        link1.css( "color", "inherit" );

        link1.append( logo1 );

        footer.append( "Build with " );
        footer.append( link );
        footer.append( " for " );
        footer.append( link1 );

        $( pRegion ).append( footer );
    }

    /***********************************************************************
     **
     ** function to escape of sanitize html
     **
     ***********************************************************************/
    function escapeOrSanitizeHTML( pHTML, pOptions, pIsSafeItem, pRequireHTMLEscape ) {
        /* escape html if escape is set */
        if ( pRequireHTMLEscape !== false ) {
            return util.escapeHTML( pHTML );
        }

        /* if safe item return full html*/
        if ( pIsSafeItem === true ) {
            return pHTML;
        }

        /* if sanitizer is activated sanitize html */
        if ( $.inArray( "sanitizer", pOptions.features ) > -1 && pIsSafeItem !== true ) {
            return DOMPurify.sanitize( pHTML, pOptions.purifyOptions );
        } else {
            return pHTML;
        }
    }

    return {
        initialize: function ( pRegionID, pRegionIDRefresh, pAjaxID, pNoDataMsg, pErrMsg, pDefaultConfigJSON, pLoadingMethod, pFeatures, pChartConfigJSON, pItems2Submit, pItems2SubmitImg, pRequireHTMLEscape, pPurifyOptions, pMapURL, pMapOptions, pTableConfigJSON, pClockOptions, pCalendarOptions ) {
            apex.debug.info( {
                "fct": `${util.featureDetails.name} - initialize`,
                "arguments": {
                    "pRegionID": pRegionID,
                    "pRegionIDRefresh": pRegionIDRefresh,
                    "pAjaxID": pAjaxID,
                    "pNoDataMsg": pNoDataMsg,
                    "pErrMsg": pErrMsg,
                    "pDefaultConfigJSON": pDefaultConfigJSON,
                    "pLoadingMethod": pLoadingMethod,
                    "pFeatures": pFeatures,
                    "pChartConfigJSON": pChartConfigJSON,
                    "pItems2Submit": pItems2Submit,
                    "pItems2SubmitImg": pItems2SubmitImg,
                    "pRequireHTMLEscape": pRequireHTMLEscape,
                    "pPurifyOptions": pPurifyOptions,
                    "pMapURL": pMapURL,
                    "pMapOptions": pMapOptions,
                    "pTableConfigJSON": pTableConfigJSON,
                    "pClockOptions": pClockOptions,
                    "pCalendarOptions": pCalendarOptions
                },
                "featureDetails": util.featureDetails
            } );

            const containerIDSel = "#" + pRegionID,
                  container = $( containerIDSel ),
                  loaderSel = "#" + pRegionIDRefresh,
                  sizeCorrection = 10,
                  regionSizerID = pRegionID + "-sizer";

            let masonry,
                mapJSON = {},
                timers = {},
                keepScroll = 0,
                asyncAjaxReference = 0;

            const masonryAPI = {
                initMasonry: function() {
                    if ( masonry ) {
                        masonry.destroy();
                    }
                    /* option for masonry */
                    const masonryIdentifier = "." + pRegionID,
                          masonryJSON = {
                              itemSelector: "." + pRegionID + "-item",
                              columnWidth: "." + regionSizerID,
                              horizontalOrder: false,
                              initLayout: true,
                              percentPosition: true,
                              transitionDuration: 0,
                              gutter: 0
                          };

                    masonry = new Masonry( masonryIdentifier, masonryJSON );
                },
                /* update layoput and keep scroll position */
                resizeMasonry: function() {
                    if ( masonry ) {
                        masonry.layout();
                        $( document ).scrollTop( keepScroll );
                    }
                }
            };

            if ( pRegionID && container.length > 0 ) {
                container.addClass( pRegionID );
                util.loader.start( loaderSel );

                /* this default json is used if something is missing in cofig */
                const stdConfigJSON = {
                    "footprint": true,
                    "isSortable": false,
                    "colSpan": 12,
                    "height": 400,
                    "refresh": 0,
                    "backColor": "transparent",
                    "color": "inherit",
                    "boxShadow": "0px 0px 6px 0.32px rgba(0, 0, 0, 0.26)",
                    "optionsLink": {
                        "backColor": "transparent",
                        "color": "inherit",
                        "icon": "fa-link"
                    },
                    "optionsLinkTop": {
                        "backColor": "transparent",
                        "color": "inherit",
                        "icon": "fa-link"
                    },
                    "title": {
                        "backColor": "transparent",
                        "color": "inherit",
                        "icon": null
                    }
                };

                /* default table options */
                const stdTableConfigJSON = {
                    "header": {
                        "background": "white",
                        "textAlign": "left",
                        "color": "inherit",
                        "border": "1px solid rgba(240, 240, 240, 1)"
                    },
                    "cells": {
                        "background": "transparent",
                        "textAlign": "left",
                        "color": "inherit",
                        "border": "1px solid rgba(240, 240, 240, 1)"
                    },
                    "evenRow": {
                        "background": "white",
                        "textAlign": "left",
                        "color": "inherit",
                        "borderBottom": "1px solid rgba(240, 240, 240, 1)"
                    },
                    "oddRow": {
                        "background": "rgb(240,240,240)",
                        "textAlign": "left",
                        "color": "inherit",
                        "borderBottom": "1px solid rgba(240, 240, 240, 1)"
                    }

                };

                /* default d3JS map options */
                const stdMapConfigJSON = {
                    "tour": {
                        "enabled": true,
                        "direction": "right",
                        "speed": 2,
                        "start": -30,
                        "shadowEffect": true
                    },
                    "circles": {
                        "color": "rgb(97, 159, 209)",
                        "radius": 5,
                        "opacity": 0.8,
                        "opacityHover": 0.65,
                        "shadows": false
                    },
                    "map": {
                        "stroke": "#303030",
                        "strokeWidth": "0.5px",
                        "color": "#eee",
                        "centerLongitude": 0,
                        "centerLatitude": 0,
                        "initialZoom": 1,
                        "zoomEnabled": true,
                        "shadows": true
                    }
                };

                /* default d3JS billboard charts options */
                const stdChartConfigJSON = {
                    "axisLabelPosition": "inner3",
                    "background": null,
                    "chartTitle": null,
                    "gauge": {
                        "min": 0,
                        "max": null,
                        "type": "single",
                        "width": null,
                        "arcMinWidth": null,
                        "fullCircle": false,
                        "title": null,
                        "axisLabels": true
                    },
                    "grid": {
                        "x": true,
                        "y": true
                    },
                    "legend": {
                        "position": "right",
                        "show": true
                    },
                    "line": {
                        "step": "step"
                    },
                    "padding": {
                        "bottom": null,
                        "left": null,
                        "right": null,
                        "top": null
                    },
                    "rotateAxis": false,
                    "showDataLabels": false,
                    "showDataPoints": true,
                    "showAbsoluteValues": false,
                    "threshold": 0.05,
                    "tooltip": {
                        "grouped": true,
                        "show": true
                    },
                    "transitionDuration": 200,
                    "x": {
                        "axisHeight": null,
                        "label": "x Axis",
                        "timeFormat": "%Y-%m-%dT%H:%M:%S",
                        "type": "category",
                        "tick": {
                            "cutAfter": 30,
                            "maxNumber": 25,
                            "multiline": false,
                            "rotation": 60,
                            "autoRotate": true,
                            "timeFormat": "%y-%m-%d %H:%M",
                            "fit": true
                        }
                    },
                    "y": {
                        "label": "y Axis 1",
                        "log": false,
                        "max": null,
                        "min": null,
                        "unit": null,
                        "tick": {
                            "maxNumber": null
                        }
                    },
                    "y2": {
                        "label": "y Axis 2",
                        "log": false,
                        "max": null,
                        "min": null,
                        "unit": null,
                        "tick": {
                            "maxNumber": null
                        }
                    },
                    "zoom": {
                        "enabled": true,
                        "type": "scroll",
                        "rescale": false
                    }
                };

                /* default purify js - sanitizer options */
                const stdSanatizerConfigJSON = {
                    "ALLOWED_ATTR": ["accesskey", "align", "alt", "always", "autocomplete", "autoplay", "border", "cellpadding", "cellspacing", "charset", "class", "colspan", "dir", "height", "href", "id", "lang", "name", "rel", "required", "rowspan", "src", "style", "summary", "tabindex", "target", "title", "type", "value", "width"],
                    "ALLOWED_TAGS": ["a", "address", "b", "blockquote", "br", "caption", "code", "dd", "div", "dl", "dt", "em", "figcaption", "figure", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img", "label", "li", "nl", "ol", "p", "pre", "s", "span", "strike", "strong", "sub", "sup", "table", "tbody", "td", "th", "thead", "tr", "u", "ul"]
                };

                /* default clock options */
                const stdClockConfigJSON = {
                    "shadows": false,
                    "label": {
                        "labelColor": "#303030",
                        "labelColor2": "#303030"
                    },
                    "hour": {
                        "labelColor": "#303030",
                        "tickColor": "#999"
                    },
                    "second": {
                        "label": false,
                        "labelColor": "#707070",
                        "tickColor": "#ccc"
                    },
                    "hands": {
                        "color": "#303030",
                        "coverFillColor": "white",
                        "coverStrokeColor": "#999",
                        "coverSize": 2
                    },
                    "circle": {
                        "color": "#ccc",
                        "width": 5,
                        "fillColor": "#eeeeee"
                    }
                };

                const stdCalendarConfigJSON = {
                    "eventLimitPerDay": 2,
                    "viewType": "dayGridMonth",
                    "displayTime": true,
                    "hours12": false,
                    "timeGridStartTime": "06:00:00",
                    "stickyHeaderDates": "auto"
                };

                let featureArr;

                /* build array of features */
                if ( util.isDefinedAndNotNull( pFeatures ) ) {
                    featureArr = pFeatures.split( ':' );
                }

                /* draw grid container and get data to init dashboard */
                let configJSON = {},
                    chartConfigJSON = {},
                    tableConfigJSON = {},
                    purifyOptions = {},
                    mapOptions = {},
                    clockOptions = {},
                    calendarOptions = {};

                /* merge main config */
                configJSON = util.jsonSaveExtend( stdConfigJSON, pDefaultConfigJSON );
                /* add features array to configJSON */
                configJSON.features = [];

                if ( featureArr && featureArr.length > 0 ) {
                    configJSON.features = featureArr;
                }

                /* merge config for chart if feature is activated */
                if ( $.inArray( "charts", configJSON.features ) > -1 ) {
                    chartConfigJSON = util.jsonSaveExtend( stdChartConfigJSON, pChartConfigJSON );
                    configJSON.d3JSchart = chartConfigJSON;
                } else {
                    configJSON.d3JSchart = null;
                }

                /* merge config for table if feature is activated */
                if ( $.inArray( "table", configJSON.features ) > -1 ) {
                    tableConfigJSON = util.jsonSaveExtend( stdTableConfigJSON, pTableConfigJSON );
                    configJSON.table = tableConfigJSON;
                } else {
                    configJSON.table = null;
                }

                /* merge config for sanitizer if feature is activated */
                if ( $.inArray( "sanitizer", configJSON.features ) > -1 ) {
                    purifyOptions = util.jsonSaveExtend( stdSanatizerConfigJSON, pPurifyOptions );
                    configJSON.purifyOptions = purifyOptions;
                } else {
                    configJSON.purifyOptions = null;
                }

                /* merge config for d3JS map if feature is activated */
                if ( $.inArray( "map", configJSON.features ) > -1 ) {
                    mapOptions = util.jsonSaveExtend( stdMapConfigJSON, pMapOptions );
                    configJSON.mapOptions = mapOptions;
                } else {
                    configJSON.mapOptions = null;
                }

                /* merge config for clock if feature is activated */
                if ( $.inArray( "clock", configJSON.features ) > -1 ) {
                    clockOptions = util.jsonSaveExtend( stdClockConfigJSON, pClockOptions );
                    configJSON.clockOptions = clockOptions;
                } else {
                    configJSON.clockOptions = null;
                }

                /* merge config for clock if feature is activated */
                if ( $.inArray( "calendar", configJSON.features ) > -1 ) {
                    calendarOptions = util.jsonSaveExtend( stdCalendarConfigJSON, pCalendarOptions );
                    configJSON.calendarOptions = calendarOptions;
                } else {
                    configJSON.calendarOptions = null;
                }

                configJSON.noDataMessage = pNoDataMsg;
                configJSON.errorMessage = pErrMsg;

                configJSON.items2Submit = pItems2Submit;
                configJSON.items2SubmitImg = pItems2SubmitImg;

                apex.debug.info( {
                    "fct": `${util.featureDetails.name} - initialize`,
                    "finalConfigJSON": configJSON,
                    "featureDetails": util.featureDetails
                } );

                /* keep scrollPosition */
                $( document ).on( "scroll touchmove", function () {
                    keepScroll = $( document ).scrollTop();
                } );

                /* get data and draw */
                getData( pLoadingMethod, configJSON );

                /* try to bind APEX refreh event if "APEX" exists */
                try {
                    if ( pRegionIDRefresh ) {
                        $( loaderSel ).bind( "apexrefresh", function () {
                            apex.debug.info( {
                                "fct": `${util.featureDetails.name} - initialize`,
                                "msg": "Refresh event was fired",
                                "featureDetails": util.featureDetails
                            } );
                            getData( pLoadingMethod, configJSON, true );
                        } );
                    } else {
                        apex.debug.error( {
                            "fct": `${util.featureDetails.name} - initialize`,
                            "msg": "Can't bind refresh event because Refresh Region ID is missing",
                            "featureDetails": util.featureDetails
                        } );
                    }
                } catch ( e ) {
                    apex.debug.error( {
                        "fct": `${util.featureDetails.name} - initialize`,
                        "msg": "Can't bind refresh event on",
                        "err": e,
                        "featureDetails": util.featureDetails
                    } );
                }

                /* Used to set a refresh via json configuration */
                if ( configJSON.refresh > 0 ) {
                    let bidaRefresh = setInterval( function () {
                        if ( $( container ).length === 0 ) {
                            clearInterval( bidaRefresh );
                        } else {
                            apex.debug.info( {
                                "fct": `${util.featureDetails.name} - initialize`,
                                "msg": "Refresh by time was fired",
                                "featureDetails": util.featureDetails
                            } );
                            getData( pLoadingMethod, configJSON, true );
                        }
                    }, configJSON.refresh * 1000 );
                }
            } else {
                apex.debug.error( {
                    "fct": `${util.featureDetails.name} - initialize`,
                    "msg": "Can't find pRegionID: " + pRegionID,
                    "featureDetails": util.featureDetails
                } );
            }

            /***********************************************************************
             **
             ** function to get data from APEX
             **
             ***********************************************************************/
            function getData( pLoadingMethod, pDefaultConfig, pIsRefresh ) {
                if ( pIsRefresh ) {
                    util.loader.start( loaderSel );
                    asyncAjaxReference += 1;
                }
                const submitItems = pDefaultConfig.items2Submit;

                function onSyncError( pData ) {
                    $( containerIDSel ).empty();
                    $( containerIDSel ).addClass( "bida-container-nodat" );
                    util.errorMessage.show( containerIDSel, pDefaultConfig.errorMessage );
                    util.loader.stop( loaderSel );
                    if ( pData.responseText ) {
                        apex.debug.error( {
                            "fct": `${util.featureDetails.name} - getData`,
                            "msg": pData.responseText,
                            "featureDetails": util.featureDetails
                        } );
                    }
                }

                /* call APEX server */
                apex.server.plugin(
                    pAjaxID, {
                        pageItems: submitItems,
                        x01: 'items',
                    }, {
                        success: function ( pData ) {
                            drawGridItems( pData, pDefaultConfig );
                            if ( pIsRefresh ) {
                                container.trigger( "refreshed" );
                            }
                        },
                        error: function ( pData ) {
                            onSyncError( pData );
                            if ( pIsRefresh ) {
                                container.trigger( "refreshed" );
                            }
                        },
                        dataType: "json"
                    } );
            }

            /***********************************************************************
             **
             ** Used to draw chart columns
             **
             ***********************************************************************/
            function drawGridItems( pAjaxResponse, pDefaultConfig ) {
                apex.debug.info( {
                    "fct": `${util.featureDetails.name} - drawGridItems`,
                    "ajaxResponse": pAjaxResponse,
                    "featureDetails": util.featureDetails
                } );
            
                /* empty container for new stuff */
                container.empty();

                const sizer = $( "<div></div>" )
                    .addClass( "bida-container-sizer" )
                    .addClass( regionSizerID )
                    .attr( "id", regionSizerID );
                container.append( sizer );

                const resizeObserver = new ResizeObserver( util.debounce( function() {
                    if ( !document.hidden && sizer.is( ":visible" ) ) {
                        container.trigger( "resize" );
                    }
                } ) );

                container.on( "resize", function() {
                    masonryAPI.resizeMasonry();
                } );

                resizeObserver.observe( sizer[0] );

                /* reset all timers */
                if ( timers.outerItemIntervals && timers.outerItemIntervals.length > 0 ) {
                    $.each( timers.outerItemIntervals, function ( i, d ) {
                        clearInterval( d );
                    } );
                }
                timers.outerItemIntervals = [];

                if ( timers.innerItemsIntervals ) {
                    $.each( timers.innerItemsIntervals, function ( key, val ) {
                        clearInterval( val );
                    } );
                }
                timers.innerItemsIntervals = {};

                if ( timers.d3Timer && timers.d3Timer.length > 0 ) {
                    $.each( timers.d3Timer, function ( i, d ) {
                        d.stop();
                    } );
                }
                timers.d3Timer = [];

                /* check data and define grid cols */
                if ( pAjaxResponse.items && pAjaxResponse.items.length > 0 ) {
                    container.removeClass( "bida-container-nodat" );

                    /* for each grid item */
                    $.each( pAjaxResponse.items, function ( idx, ajaxItems ) {
                        let itemWidth = pDefaultConfig.colSpan;
                        if ( ajaxItems.colSpan ) {
                            itemWidth = ajaxItems.colSpan;
                        }

                        /* draw each chart in a col */
                        drawItemRegion( idx, itemWidth, container, ajaxItems, pDefaultConfig );
                    } );

                    if ( pDefaultConfig.footprint ) {
                        addCFooter( container );
                    }

                    masonryAPI.initMasonry();

                    /* add sortable option if set */
                    let clone;

                    const sortableJSON = {
                        delay: 50,
                        zIndex: 10,
                        items: ".bida-container-item",
                        grid: [10, 10],
                        tolerance: "pointer",
                        start: function ( event, ui ) {
                            if ( !clone ) {
                                clone = $( ui.item ).clone();
                                $( "body" ).append( clone );
                            }
                            $( ui.item ).hide();
                            clone.fadeIn();
                            clone.css( "opacity", "0.5" );
                            clone.css( "filter", "grayscale(100%)" );
                        },
                        sort: function ( event, ui ) {
                            clone.css( "left", ui.offset.left );
                            clone.css( "top", ui.offset.top );
                        },
                        change: function ( event, ui ) {
                            /* reinit masonry */
                            container.find( ".ui-sortable-placeholder" ).each( function ( i, item ) {
                                $( item ).css( "visibility", "visible" );
                            } );
                            $( ui.item ).css( "left", ui.position.left );
                            $( ui.item ).css( "top", ui.position.top );
                            masonryAPI.initMasonry();
                        },
                        stop: function ( event, ui ) {
                            clone.remove();
                            clone = "";
                            $( ui.item ).show();
                            masonryAPI.initMasonry();
                        },
                        update: function () {
                            /* trigger event to region with new item order */
                            const arr = [];
                            container.find( ".bida-container-item" ).each( function ( i, item ) {
                                const orderID = $( item ).attr( "item-id" );
                                arr.push( orderID );
                            } );
                            apex.debug.info( {
                                "fct": `${util.featureDetails.name} - drawGridItems`,
                                "sortInfo": arr,
                                "featureDetails": util.featureDetails
                            } );
                            container.trigger( "sortorder", arr.join( ":" ) );
                        }
                    };

                    let sortable;
                    /* used to set sortable on load or by trigger */
                    if ( pDefaultConfig.isSortable ) {
                        sortable = container.sortable( sortableJSON );
                    }

                    /* enable or disable sort on runtime */
                    $( loaderSel ).on( "sortableOn", function () {
                        apex.debug.info( {
                            "fct": `${util.featureDetails.name} - drawGridItems`,
                            "msg": "sortable on by trigger",
                            "featureDetails": util.featureDetails
                        } );
                        if ( !sortable ) {
                            container.sortable( sortableJSON );
                        }
                        container.sortable( "enable" );
                    } );
                    $( loaderSel ).on( "sortableOff", function () {
                        apex.debug.info( {
                            "fct": `${util.featureDetails.name} - drawGridItems`,
                            "msg": "sortable off by trigger",
                            "featureDetails": util.featureDetails
                        } );
                        container.sortable( "disable" );
                    } );

                } else {
                    /* if no data found draw no data message */
                    container.addClass( "bida-container-nodat" );
                    util.noDataMessage.show( container, pDefaultConfig.noDataMessage );
                }

                util.loader.stop( loaderSel );
                container.trigger( "rendered" );
                apex.debug.info( {
                    "fct": `${util.featureDetails.name} - drawGridItems`,
                    "msg": "Material BI Dashboard rendering finished",
                    "featureDetails": util.featureDetails
                } );
            }

            /***********************************************************************
             **
             ** Used to draw one item column
             **
             ***********************************************************************/
            function drawItemRegion( pitemIdx, pItemWidth, pParent, pAjaxItems, pDefaultConfig ) {

                // create new objet of data
                const thisAjaxItems = util.jsonSaveExtend( null, pAjaxItems ),
                      itemRegionID = pRegionID + "--" + pitemIdx,
                      itemRegionIDSel = "#" + itemRegionID,
                      // calc item height (currently min height) 
                      itemHeight = ( pAjaxItems.height || pDefaultConfig.height ) - sizeCorrection;

                // define new column for rows
                const col = $( "<div></div>" );
                col.attr( "id", itemRegionID );
                col.attr( "item-id", pAjaxItems.itemID );
                col.addClass( "bida-container-item" );
                col.addClass( pRegionID + "-item" );
                col.addClass( "bida-container-item--width" + pItemWidth );
                col.css( "min-height", itemHeight );
                col.css( "background", pAjaxItems.backColor || pDefaultConfig.backColor );
                col.css( "color", pAjaxItems.color || pDefaultConfig.color );
                col.css( "box-shadow", pAjaxItems.boxShadow || pDefaultConfig.boxShadow );

                // add item id to item div
                if ( util.isDefinedAndNotNull( pAjaxItems.itemID ) ) {
                    col.attr( "item-id", pAjaxItems.itemID );
                    col.addClass( pRegionIDRefresh + "--" + pAjaxItems.itemID );
                }

                pParent.append( col );

                /* pre pare col content and draw items itself */
                prepareItemContent( pitemIdx, itemHeight, itemRegionIDSel, thisAjaxItems, pDefaultConfig );

                const isAsync = setObjectParameter( pAjaxItems.isAsync, false, true );
                /* Used to set a refresh of the item */
                if ( pLoadingMethod === "A" && isAsync ) {
                    $( col ).on( "itemrefresh", function () {
                        /* clear item data to set loading of data */
                        pAjaxItems.itemData = null;
                        prepareItemContent( pitemIdx, itemHeight, itemRegionIDSel, pAjaxItems, pDefaultConfig, true );
                    } );

                    if ( pAjaxItems.refresh > 0 ) {
                        const itemTimer = setInterval( function () {
                            if ( $( itemRegionIDSel ).length === 0 ) {
                                clearInterval( itemTimer );
                            } else {
                                /* clear item data to set loading of data */
                                pAjaxItems.itemData = null;
                                prepareItemContent( pitemIdx, itemHeight, itemRegionIDSel, pAjaxItems, pDefaultConfig, true );
                            }
                        }, pAjaxItems.refresh * 1000 );

                        timers.outerItemIntervals.push( itemTimer );
                    }
                }
            }

            /***********************************************************************
             **
             ** Used to handle loading method, draw title and handle region height
             **
             ***********************************************************************/
            function prepareItemContent( pitemIdx, pItemHeight, pItemSel, pAjaxItems, pDefaultConfig, pIsRefresh ) {

                const div = $( pItemSel ),
                      loaderWaitTime = 100;

                let itemHeight = pItemHeight;

                function addLoader() {
                    /* workaround to fix wrong loader position*/
                    setTimeout( function () {
                        util.loader.start( pItemSel );
                    }, loaderWaitTime );
                }

                function stopLoader() {
                    util.loader.stop( pItemSel );
                    /* workaround if ajax is faster then wait of loader to fix wrong loader position */
                    setTimeout( function () {
                        util.loader.stop( pItemSel );
                    }, loaderWaitTime );
                }

                const isAsync = setObjectParameter( pAjaxItems.isAsync, false, true );
                /* if item data is empty and async mode is on then load data async for the item */
                if ( pIsRefresh || ( pLoadingMethod === "A" && isAsync ) ) {
                    if ( util.isDefinedAndNotNull( pAjaxItems.itemID ) ) {

                        const submitItems = pDefaultConfig.items2Submit;

                        /* what todo when asnyc data load is successful */
                        const onAsyncSuccess = function ( pAsyncAjaxItems ) {
                            /* merge sync json data with async json data if something is missing */
                            const newAsyncAjaxItems = util.jsonSaveExtend( pAjaxItems, pAsyncAjaxItems );
                            /* clear the item maybe this clear should be replaced with update */
                            div.empty();

                            /* add item id to item div */
                            if ( util.isDefinedAndNotNull( newAsyncAjaxItems.itemID ) ) {
                                div.attr( "item-id", newAsyncAjaxItems.itemID );
                            }

                            /* set region height if height has changed */
                            itemHeight = ( newAsyncAjaxItems.height || pDefaultConfig.height ) - sizeCorrection;

                            /* draw region content */
                            div.css( "min-height", itemHeight );
                            drawItemRegionContent( pitemIdx, pItemSel, itemHeight, newAsyncAjaxItems, pDefaultConfig );

                            stopLoader();

                            /* update masonry if layout changed */
                            masonryAPI.resizeMasonry();
                        };

                        /* what todo when async data load has error */
                        const onAsyncError = function ( pData ) {
                            div.empty();
                            if ( pData.status && pData.status === 404 ) {
                                util.noDataMessage.show( pItemSel, pDefaultConfig.noDataMessage );
                            } else {
                                util.errorMessage.show( pItemSel, pDefaultConfig.errorMessage );
                                apex.debug.error( {
                                    "msg": "Error occured in PL/SQL Block for async Loading of Data",
                                    "data": pData,
                                    "featureDetails": util.featureDetails
                                } );
                            }

                            stopLoader();

                            /* update masonry if layout changed */
                            masonryAPI.resizeMasonry();
                        };

                        addLoader();

                        apex.server.plugin(
                            pAjaxID, {
                                pageItems: submitItems,
                                x01: 'itemData',
                                x02: pAjaxItems.itemID,
                                x04: asyncAjaxReference
                            }, {
                                success: function ( pData, pMethod, pRequest ) {
                                    apex.debug.info( {
                                        "fct": `${util.featureDetails.name} - prepareItemContent`,
                                        "asyncAjaxReference": asyncAjaxReference,
                                        "pData": pData,
                                        "featureDetails": util.featureDetails
                                    } );

                                    if ( parseInt( pRequest.getResponseHeader( "ajax-reference" ), 10 ) === asyncAjaxReference ) {
                                        onAsyncSuccess( pData );
                                    } else {
                                        apex.debug.info( {
                                            "fct": `${util.featureDetails.name} - prepareItemContent`,
                                            "msg": "Expired Async AJAX Call returned.",
                                            "pData": pData,
                                            "featureDetails": util.featureDetails
                                        } );
                                    }
                                },
                                error: function ( pData ) {
                                    onAsyncError( pData );
                                },
                                dataType: "json"
                            } );
                    } else {
                        div.empty();
                        util.errorMessage.show( pItemSel, pDefaultConfig.errorMessage );
                        apex.debug.error( {
                            "fct": `${util.featureDetails.name} - prepareItemContent`,
                            "msg": "itemID missing in JSON for async load!",
                            "featureDetails": util.featureDetails
                        } );
                    }
                } else {
                    /* draw content for sync items */
                    drawItemRegionContent( pitemIdx, pItemSel, itemHeight, pAjaxItems, pDefaultConfig );

                    /* update masonry if layout changed */
                    masonryAPI.resizeMasonry();
                }
            }

            /***********************************************************************
             **
             ** Used to subtexts
             **
             ***********************************************************************/
            function drawSubText( pPosition, pParent, pText, pDefaultConfig, pIsSafeItem ) {

                apex.debug.info( {
                    "fct": `${util.featureDetails.name} - drawSubText`,
                    "pPosition": pPosition,
                    "pParent": pParent,
                    "pText": pText,
                    "pDefaultConfig": pDefaultConfig,
                    "pIsSafeItem": pIsSafeItem,
                    "featureDetails": util.featureDetails
                } );

                const subtextClass = "bida-item-subtext-" + pPosition,
                      subtextExists = $( pParent ).find( "." + subtextClass );

                let subtext = $( "<div></div>" );

                if ( subtextExists[0] ) {
                    subtext = subtextExists;
                }

                subtext.addClass( subtextClass );

                const subtextText = $( "<span></span>" );
                subtextText.addClass( "bida-item-subtext-text" );
                subtextText.addClass( "bida-item-subtext-text-" + pPosition );
                subtextText.addClass( "truncate-text" );

                const subtextContent = escapeOrSanitizeHTML( pText, pDefaultConfig, pIsSafeItem, pRequireHTMLEscape );
                subtextText.html( subtextContent );
                subtext.html( subtextText );
                subtext.attr( "title", subtextText.text() );

                $( pParent ).append( subtext );
            }

            /***********************************************************************
             **
             ** Used to draw col region title
             **
             ***********************************************************************/
            function drawItemTitle( pParent, pText, pBackColor, pColor, pIcon, pIconColor, pDefaultConfig, pIsSafeItem ) {

                apex.debug.info( {
                    "fct": `${util.featureDetails.name} - drawItemTitle`,
                    "pText": pText,
                    "pBackColor": pBackColor,
                    "pColor": pColor,
                    "pParent": pParent,
                    "pIcon": pIcon,
                    "pIconColor": pIconColor,
                    "pDefaultConfig": pDefaultConfig,
                    "pIsSafeItem": pIsSafeItem,
                    "featureDetails": util.featureDetails
                } );

                const titleClass = "bida-item-title",
                      titleExists = $( pParent ).find( "." + titleClass );
                let title = $( "<div></div>" );

                if ( titleExists[0] ) {
                    title = titleExists;
                }

                title.addClass( titleClass );
                title.css( "background", pBackColor || pDefaultConfig.title.backColor );
                title.css( "color", pColor || pDefaultConfig.title.color );

                const titleText = $( "<span></span>" );
                titleText.addClass( "bida-item-title-text" );
                titleText.addClass( "truncate-text" );

                const titleContent = escapeOrSanitizeHTML( pText, pDefaultConfig, pIsSafeItem, pRequireHTMLEscape );
                titleText.html( titleContent );
                titleText.attr( "title", titleText.text() );
                title.html( titleText );

                /* add title icon */
                const icon = pIcon || pDefaultConfig.title.icon,
                      iconColor = pIconColor || pDefaultConfig.title.iconColor;
                if ( util.isDefinedAndNotNull( icon ) ) {
                    const faSrcString = "fa-",
                          titleIcon = $( "<i></i>" );
                    if ( icon.substr( 0, faSrcString.length ) === faSrcString ) {
                        titleIcon.addClass( "fa" );
                        titleIcon.addClass( icon );
                        titleIcon.css( "color", iconColor );
                    } else {
                        titleIcon.css( "background-image", "url(" + icon + ")" );
                    }

                    titleIcon.addClass( "bida-item-title-icon" );
                    titleText.prepend( titleIcon );
                }

                $( pParent ).prepend( title );
            }

            /***********************************************************************
             **
             ** used to get rest height of item without e.g. title
             **
             ***********************************************************************/
            function getRestHeight( pItemSel, pItemHeight ) {
                let ret = pItemHeight;

                $( pItemSel ).children( ".bida-item-title" ).each( function () {
                    ret = Math.floor( ret - $( this ).height() ) - 1;
                } );

                $( pItemSel ).children( ".bida-item-subtext-1" ).each( function () {
                    ret = Math.floor( ret - $( this ).height() ) - 1;
                } );

                $( pItemSel ).children( ".bida-item-subtext-2" ).each( function () {
                    ret = Math.floor( ret - $( this ).height() ) - 1;
                } );

                return ret;
            }

            /***********************************************************************
             **
             ** Used to draw one item column content
             **
             ***********************************************************************/
            function drawItemRegionContent( pitemIdx, pItemSel, pItemHeight, pAjaxItems, pDefaultConfig ) {
                const div = $( pItemSel ),
                      faSrcString = "fa-";

                let itemConfig;                

                if ( pAjaxItems.itemConfig ) {
                    itemConfig = pAjaxItems.itemConfig;
                } else {
                    itemConfig = {};
                }

                /* add options link if avail */
                if ( util.isDefinedAndNotNull( pAjaxItems.optionsLink ) ) {
                    const optionsLink = $( "<a></a>" );
                    optionsLink.addClass( "bida-item-options-link" );
                    optionsLink.attr( "href", pAjaxItems.optionsLink );
                    optionsLink.css( "background-color", pAjaxItems.optionsLinkBackColor || pDefaultConfig.optionsLink.backColor );

                    const optionsIcon = pAjaxItems.optionsLinkIcon || pDefaultConfig.optionsLink.icon,
                          optionsLinkIcon = $( "<i></i>" );

                    /* check if it should be an icon or a background image */
                    if ( util.isDefinedAndNotNull( optionsIcon ) && optionsIcon.substr( 0, faSrcString.length ) === faSrcString ) {
                        optionsLinkIcon.addClass( "fa" );
                        optionsLinkIcon.addClass( optionsIcon );
                        optionsLinkIcon.css( "color", pAjaxItems.optionsLinkColor || pDefaultConfig.optionsLink.color );
                    } else {
                        optionsLinkIcon.css( "background-image", "url(" + optionsIcon + ")" );
                    }

                    optionsLinkIcon.addClass( "bida-item-options-link-icon" );
                    optionsLink.append( optionsLinkIcon );
                    div.append( optionsLink );
                }

                if ( util.isDefinedAndNotNull( pAjaxItems.optionsLinkTop ) ) {
                    const optionsLinkTop = $( "<a></a>" );
                    optionsLinkTop.addClass( "bida-item-options-link-top" );
                    optionsLinkTop.attr( "href", pAjaxItems.optionsLinkTop );
                    optionsLinkTop.css( "background-color", pAjaxItems.optionsLinkTopBackColor || pDefaultConfig.optionsLinkTop.backColor );

                    const optionsIcon = pAjaxItems.optionsLinkTopIcon || pDefaultConfig.optionsLinkTop.icon,
                          optionsLinkTopIcon = $( "<i></i>" );

                    /* check if it should be an icon or a background image */
                    if ( util.isDefinedAndNotNull( optionsIcon ) && optionsIcon.substr( 0, faSrcString.length ) === faSrcString ) {
                        optionsLinkTopIcon.addClass( "fa" );
                        optionsLinkTopIcon.addClass( optionsIcon );
                        optionsLinkTopIcon.css( "color", pAjaxItems.optionsLinkTopColor || pDefaultConfig.optionsLinkTop.color );
                    } else {
                        optionsLinkTopIcon.css( "background-image", "url(" + optionsIcon + ")" );
                    }

                    optionsLinkTopIcon.addClass( "bida-item-options-link-icon" );
                    optionsLinkTop.append( optionsLinkTopIcon );
                    div.append( optionsLinkTop );
                }

                const marked = setObjectParameter( pAjaxItems.isMarked, false, true );
                div.removeClass( "bida-container-item-marked" );
                if ( marked ) {
                    div.addClass( "bida-container-item-marked" );
                }

                /* check item typ and call subfunctions that draw item types */
                if ( util.isDefinedAndNotNull( pAjaxItems.itemType ) ) {
                    let oversize = false;
                    if ( util.isDefinedAndNotNull( pAjaxItems.oversize ) ) {
                        oversize = setObjectParameter( pAjaxItems.oversize, false, true );
                    }

                    let isSafeItem = false;
                    if ( util.isDefinedAndNotNull( pAjaxItems.noSanitize ) ) {
                        isSafeItem = setObjectParameter( pAjaxItems.noSanitize, false, true );
                    }

                    let itemHeight = pItemHeight;

                    /* set title */
                    if ( util.isDefinedAndNotNull( pAjaxItems.title ) ) {
                        drawItemTitle( pItemSel, pAjaxItems.title, pAjaxItems.titleBackColor, pAjaxItems.titleColor, pAjaxItems.titleIcon, pAjaxItems.titleIconColor, pDefaultConfig, isSafeItem );

                    }

                    /* add item subtexts */
                    if ( util.isDefinedAndNotNull( pAjaxItems.subText1 ) ) {
                        drawSubText( 1, pItemSel, pAjaxItems.subText1, pDefaultConfig, isSafeItem );
                    }

                    if ( util.isDefinedAndNotNull( pAjaxItems.subText2 ) ) {
                        drawSubText( 2, pItemSel, pAjaxItems.subText2, pDefaultConfig, isSafeItem );
                    }

                    itemHeight = getRestHeight( pItemSel, pItemHeight );

                    /* when itemData is not set then no data found */
                    if ( util.isDefinedAndNotNull( pAjaxItems.itemData ) || pAjaxItems.itemType === "calendar" || pAjaxItems.itemType === "note" || pAjaxItems.itemType === "clock" ) {
                        apex.debug.info( {
                            "fct": `${util.featureDetails.name} - drawItemRegionContent`,
                            "msg": "Render Item " + pAjaxItems.itemType + "(" + pAjaxItems.title + ")",
                            "featureDetails": util.featureDetails
                        } );

                        /* check for item type and call handlers for this type */
                        switch ( pAjaxItems.itemType ) {
                        case "chart":
                            if ( $.inArray( "charts", pDefaultConfig.features ) > -1 ) {
                                /* prepare chartData maybe make a different function for this */
                                if ( pAjaxItems.itemData ) {
                                    drawChart( pItemSel, itemHeight, itemConfig, pAjaxItems.itemData, pDefaultConfig, isSafeItem );
                                } else {
                                    util.errorMessage.show( pItemSel, pDefaultConfig.errorMessage );
                                    apex.debug.error( {
                                        "fct": `${util.featureDetails.name} - drawItemRegionContent`,
                                        "msg": "itemData is missing in JSON",
                                        "featureDetails": util.featureDetails
                                    } );
                                }
                            } else {
                                util.errorMessage.show( pItemSel, pDefaultConfig.errorMessage );
                                apex.debug.info( {
                                    "fct": `${util.featureDetails.name} - drawItemRegionContent`,
                                    "msg": "Feature - Charts is not activated.",
                                    "featureDetails": util.featureDetails
                                } );
                            }
                            break;
                        case "calendarheatmap":
                            if ( $.inArray( "calendarheatmap", pDefaultConfig.features ) > -1 ) {
                                // prepare chartData maybe make a different function for this
                                if ( pAjaxItems.itemData ) {
                                    drawCalendarHeatmap( pItemSel, itemHeight, itemConfig, pAjaxItems.itemData, pDefaultConfig, isSafeItem );
                                } else {
                                    util.errorMessage.show( pItemSel, pDefaultConfig.errorMessage );
                                    apex.debug.error( {
                                        "fct": `${util.featureDetails.name} - drawItemRegionContent`,
                                        "msg": "itemData is missing in JSON",
                                        "featureDetails": util.featureDetails
                                    } );
                                }
                            } else {
                                util.errorMessage.show( pItemSel, pDefaultConfig.errorMessage );
                                apex.debug.info( {
                                    "fct": `${util.featureDetails.name} - drawItemRegionContent`,
                                    "msg": "Feature - Calendar Heatmap is not activated.",
                                    "featureDetails": util.featureDetails
                                } );
                            }
                            break;
                        case "html":
                            drawHTML( pItemSel, itemHeight, pAjaxItems.itemData, pAjaxItems.itemID, pDefaultConfig, oversize, isSafeItem );
                            break;
                        case "card":
                            drawCard( pitemIdx, itemHeight, pItemSel, pAjaxItems.itemData, pDefaultConfig, oversize, isSafeItem );
                            break;
                        case "badge":
                            drawBadges( pitemIdx, itemHeight, pItemSel, pAjaxItems.itemData, pDefaultConfig, isSafeItem );
                            break;
                        case "list":
                            drawList( pItemSel, itemHeight, pAjaxItems.itemData, pDefaultConfig, oversize, isSafeItem );
                            break;
                        case "table":
                            if ( $.inArray( "table", pDefaultConfig.features ) > -1 ) {
                                drawTable( pItemSel, itemHeight, pAjaxItems.itemData, pDefaultConfig, oversize, isSafeItem );
                            } else {
                                util.errorMessage.show( pItemSel, pDefaultConfig.errorMessage );
                                apex.debug.error( {
                                    "fct": `${util.featureDetails.name} - drawItemRegionContent`,
                                    "msg": "Feature - Tables is not activaed.",
                                    "featureDetails": util.featureDetails
                                } );
                            }
                            break;
                        case "map":
                            if ( $.inArray( "map", pDefaultConfig.features ) > -1 ) {
                                drawD3Map( pItemSel, itemHeight, pAjaxItems.itemData, itemConfig, pDefaultConfig, isSafeItem );
                            } else {
                                util.errorMessage.show( pItemSel, pDefaultConfig.errorMessage );
                                apex.debug.error( {
                                    "fct": `${util.featureDetails.name} - drawItemRegionContent`,
                                    "msg": "Feature - Maps is not activaed.",
                                    "featureDetails": util.featureDetails
                                } );
                            }
                            break;
                        case "clock":
                            if ( $.inArray( "clock", pDefaultConfig.features ) > -1 ) {
                                drawClock( pItemSel, itemHeight, pAjaxItems.itemData, itemConfig, pDefaultConfig );
                            } else {
                                util.errorMessage.show( pItemSel, pDefaultConfig.errorMessage );
                                apex.debug.error( {
                                    "fct": `${util.featureDetails.name} - drawItemRegionContent`,
                                    "msg": "Feature - Analogue Clocks is not activaed.",
                                    "featureDetails": util.featureDetails
                                } );
                            }
                            break;
                        case "calendar":
                            if ( $.inArray( "calendar", pDefaultConfig.features ) > -1 ) {
                                drawCalendar( pItemSel, itemHeight, pAjaxItems.itemData, itemConfig, pDefaultConfig, oversize, isSafeItem );
                            } else {
                                util.errorMessage.show( pItemSel, pDefaultConfig.errorMessage );
                                apex.debug.error( {
                                    "fct": `${util.featureDetails.name} - drawItemRegionContent`,
                                    "msg": "Feature - Calendar is not activaed.",
                                    "featureDetails": util.featureDetails
                                } );
                            }
                            break;
                        case "note":
                            if ( $.inArray( "note", pDefaultConfig.features ) > -1 ) {
                                drawNoteEditor( pAjaxItems.itemID, pItemSel, itemHeight, pAjaxItems.itemData, itemConfig, pDefaultConfig, oversize, isSafeItem );
                            } else {
                                util.errorMessage.show( pItemSel, pDefaultConfig.errorMessage );
                                apex.debug.error( {
                                    "fct": `${util.featureDetails.name} - drawItemRegionContent`,
                                    "msg": "Feature - Editor is not activaed.",
                                    "featureDetails": util.featureDetails
                                } );
                            }
                            break;
                        default:
                            util.errorMessage.show( pItemSel, pDefaultConfig.errorMessage );
                            apex.debug.error( {
                                "fct": `${util.featureDetails.name} - drawItemRegionContent`,
                                "msg": "itemType not found (html, card, list, map, table, clock, calendar, calendarheatmap)",
                                "featureDetails": util.featureDetails
                            } );
                        }
                    } else {
                        util.noDataMessage.show( pItemSel, pDefaultConfig.noDataMessage );
                    }

                    /* move item subtext to the end */
                    if ( util.isDefinedAndNotNull( pAjaxItems.subText2 ) ) {
                        const subText2 = $( pItemSel ).find( ".bida-item-subtext-2" );
                        subText2.appendTo( pItemSel );
                        subText2.addClass( "bida-item-subtext-2-fin" );
                    }

                } else {
                    util.errorMessage.show( pItemSel, pDefaultConfig.errorMessage );
                    apex.debug.error( {
                        "fct": `${util.featureDetails.name} - drawItemRegionContent`,
                        "msg": "itemType is missing in JSON",
                        "featureDetails": util.featureDetails
                    } );
                }
            }

            /***********************************************************************
             **
             ** function to render html and maybe a autoplaying slideshow
             **
             ***********************************************************************/
            function drawHTML( pItemSel, pItemHeight, pItemData, pItemID, pDefaultConfig, pOversize, pIsSafeItem ) {
                apex.debug.info( {
                    "fct": `${util.featureDetails.name} - drawHTML`,
                    "pItemSel": pItemSel,
                    "pItemHeight": pItemHeight,
                    "pItemData": pItemData,
                    "pDefaultConfig": pDefaultConfig,
                    "pOversize": pOversize,
                    "pIsSafeItem": pIsSafeItem,
                    "featureDetails": util.featureDetails
                } );

                const htmlDiv = $( "<div></div>" );
                htmlDiv.addClass( "bida-item-html" );

                /* function render the html also with sanitizer, escaping and unleash rte support */
                function renderHTML( pContent ) {
                    const content = escapeOrSanitizeHTML( pContent, pDefaultConfig, pIsSafeItem, pRequireHTMLEscape );

                    apex.debug.info( {
                        "fct": `${util.featureDetails.name} - drawHTML`,
                        "submodule": "renderHTML",
                        "pContent": pContent,
                        "contentAfterEscapeOrSanitize": content,
                        "featureDetails": util.featureDetails
                    } );

                    htmlDiv.html( content );
                    /* option to show images that where put into html with unleash rte plugin */
                    if ( $.inArray( "inlineimagesdownload", pDefaultConfig.features ) > -1 ) {
                        const imgItems = htmlDiv.find( 'img[alt*="aih#"]' );
                        $.each( imgItems, function ( idx, imgItem ) {
                            let pk = imgItem.title;
                            if ( !pk ) {
                                pk = imgItem.alt.split( "aih##" )[1];
                            }
                            if ( pk ) {
                                apex.debug.info( {
                                    "fct": `${util.featureDetails.name} - drawHTML`,
                                    "pItemID": pItemID,
                                    "pk": pk,
                                    "featureDetails": util.featureDetails
                                } );

                                const submitItems = pDefaultConfig.items2SubmitImg,
                                      imgSRC = apex.server.pluginUrl( pAjaxID, {
                                          x01: "imageDownload",
                                          x02: pItemID,
                                          x03: pk,
                                          pageItems: submitItems
                                      } );
                                imgItem.src = imgSRC;
                                $( imgItem ).addClass( "bida-item-urte-img" );
                            }
                        } );
                    }

                    /* force sub elements not to break out of the region*/
                    htmlDiv
                        .find( "*" )
                        .css( "max-width", "100%" )
                        .css( "overflow-wrap", "break-word" )
                        .css( "word-wrap", "break-word" )
                        .css( "-ms-hyphens", "auto" )
                        .css( "-moz-hyphens", "auto" )
                        .css( "-webkit-hyphens", "auto" )
                        .css( "hyphens", "auto" )
                        .css( "white-space", "normal" );
                    htmlDiv
                        .find( "img" )
                        .css( "object-fit", "contain" )
                        .css( "object-position", "50% 0%" );
                }

                /* if pItemData is an array ofobjects then make a slideshow */
                if ( pItemData && typeof pItemData === "object" && pItemData.length > 1 ) {
                    let htmlIDX = 0;
                    let timeOut;

                    const prepareHTMLRender = function() {
                        if ( htmlIDX > ( pItemData.length - 1 ) ) {
                            htmlIDX = 0;
                        } else if ( htmlIDX < 0 ) {
                            htmlIDX = pItemData.length - 1;
                        }

                        if ( pItemData[htmlIDX] ) {
                            renderHTML( pItemData[htmlIDX].html );

                            /* make it auto play when duration is set */
                            const cur = pItemData[htmlIDX];
                            const dur = cur.duration;
                            if ( dur && dur > 0 ) {
                                const setTimeOut = function() {
                                    timeOut = setTimeout( function () {
                                        htmlIDX += 1;
                                        $( htmlDiv ).fadeOut( "slow", function () {
                                            prepareHTMLRender();
                                            $( htmlDiv ).fadeIn( "slow" );
                                        } );
                                    }, dur * 1000 );
                                };

                                $( pItemSel ).hover( function () {
                                    clearTimeout( timeOut );
                                } );

                                $( pItemSel ).mouseleave( function () {
                                    setTimeOut();
                                } );

                                setTimeOut();
                            }
                        }
                    };

                    /* go to next img */
                    const goDown = function() {
                        htmlIDX += 1;
                        clearTimeout( timeOut );
                        $( htmlDiv ).fadeOut( "fast", function () {
                            prepareHTMLRender();
                            $( htmlDiv ).fadeIn( "fast" );
                        } );
                    };

                    /* go to previous img */
                    const goUp = function() {
                        htmlIDX-= 1;
                        clearTimeout( timeOut );
                        $( htmlDiv ).fadeOut( "fast", function () {
                            prepareHTMLRender();
                            $( htmlDiv ).fadeIn( "fast" );
                        } );
                    };

                    /* add control buttons for slide */
                    const leftControl = $( "<div></div>" );
                    leftControl.addClass( "bida-item-html-slide-lc" );
                    leftControl.on( "click", function () {
                        goUp();
                    } );

                    const leftControlIcon = $( "<span></span>" );
                    leftControlIcon.addClass( "fa fa-chevron-left fa-lg" );
                    leftControlIcon.addClass( "bida-item-html-slide-lc-s" );
                    leftControl.append( leftControlIcon );

                    $( pItemSel ).append( leftControl );

                    const rightControl = $( "<div></div>" );
                    rightControl.addClass( "bida-item-html-slide-rc" );
                    rightControl.on( "click", function () {
                        goDown();
                    } );

                    const rightControlIcon = $( "<span></span>" );
                    rightControlIcon.addClass( "fa fa-chevron-right fa-lg" );
                    rightControlIcon.addClass( "bida-item-html-slide-rc-s" );
                    rightControl.append( rightControlIcon );

                    $( pItemSel ).append( rightControl );

                    prepareHTMLRender();

                } else if ( pItemData && typeof pItemData === "object" && pItemData.length === 1 ) {
                    /* if only one object then render no slide */

                    if ( util.isDefinedAndNotNull( pItemData[0].html ) && pItemData[0].html !== "" ) {
                        renderHTML( pItemData[0].html );
                    } else {
                        util.noDataMessage.show( htmlDiv, pDefaultConfig.noDataMessage );
                    }
                } else {
                    /* else render just html */
                    if ( util.isDefinedAndNotNull( pItemData ) && pItemData !== "" ) {
                        renderHTML( pItemData );
                    } else {
                        util.noDataMessage.show( htmlDiv, pDefaultConfig.noDataMessage );
                    }
                }

                $( pItemSel ).append( htmlDiv );

                if ( pOversize !== true ) {
                    htmlDiv.css( "height", pItemHeight );
                    overFlowStyling( htmlDiv );
                }
            }

            /***********************************************************************
             **
             ** function to make overflow styling
             **
             ***********************************************************************/
            function overFlowStyling( pEl ) {
                const el = $( pEl );
                el.addClass( "bida-item-div-overflow" );
                el.on( 'scroll', function () {
                    if ( el.scrollTop() + el.innerHeight() >= el[0].scrollHeight ) {
                        el.addClass( "bida-item-div-overflow-hidden" );
                    } else {
                        el.removeClass( "bida-item-div-overflow-hidden" );
                    }
                } );

                const innerHeight = el.innerHeight(),
                      scrollHeight = el[0].scrollHeight;

                apex.debug.info( {
                    "fct": `${util.featureDetails.name} - overFlowStyling`,
                    "innerHeight": innerHeight,
                    "scrollHeight": scrollHeight,
                    "featureDetails": util.featureDetails
                } );

                if ( innerHeight >= scrollHeight && scrollHeight !== 0 ) {
                    el.addClass( "bida-item-div-overflow-hidden" );
                }
            }

            /***********************************************************************
             **
             ** function to render table
             **
             ***********************************************************************/
            function drawTable( pItemSel, pItemHeight, pItemData, pDefaultConfig, pOversize, pIsSafeItem ) {
                apex.debug.info( {
                    "fct": `${util.featureDetails.name} - drawTable`,
                    "pItemSel": pItemSel,
                    "pItemHeight": pItemHeight,
                    "pItemData": pItemData,
                    "pDefaultConfig": pDefaultConfig,
                    "pOversize": pOversize,
                    "pIsSafeItem": pIsSafeItem,
                    "featureDetails": util.featureDetails
                } );

                const tableDiv = $( "<div></div>" );
                tableDiv.addClass( "bida-item-table-div" );

                const table = $( "<table></table>" );
                table.addClass( "bida-item-table" );

                if ( util.isDefinedAndNotNull( pItemData.header ) && pItemData.header.length > 0 ) {
                    $.each( pItemData.header, function ( idx, headerData ) {
                        if ( util.isDefinedAndNotNull( headerData.text ) ) {
                            const header = $( "<th></th>" );
                            header.addClass( "bida-item-table-header" );
                            header.css( "background-color", headerData.background || pDefaultConfig.table.header.background );
                            header.css( "text-align", headerData.textAlign || pDefaultConfig.table.header.textAlign );
                            header.css( "color", headerData.color || pDefaultConfig.table.header.color );
                            header.css( "border", headerData.border || pDefaultConfig.table.header.border );

                            const content = escapeOrSanitizeHTML( headerData.text, pDefaultConfig, pIsSafeItem, pRequireHTMLEscape );
                            header.html( content );

                            table.append( header );
                        }
                    } );
                }

                if ( util.isDefinedAndNotNull( pItemData.data ) && pItemData.data.length > 0 ) {
                    $.each( pItemData.data, function ( idx, rowData ) {
                        const row = $( "<tr></tr>" );
                        row.addClass( "bida-item-table-row" );

                        if ( idx % 2 === 0 ) {
                            row.addClass( "bida-item-table-row-even" );
                            row.css( "background", pDefaultConfig.table.evenRow.background );
                            row.css( "text-align", pDefaultConfig.table.evenRow.textAlign );
                            row.css( "color", pDefaultConfig.table.evenRow.color );
                            row.css( "border-bottom", pDefaultConfig.table.evenRow.borderBottom );
                        } else {
                            row.addClass( "bida-item-table-row-odd" );
                            row.css( "background", pDefaultConfig.table.oddRow.background );
                            row.css( "text-align", pDefaultConfig.table.oddRow.textAlign );
                            row.css( "color", pDefaultConfig.table.oddRow.color );
                            row.css( "border-bottom", pDefaultConfig.table.oddRow.borderBottom );
                        }

                        $.each( rowData, function ( cIdx, cellData ) {
                            if ( util.isDefinedAndNotNull( cellData.text ) ) {
                                const cell = $( "<td></td>" );
                                cell.addClass( "bida-item-table-cell" );

                                cell.css( "background", cellData.background || pDefaultConfig.table.cells.background );
                                cell.css( "text-align", cellData.textAlign || pDefaultConfig.table.cells.textAlign );
                                cell.css( "color", cellData.color || pDefaultConfig.table.cells.color );
                                cell.css( "border", cellData.border || pDefaultConfig.table.cells.border );

                                const content = escapeOrSanitizeHTML( cellData.text, pDefaultConfig, pIsSafeItem, pRequireHTMLEscape );
                                cell.html( content );
                                row.append( cell );
                            }
                        } );

                        table.append( row );
                    } );
                }

                tableDiv.append( table );
                $( pItemSel ).append( tableDiv );

                if ( pOversize !== true ) {
                    tableDiv.css( "height", pItemHeight );
                    overFlowStyling( tableDiv );
                }
            }

            /***********************************************************************
             **
             ** function to render list
             **
             ***********************************************************************/
            function drawList( pItemSel, pItemHeight, pItemData, pDefaultConfig, pOversize, pIsSafeItem ) {

                apex.debug.info( {
                    "fct": `${util.featureDetails.name} - drawList`,
                    "pItemSel": pItemSel,
                    "pItemHeight": pItemHeight,
                    "pItemData": pItemData,
                    "pDefaultConfig": pDefaultConfig,
                    "pOversize": pOversize,
                    "pIsSafeItem": pIsSafeItem,
                    "featureDetails": util.featureDetails
                } );

                const list = $( "<div></div>" );
                list.addClass( "bida-item-list-div" );

                const ul = $( "<ul></ul>" );
                ul.addClass( "bida-item-list" );

                function drawGroupItems( pAddTo, pGroupData ) {
                    $.each( pGroupData, function ( i, listItem ) {
                        const li = $( "<li></li>" );
                        li.addClass( "bida-item-list-item" );

                        const listItemBody = $( "<div></div>" );
                        listItemBody.addClass( "list-item-content" );

                        /* add bottom border to all but the last */
                        if ( i < ( pGroupData.length - 1 ) ) {
                            listItemBody.css( "border-bottom", "1px solid #eeeeee" );
                        }

                        /* add icon to listItem header */
                        if ( util.isDefinedAndNotNull( listItem.icon ) || util.isDefinedAndNotNull( listItem.iconText ) ) {
                            const iconDiv = $( "<div></div>" );
                            iconDiv.addClass( "listItem-content-icon-div" );

                            const icon = $( "<span></span>" );
                            /* check if it should be an icon or a background image */
                            const faSrcString = "fa-";
                            if ( listItem.icon && listItem.icon.substr( 0, faSrcString.length ) === faSrcString ) {
                                icon.addClass( "fa " + listItem.icon );

                                const listItemStdStyle = 'hsl(' + ( i * 23 ) % 350 + ', 79%, 45%)';

                                icon.css( "background", listItem.iconBackColor || listItemStdStyle );
                            } else {
                                if ( util.isDefinedAndNotNull( listItem.iconText ) ) {
                                    const iconContent = escapeOrSanitizeHTML( listItem.iconText, pDefaultConfig, pIsSafeItem, pRequireHTMLEscape ),
                                          iconSpan = $( "<span></span>" );
                                    iconSpan.addClass( "list-item-content-icon-text" );
                                    iconSpan.html( iconContent );
                                    icon.append( iconSpan );
                                }
                                if ( util.isDefinedAndNotNull( listItem.icon ) ) {
                                    icon.css( "background-image", "url(" + listItem.icon + ")" );
                                }
                                icon.css( "background-color", listItem.iconBackColor );
                            }

                            icon.addClass( "list-item-content-icon" );

                            icon.css( "color", listItem.iconColor || 'white' );

                            iconDiv.append( icon );

                            listItemBody.append( iconDiv );
                        }

                        /* add text to list item */
                        const listItemBodyText = $( "<div></div>" );
                        listItemBodyText.addClass( "list-item-content-text" );
                        if ( util.isDefinedAndNotNull( listItem.icon ) ) {
                            listItemBodyText.css( "width", "calc(100% - 55px)" );
                        }

                        /* add title to body */
                        if ( util.isDefinedAndNotNull( listItem.title ) ) {
                            const listTitle = $( "<span></span>" );
                            listTitle.addClass( "list-item-title" );
                            listTitle.addClass( "truncate-text" );

                            const listTitleContent = escapeOrSanitizeHTML( listItem.title, pDefaultConfig, pIsSafeItem, pRequireHTMLEscape );
                            listTitle.html( listTitleContent );

                            listItemBodyText.append( listTitle );
                        }

                        /* add text to body */
                        if ( util.isDefinedAndNotNull( listItem.text ) ) {
                            const listText = $( "<span></span>" );
                            listText.addClass( "list-item-text" );

                            const listTextContent = escapeOrSanitizeHTML( listItem.text, pDefaultConfig, pIsSafeItem, pRequireHTMLEscape );
                            listText.html( listTextContent );

                            listItemBodyText.append( listText );
                        }

                        listItemBody.append( listItemBodyText );

                        li.append( listItemBody );

                        /* make list item linkable if link is available */
                        if ( util.isDefinedAndNotNull( listItem.link ) ) {
                            const a = $( "<a></a>" );
                            a.addClass( "bida-a" );
                            a.attr( "href", listItem.link );
                            a.append( li );

                            if ( util.isDefinedAndNotNull( listItem.linkTarget ) ) {
                                a.attr( "target", listItem.linkTarget );
                            }

                            pAddTo.append( a );
                        } else {
                            pAddTo.append( li );
                        }
                    } );
                }

                const noGroupsArr = [];
                $.each( pItemData, function ( i, listItem ) {
                    if ( !util.isDefinedAndNotNull( listItem.group ) ) {
                        noGroupsArr.push( listItem );
                    }
                } );
                const groupsArr = util.groupObjectArray( pItemData, "group" );

                apex.debug.info( {
                    "fct": `${util.featureDetails.name} - drawList`,
                    "noGroupsArr": noGroupsArr,
                    "groupsArr": groupsArr,
                    "featureDetails": util.featureDetails
                } );

                drawGroupItems( ul, noGroupsArr );

                $.each( groupsArr, function ( groupName, groupData ) {
                    const groupLi = $( "<li></li>" );
                    groupLi.addClass( "bida-item-list-item-group" );

                    let groupBackColor = "#f1f1f1";
                    if ( groupData[0].groupBackColor ) {
                        groupBackColor = groupData[0].groupBackColor;
                    }
                    let groupColor = "inherit";
                    if ( groupData[0].groupColor ) {
                        groupColor = groupData[0].groupColor;
                    }

                    const groupBody = $( "<div></div>" );
                    groupBody.addClass( "list-group-content" );
                    groupBody.css( "border-left", "3px solid " + groupBackColor );

                    const groupSpan = $( "<span></span>" );
                    groupSpan.addClass( "list-group-content-title" );
                    const groupTitle = escapeOrSanitizeHTML( groupName, pDefaultConfig, pIsSafeItem, pRequireHTMLEscape );
                    groupSpan.css( "background", groupBackColor );
                    groupSpan.css( "color", groupColor );

                    groupSpan.html( groupTitle );
                    groupBody.append( groupSpan );
                    groupLi.append( groupBody );

                    const groupBodySubUl = $( "<ul></ul>" );
                    groupBodySubUl.addClass( "bida-item-list-grouped" );

                    drawGroupItems( groupBodySubUl, groupData );
                    groupBody.append( groupBodySubUl );
                    ul.append( groupLi );
                } );

                list.append( ul );
                $( pItemSel ).append( list );

                if ( pOversize !== true ) {
                    list.css( "height", pItemHeight );
                    overFlowStyling( list );
                }
            }

            /***********************************************************************
             **
             ** function to render kpi badges
             **
             ***********************************************************************/
            function drawBadges( pIndex, pItemHeight, pItemSel, pItemData, pDefaultConfig, pIsSafeItem ) {

                apex.debug.info( {
                    "fct": `${util.featureDetails.name} - drawBadges`,
                    "pIndex": pIndex,
                    "pItemHeight": pItemHeight,
                    "pItemSel": pItemSel,
                    "pItemData": pItemData,
                    "pDefaultConfig": pDefaultConfig,
                    "pIsSafeItem": pIsSafeItem,
                    "featureDetails": util.featureDetails
                } );

                const faSrcString = "fa-",
                      stdFontColor = 'hsl(' + ( pIndex * 23 ) % 350 + ', 79%, 45%)';

                let spanIcon,
                    spanTitle, 
                    spanValue,
                    cnt = 0,
                    lnHeightFactor = 0.98,
                    factorValue = 0.28,
                    isImage = false,
                    factorTitle = 0.15,
                    factorTitleValueDiff = factorValue - factorTitle,
                    factorIcon = 0.28;

                const badgeDiv = $( "<div></div>" );
                badgeDiv.addClass( "bida-item-badge" );

                if ( util.isDefinedAndNotNull( pItemData.title ) ) {
                    cnt +=1;
                }
                if ( util.isDefinedAndNotNull( pItemData.icon ) ) {
                    cnt += 1;
                }
                if ( util.isDefinedAndNotNull( pItemData.value ) ) {
                    cnt += 1;
                }

                if ( cnt > 0 ) {
                    lnHeightFactor = lnHeightFactor / cnt;
                    factorTitleValueDiff = factorTitleValueDiff / cnt;
                }

                // create title
                if ( util.isDefinedAndNotNull( pItemData.title ) ) {
                    const divTitle = $( "<div></div>" );
                    divTitle.addClass( "bida-item-badge-text" );

                    spanTitle = $( "<span></span>" );
                    spanTitle.css( "color", pItemData.titleColor || stdFontColor );

                    const title = escapeOrSanitizeHTML( pItemData.title, pDefaultConfig, pIsSafeItem, pRequireHTMLEscape );
                    spanTitle.html( title );
                    divTitle.append( spanTitle );
                    badgeDiv.append( divTitle );
                } else {
                    factorIcon += factorTitle / 2;
                    factorValue += factorTitle / 3;
                }

                // create icon
                if ( util.isDefinedAndNotNull( pItemData.icon ) ) {
                    const divIcon = $( "<div></div>" );
                    divIcon.addClass( "bida-item-badge-icon" );

                    spanIcon = $( "<span></span>" );

                    // check if it should be an icon or a background image 
                    if ( util.isDefinedAndNotNull( pItemData.icon ) && pItemData.icon.substr( 0, faSrcString.length ) === faSrcString ) {
                        spanIcon.addClass( "fa " + pItemData.icon );
                        spanIcon.css( "color", pItemData.iconColor || stdFontColor );
                    } else {
                        if ( util.isDefinedAndNotNull( pItemData.iconText ) ) {
                            const iconContent = escapeOrSanitizeHTML( pItemData.iconText, pDefaultConfig, pIsSafeItem, pRequireHTMLEscape );
                            spanIcon.html( iconContent );
                        }
                        if ( util.isDefinedAndNotNull( pItemData.icon ) ) {
                            isImage = true;
                            spanIcon.css( "background-image", "url(" + pItemData.icon + ")" );
                            spanIcon.addClass( "bida-item-badge-icon-image" );
                        }
                    }

                    divIcon.append( spanIcon );
                    badgeDiv.append( divIcon );
                } else {
                    factorTitle += factorIcon / 3;
                    factorValue += factorIcon / 3;
                }

                // create text value 
                if ( util.isDefinedAndNotNull( pItemData.value ) ) {
                    const divValue = $( "<div></div>" );
                    divValue.addClass( "bida-item-badge-text-value" );

                    spanValue = $( "<span></span>" );
                    spanValue.css( "color", pItemData.valueColor || stdFontColor );

                    const value = escapeOrSanitizeHTML( pItemData.value, pDefaultConfig, pIsSafeItem, pRequireHTMLEscape );
                    spanValue.html( value );

                    divValue.append( spanValue );
                    badgeDiv.append( divValue );
                } else {
                    factorTitle += factorValue / 3;
                    factorIcon += factorValue / 2;
                }

                if ( util.isDefinedAndNotNull( pItemData.link ) ) {
                    badgeDiv.css( "cursor", "pointer" );
                    badgeDiv.on( "click", function () {
                        util.link( pItemData.link, pItemData.linkTarget );
                    } );
                }

                function resize() {
                    const height = pItemHeight,
                          size = Math.min( height, badgeDiv.width() );
                    if ( spanTitle ) {
                        spanTitle.css( "font-size", ( size * factorTitle ) + "px" );
                        spanTitle.css( "line-height", ( height * ( lnHeightFactor - factorTitleValueDiff ) ) + "px" );
                    }
                    if ( spanIcon ) {
                        spanIcon.css( "font-size", size * factorIcon + "px" );
                        spanIcon.css( "line-height", height * lnHeightFactor + "px" );
                        if ( isImage ) {
                            spanIcon.css( "height", height * lnHeightFactor + "px" );
                            spanIcon.css( "width", height * lnHeightFactor + "px" );
                        }
                    }
                    if ( spanValue ) {
                        spanValue.css( "font-size", size * factorValue + "px" );
                        spanValue.css( "line-height", height * lnHeightFactor + "px" );
                    }
                }

                $( pItemSel ).append( badgeDiv );
                resize();

                container.on( "resize", function() {
                    resize();
                } );
            }

            /***********************************************************************
             **
             ** function to render kpi card
             **
             ***********************************************************************/
            function drawCard( pIndex, pItemHeight, pItemSel, pItemData, pDefaultConfig, pOversize, pIsSafeItem ) {

                apex.debug.info( {
                    "fct": `${util.featureDetails.name} - drawCard`,
                    "pIndex": pIndex,
                    "pItemHeight": pItemHeight,
                    "pItemSel": pItemSel,
                    "pItemData": pItemData,
                    "pDefaultConfig": pDefaultConfig,
                    "pOversize": pOversize,
                    "pIsSafeItem": pIsSafeItem,
                    "featureDetails": util.featureDetails
                } );

                /* define card */
                const card = $( "<div></div>" );
                card.addClass( "bida-item-card" );

                const cardBody = $( "<div></div>" );
                cardBody.addClass( "card-content" );

                /* add icon to card header */
                if ( util.isDefinedAndNotNull( pItemData.icon ) || util.isDefinedAndNotNull( pItemData.iconText ) ) {
                    const iconDiv = $( "<div></div>" );
                    iconDiv.addClass( "card-content-icon-div" );

                    const icon = $( "<span></span>" );

                    /* check if it should be an icon or a background image */
                    const faSrcString = "fa-";
                    if ( util.isDefinedAndNotNull( pItemData.icon ) && pItemData.icon.substr( 0, faSrcString.length ) === faSrcString ) {
                        icon.addClass( "fa " + pItemData.icon );

                        const cardStdStyle = 'hsl(' + ( pIndex * 23 ) % 350 + ', 79%, 45%)';
                        icon.css( "background", pItemData.iconBackColor || cardStdStyle );
                    } else {
                        if ( util.isDefinedAndNotNull( pItemData.iconText ) ) {
                            const iconContent = escapeOrSanitizeHTML( pItemData.iconText, pDefaultConfig, pIsSafeItem, pRequireHTMLEscape );
                            const iconSpan = $( "<span></span>" );
                            iconSpan.addClass( "card-content-icon-text" );
                            iconSpan.html( iconContent );
                            icon.append( iconSpan );
                        }
                        if ( util.isDefinedAndNotNull( pItemData.icon ) ) {
                            icon.css( "background-image", "url(" + pItemData.icon + ")" );
                        }
                        icon.css( "background-color", pItemData.iconBackColor );
                    }

                    icon.addClass( "card-content-icon" );
                    icon.css( "color", pItemData.iconColor || 'white' );

                    iconDiv.append( icon );

                    cardBody.append( iconDiv );
                }

                /* add value to body */
                const cardTitleDiv = $( "<div></div>" );
                cardTitleDiv.addClass( "card-title-div" );
                if ( util.isDefinedAndNotNull( pItemData.icon ) ) {
                    cardTitleDiv.css( "width", "calc(100% - 55px)" );
                }

                let cardTitle;

                if ( util.isDefinedAndNotNull( pItemData.value ) ) {
                    cardTitle = $( "<p></p>" );
                    cardTitle.addClass( "card-title" );
                    cardTitle.addClass( "truncate-text" );

                    const cardTitleContent = escapeOrSanitizeHTML( pItemData.value, pDefaultConfig, pIsSafeItem, pRequireHTMLEscape );
                    cardTitle.html( cardTitleContent );

                    cardTitleDiv.append( cardTitle );
                }

                if ( util.isDefinedAndNotNull( pItemData.valueSmall ) ) {
                    if ( util.isDefinedAndNotNull( pItemData.value ) ) {
                        cardTitle.css( "line-height", "30px" );
                    }

                    const cardSubTitle = $( "<p></p>" );
                    cardSubTitle.addClass( "card-sub-title" );

                    const cardSubTitleContent = escapeOrSanitizeHTML( pItemData.valueSmall, pDefaultConfig, pIsSafeItem, pRequireHTMLEscape );
                    cardSubTitle.html( cardSubTitleContent );

                    cardTitleDiv.append( cardSubTitle );
                }

                cardBody.append( cardTitleDiv );

                /* append body to card */
                card.append( cardBody );

                if ( util.isDefinedAndNotNull( pItemData.footer ) ) {
                    /* define footer */
                    const cardFooter = $( "<div></div>" );
                    cardFooter.addClass( "bida-card-footer" );

                    /* define footer text */
                    const cardFooterStats = $( "<div></div>" );
                    cardFooterStats.addClass( "stats" );

                    const cardFooterStatsContent = escapeOrSanitizeHTML( pItemData.footer, pDefaultConfig, pIsSafeItem, pRequireHTMLEscape );
                    cardFooterStats.html( cardFooterStatsContent );

                    /* add footer text to footer */
                    cardFooter.append( cardFooterStats );

                    /* add footer to card */
                    card.append( cardFooter );
                }

                /* add link to item if set */
                if ( util.isDefinedAndNotNull( pItemData.link ) ) {
                    const a = $( "<a></a>" );
                    a.addClass( "bida-a" );
                    a.attr( "href", pItemData.link );

                    if ( util.isDefinedAndNotNull( pItemData.linkTarget ) ) {
                        a.attr( "target", pItemData.linkTarget );
                    }

                    a.append( card );

                    $( pItemSel ).append( a );

                    if ( pOversize !== true ) {
                        a.css( "height", pItemHeight );
                        overFlowStyling( a );
                    }
                } else {
                    $( pItemSel ).append( card );

                    if ( pOversize !== true ) {
                        card.css( "height", pItemHeight );
                        overFlowStyling( card );
                    }
                }
            }

            /***********************************************************************
             **
             ** function to render chart
             **
             ***********************************************************************/
            function drawChart( pItemSel, pItemHeight, pConfigData, pValuesData, pDefaultConfig, pIsSafeItem ) {

                apex.debug.info( {
                    "fct": `${util.featureDetails.name} - drawChart`,
                    "pItemSel": pItemSel,
                    "pItemHeight": pItemHeight,
                    "pConfigData": pConfigData,
                    "pValuesData": pValuesData,
                    "pDefaultConfig": pDefaultConfig,
                    "pIsSafeItem": pIsSafeItem,
                    "featureDetails": util.featureDetails
                } );

                // eslint-disable-next-line no-undef
                const d3JS = d3;

                const aTypeCharts = ["pie", "donut", "gauge"],
                      specialStr = "\u200b",
                      seriesData = util.groupObjectArray( pValuesData, 'seriesID' );

                let isGauge = false,
                    isPie = false,
                    isDonut = false;

                // sort pValuesData by Time
                function sortArrByTime( pArr, pFormat ) {

                    function customeSort( pFirstValue, pSecondValue ) {
                        const parseTime = d3JS.timeParse( pFormat ),
                              fD = parseTime( pFirstValue.x ),
                              sD = parseTime( pSecondValue.x );
                        return new Date( fD ).getTime() - new Date( sD ).getTime();
                    }

                    try {
                        return pArr.sort( customeSort );
                    }
                    catch ( e ) {
                        apex.debug.error( {
                            "fct": `${util.featureDetails.name} - drawChart`,
                            "msg": "Error while try sort JSON Array by Time Value",
                            "err": e,
                            "featureDetails": util.featureDetails
                        } );
                    }
                }

                /* search link from data and set window.location.href */
                function executeLink( pData ) {
                    const key = specialStr + unescape( pData.id );
                    let index = pData.index;

                    if ( seriesData[key] ) {
                        const seriesObj = seriesData[key];
                        if ( seriesObj.length === 1 ) {
                            index = 0;
                        }

                        if ( seriesData[key][index] && seriesData[key][index].link ) {
                            util.link( seriesData[key][index].link, seriesData[key][index].linkTarget );
                        }
                    }
                }

                try {
                    const chartTitle = setObjectParameter( pConfigData.chartTitle, pDefaultConfig.d3JSchart.chartTitle || "" ).toString(),
                          background = setObjectParameter( pConfigData.background, pDefaultConfig.d3JSchart.background );
                    let backJSON = null,
                        ownTooltip = false;

                    if ( util.isDefinedAndNotNull( background ) ) {
                        backJSON = {
                            color: background
                        };
                    }

                    /* line */
                    const lineStep = setObjectParameter( pConfigData.lineStep, pDefaultConfig.d3JSchart.line.step );

                    /* gauge */
                    const gaugeMin = setObjectParameter( pConfigData.gaugeMin, pDefaultConfig.d3JSchart.gauge.min ),
                          gaugeMax = setObjectParameter( pConfigData.gaugeMax, pDefaultConfig.d3JSchart.gauge.max ),
                          gaugeType = setObjectParameter( pConfigData.gaugeType, pDefaultConfig.d3JSchart.gauge.type ),
                          gaugeWidth = setObjectParameter( pConfigData.gaugeWidth, pDefaultConfig.d3JSchart.gauge.width ),
                          gaugeArcMinWidth = setObjectParameter( pConfigData.gaugeArcMinWidth, pDefaultConfig.d3JSchart.gauge.arcMinWidth ),
                          gaugeFullCircle = setObjectParameter( pConfigData.gaugeFullCircle, pDefaultConfig.d3JSchart.gauge.fullCircle, true ),
                          gaugeAxisLabels = setObjectParameter( pConfigData.gaugeAxisLabels, pDefaultConfig.d3JSchart.gauge.axisLabels, true ),
                          gaugeTitle = setObjectParameter( pConfigData.gaugeTitle, pDefaultConfig.d3JSchart.gauge.title || "" ).toString();

                    /* Grid */
                    const gridX = setObjectParameter( pConfigData.gridX, pDefaultConfig.d3JSchart.grid.x, true ),
                          gridY = setObjectParameter( pConfigData.gridY, pDefaultConfig.d3JSchart.grid.y, true );

                    /* heights */
                    const heightXAxis = setObjectParameter( pConfigData.xAxisHeight, pDefaultConfig.d3JSchart.x.axisHeight );

                    /* Legend */
                    const legendShow = setObjectParameter( pConfigData.legendShow, pDefaultConfig.d3JSchart.legend.show, true ),
                          legendPosition = setObjectParameter( pConfigData.legendPosition, pDefaultConfig.d3JSchart.legend.position );

                    /* padding */
                    const chartPadding = util.jsonSaveExtend( null, pDefaultConfig.d3JSchart.padding );

                    if ( util.isDefinedAndNotNull( pConfigData.paddingBottom ) ) {
                        chartPadding.bottom = pConfigData.paddingBottom;
                    }

                    if ( util.isDefinedAndNotNull( pConfigData.paddingLeft ) ) {
                        chartPadding.left = pConfigData.paddingLeft;
                    }

                    if ( util.isDefinedAndNotNull( pConfigData.paddingRight ) ) {
                        chartPadding.right = pConfigData.paddingRight;
                    }

                    if ( util.isDefinedAndNotNull( pConfigData.paddingTop ) ) {
                        chartPadding.top = pConfigData.paddingTop;
                    }

                    /* Axis */
                    const rotateAxis = setObjectParameter( pConfigData.rotateAxis, pDefaultConfig.d3JSchart.rotateAxis, true ),
                          axisLabelPosition = setObjectParameter( pConfigData.axisLabelPosition, pDefaultConfig.d3JSchart.axisLabelPosition );

                    let xAxisLabelPosition = null,
                        yAxisLabelPosition = null;

                    switch ( axisLabelPosition ) {
                    case "inner1":
                        xAxisLabelPosition = "inner-left";
                        yAxisLabelPosition = "inner-bottom";
                        break;
                    case "inner2":
                        xAxisLabelPosition = "inner-center";
                        yAxisLabelPosition = "inner-middle";
                        break;
                    case "inner3":
                        xAxisLabelPosition = "inner-right";
                        yAxisLabelPosition = "inner-top";
                        break;
                    case "outer1":
                        xAxisLabelPosition = "outer-left";
                        yAxisLabelPosition = "outer-bottom";
                        break;
                    case "outer2":
                        xAxisLabelPosition = "outer-center";
                        yAxisLabelPosition = "outer-middle";
                        break;
                    case "outer3":
                        xAxisLabelPosition = "outer-right";
                        yAxisLabelPosition = "outer-top";
                        break;
                    default:
                        break;
                    }

                    if ( rotateAxis ) {
                        const xAxisLabelPositionTmp = xAxisLabelPosition;
                        xAxisLabelPosition = yAxisLabelPosition;
                        yAxisLabelPosition = xAxisLabelPositionTmp;
                    }

                    /* tooltip */
                    const tooltipShow = setObjectParameter( pConfigData.tooltipShow, pDefaultConfig.d3JSchart.tooltip.show, true ),
                          tooltipGrouped = setObjectParameter( pConfigData.tooltipGrouped, pDefaultConfig.d3JSchart.tooltip.grouped, true );

                    /* Transition duration */
                    const transitionDuration = setObjectParameter( pConfigData.transitionDuration || pDefaultConfig.d3JSchart.transitionDuration );

                    /* x Axis */
                    const xShow = setObjectParameter( pConfigData.xShow, pDefaultConfig.d3JSchart.x.show, true ),
                          xLabel = setObjectParameter( pConfigData.xLabel, pDefaultConfig.d3JSchart.x.label || "" ).toString();
                    let xType = setObjectParameter( pConfigData.xType, pDefaultConfig.d3JSchart.x.type ),
                        xAxisTimeFormat = null,
                        xName = null;

                    /* x ticks */
                    const xTickCutAfter = setObjectParameter( pConfigData.xTickCutAfter, pDefaultConfig.d3JSchart.x.tick.cutAfter ),
                          xTickMaxNumber = setObjectParameter( pConfigData.xTickMaxNumber, pDefaultConfig.d3JSchart.x.tick.maxNumber ),
                          xTickRotation = setObjectParameter( pConfigData.xTickRotation, pDefaultConfig.d3JSchart.x.tick.rotation ),
                          xTickMultiline = setObjectParameter( pConfigData.xTickMultiline, pDefaultConfig.d3JSchart.x.tick.multiline, true ),
                          xTickFit = setObjectParameter( pConfigData.xTickFit, pDefaultConfig.d3JSchart.x.tick.fit, true ),
                          xTickAutoRotate = setObjectParameter( pConfigData.xTickAutoRotate, pDefaultConfig.d3JSchart.x.tick.autoRotate, true );
                    let xTickTimeFormat = null;

                    if ( xType === "category" || xType === "timeseries" ) {
                        xName = "x";
                    }

                    if ( xType === "timeseries" ) {
                        xAxisTimeFormat = setObjectParameter( pConfigData.xTimeFormat, pDefaultConfig.d3JSchart.x.timeFormat );
                        xTickTimeFormat = setObjectParameter( pConfigData.xTickTimeFormat, pDefaultConfig.d3JSchart.x.tick.timeFormat );
                        // sort data because of tooltip index
                        sortArrByTime( pValuesData, xAxisTimeFormat );
                    }

                    /* cut string if category names are to long */
                    if ( xType === "category" ) {
                        xTickTimeFormat = function ( index, categoryName ) {
                            return util.cutString( categoryName, xTickCutAfter );
                        };
                    }

                    /* y Axis */
                    const yLabel = setObjectParameter( pConfigData.yLabel, pDefaultConfig.d3JSchart.y.label || "" ).toString(),
                          yLog = setObjectParameter( pConfigData.yLog, pDefaultConfig.d3JSchart.y.log, true );
                    let yType = null;
                    if ( yLog ) {
                        yType = "log";
                    }
                    const yMin = pConfigData.yMin || pDefaultConfig.d3JSchart.y.min,
                          yMax = pConfigData.yMax || pDefaultConfig.d3JSchart.y.max,
                          yCulling = pConfigData.yTickMaxNumber || pDefaultConfig.d3JSchart.y.tick.maxNumber,
                          yUnit = pConfigData.yUnit || pDefaultConfig.d3JSchart.y.unit;

                    /* y2 Axis */
                    const y2Label = setObjectParameter( pConfigData.y2Label, pDefaultConfig.d3JSchart.y2.label || "" ).toString(),
                          y2Log = setObjectParameter( pConfigData.y2Log, pDefaultConfig.d3JSchart.y2.log, true );
                    let y2Type = null,
                        y2Show = false;
                    if ( y2Log ) {
                        y2Type = "log";
                    }
                    const y2Min = setObjectParameter( pConfigData.y2Min, pDefaultConfig.d3JSchart.y2.min ),
                          y2Max = setObjectParameter( pConfigData.y2Max, pDefaultConfig.d3JSchart.y2.max ),
                          y2Culling = setObjectParameter( pConfigData.y2TickMaxNumber, pDefaultConfig.d3JSchart.y2.tick.maxNumber ),
                          y2Unit = setObjectParameter( pConfigData.y2Unit, pDefaultConfig.d3JSchart.y2.unit );

                    /* Zoom and Subchart */
                    const zoomType = setObjectParameter( pConfigData.zoomType, pDefaultConfig.d3JSchart.zoom.type );
                    let showSubChart = false,
                        zoomEnabled = setObjectParameter( pConfigData.zoomEnabled, pDefaultConfig.d3JSchart.zoom.enabled, true );

                    const charThreshold = setObjectParameter( pConfigData.threshold, pDefaultConfig.d3JSchart.threshold );

                    if ( zoomEnabled ) {
                        if ( zoomType === "scroll" ) {
                            showSubChart = false;
                        } else if ( zoomType === "subchart" ) {
                            showSubChart = true;
                            zoomEnabled = false;
                        } else if ( zoomType === "drag" ) {
                            zoomEnabled = true;
                            showSubChart = false;
                        }
                    } else {
                        showSubChart = false;
                    }

                    const zoomRescale = setObjectParameter( pConfigData.zoomRescale, pDefaultConfig.d3JSchart.zoom.rescale, true );

                    /* Prepare Data for Render */
                    const dataArr = [],
                          categoriesArr = [],
                          groupsArr = [],
                          colorsJSON = {},
                          typesJSON = {},
                          axesJSON = {},
                          namesJSON = {},
                          groupJSON = {},
                          xCatObj = util.groupObjectArray( pValuesData, "x" );

                    let seriesCnt = 0;

                    if ( seriesData ) {
                        /* Add Categories or time values to x Axis when correct type is set */
                        if ( xType === "category" || xType === "timeseries" ) {
                            categoriesArr.push( "x" );
                            const xCatArr = Object.keys( xCatObj );

                            $.each( xCatArr, function ( dIdx, dataValues ) {
                                categoriesArr.push( ( setObjectParameter( dataValues.replace( specialStr, "" ), null ) ) );
                            } );
                        }

                        dataArr.push( categoriesArr );

                        /* Transform data for billboard.js */
                        $.each( seriesData, function ( idx, seriesData ) {
                            let series;
                            seriesCnt += 1;
                            if ( seriesData[0] && seriesData[0].seriesID ) {
                                series = seriesData[0];
                                const dataKey = escape( series.seriesID );
                                colorsJSON[dataKey] = series.color;
                                typesJSON[dataKey] = series.type;

                                /* check if atypechart*/
                                if ( aTypeCharts.indexOf( series.type ) >= 0 ) {
                                    zoomEnabled = false;
                                }

                                if ( series.type === "gauge" ) {
                                    isGauge = true;
                                }

                                if ( series.type === "pie" ) {
                                    isPie = true;
                                }

                                if ( series.type === "donut" ) {
                                    isDonut = true;
                                }

                                if ( util.isDefinedAndNotNull( series.tooltip ) ) {
                                    ownTooltip = true;
                                }

                                axesJSON[dataKey] = ( series.yAxis || "y" );
                                if ( util.isDefinedAndNotNull( series.groupID ) ) {
                                    const groupID = escape( series.groupID.toString() );
                                    if ( groupJSON[groupID] ) {
                                        groupJSON[groupID].push( dataKey );
                                    } else {
                                        groupJSON[groupID] = [];
                                        groupJSON[groupID].push( dataKey );
                                    }
                                }

                                if ( series.yAxis === "y2" ) {
                                    y2Show = true;
                                }
                                namesJSON[dataKey] = ( setObjectParameter( series.label, dataKey ) );

                                const arr = [];
                                arr.push( dataKey );
                                if ( xType === "category" || xType === "timeseries" ) {
                                    $.each( xCatObj, function ( dIdx, dataValues ) {
                                        let setValueY = null,
                                            setValueZ = null;
                                        $.each( dataValues, function ( sIDx, sDataValues ) {
                                            if ( escape( sDataValues.seriesID ) === dataKey ) {
                                                setValueY = sDataValues.y;
                                                if ( sDataValues.z ) {
                                                    setValueZ = sDataValues.z;
                                                }
                                            }
                                        } );
                                        if ( setValueZ !== null ) {
                                            arr.push( {
                                                "y": setValueY,
                                                "z": setValueZ
                                            } );
                                        } else {
                                            arr.push( setValueY );
                                        }
                                    } );
                                } else {
                                    $.each( seriesData, function ( dIdx, dataValues ) {
                                        const setValueY = setObjectParameter( dataValues.y, null );
                                        if ( dataValues.z ) {
                                            const setValueZ = dataValues.z;
                                            arr.push( {
                                                "y": setValueY,
                                                "z": setValueZ
                                            } );
                                        } else {
                                            arr.push( setValueY );
                                        }
                                    } );
                                }

                                dataArr.push( arr );

                            } else {
                                util.errorMessage.show( pItemSel, pDefaultConfig.errorMessage );
                                apex.debug.error( {
                                    "fct": `${util.featureDetails.name} - drawChart`,
                                    "msg": "No seriesID found in seriesID Cursor",
                                    "featureDetails": util.featureDetails
                                } );
                            }

                        } );

                        /* Group JSON to Array */
                        $.each( groupJSON, function ( dIdx, jsonObj ) {
                            groupsArr.push( jsonObj );
                        } );

                        /* Labels and Datapoints */
                        let dataLabels = setObjectParameter( pConfigData.showDataLabels, pDefaultConfig.d3JSchart.showDataLabels, true );

                        if ( isPie || isDonut ) {
                            dataLabels = {
                                colors: "white"
                            };
                        } else if ( isGauge ) {
                            dataLabels = {
                                colors: ( gaugeType === "single" && seriesCnt > 1 ) ? "white" : null
                            };
                        }
                        const showDataPoints = setObjectParameter( pConfigData.showDataPoints, pDefaultConfig.d3JSchart.showDataPoints, true ),
                              showAbsoluteValues = setObjectParameter( pConfigData.showAbsoluteValues, pDefaultConfig.d3JSchart.showAbsoluteValues );
                        let absoluteFormatting;

                        if ( showAbsoluteValues ) {
                            absoluteFormatting = function ( value ) {
                                return value + yUnit;
                            };
                        }

                        let ttContent;
                        if ( ownTooltip ) {
                            ttContent = function ( d ) {
                                const div = $( "<div></div>" );
                                div.addClass( "bb-tooltip" );
                                div.addClass( "bida-chart-tooltip-custome" );
                                $.each( d, function ( i, pData ) {
                                    const key = specialStr + unescape( pData.id ),
                                          seriesObj = seriesData[key],
                                          index = pData.index;
                                    
                                    if ( seriesObj && seriesObj[index] && util.isDefinedAndNotNull( seriesObj[index].tooltip ) && util.isDefinedAndNotNull( pData.value ) ) {
                                        const subDiv = $( "<div>" ),
                                              ttS = escapeOrSanitizeHTML( seriesObj[index].tooltip, pDefaultConfig, pIsSafeItem, pRequireHTMLEscape );
                                        subDiv.append( ttS );
                                        div.append( subDiv );
                                    }
                                } );
                                return div[0].outerHTML;
                            };
                        }

                        try {
                            const chartContIDSel = pItemSel + "bbc",
                                  chartContID = chartContIDSel.replace( "#", "" ),
                                  chartCont = $( "<div></div>" );
                            chartCont.attr( "id", chartContID );

                            $( pItemSel ).append( chartCont );

                            const bbData = {
                                bindto: chartContIDSel,
                                background: backJSON,
                                title: {
                                    text: chartTitle
                                },
                                size: {
                                    height: pItemHeight
                                },
                                data: {
                                    x: xName,
                                    xFormat: xAxisTimeFormat,
                                    columns: dataArr,
                                    types: typesJSON,
                                    groups: groupsArr,
                                    colors: colorsJSON,
                                    labels: dataLabels,
                                    axes: axesJSON,
                                    names: namesJSON,
                                    onclick: function ( pData ) {
                                        executeLink( pData );
                                    }
                                },
                                pie: {
                                    label: {
                                        format: absoluteFormatting,
                                        threshold: charThreshold
                                    }
                                },
                                donut: {
                                    label: {
                                        format: absoluteFormatting,
                                        threshold: charThreshold
                                    }
                                },
                                line: {
                                    step: {
                                        type: lineStep
                                    }
                                },
                                gauge: {
                                    label: {
                                        format: absoluteFormatting,
                                        threshold: charThreshold,
                                        extents: function( d ) {
                                            return gaugeAxisLabels ? d : null;
                                        }
                                    },
                                    fullCircle: gaugeFullCircle,
                                    min: gaugeMin,
                                    max: gaugeMax,
                                    type: gaugeType,
                                    width: gaugeWidth,
                                    title: gaugeTitle,
                                    arc: {
                                        minWidth: gaugeArcMinWidth
                                    }
                                },
                                radar: {
                                    direction: {
                                        clockwise: true
                                    }
                                },
                                subchart: {
                                    show: showSubChart
                                },
                                zoom: {
                                    type: zoomType,
                                    enabled: zoomEnabled,
                                    rescale: zoomRescale
                                },
                                transition: {
                                    duration: transitionDuration
                                },
                                legend: {
                                    show: legendShow,
                                    position: legendPosition
                                },
                                tooltip: {
                                    show: tooltipShow,
                                    grouped: tooltipGrouped,
                                    contents: ttContent
                                },
                                grid: {
                                    x: {
                                        show: gridX,
                                    },
                                    y: {
                                        show: gridY
                                    }
                                },
                                point: {
                                    show: showDataPoints
                                },
                                axis: {
                                    rotated: rotateAxis,
                                    x: {
                                        show: xShow,
                                        label: {
                                            text: xLabel,
                                            position: xAxisLabelPosition
                                        },
                                        type: xType,
                                        tick: {
                                            culling: {
                                                max: xTickMaxNumber
                                            },
                                            autorotate: xTickAutoRotate,
                                            rotate: xTickRotation,
                                            multiline: xTickMultiline,
                                            format: xTickTimeFormat,
                                            fit: xTickFit
                                        },
                                        height: heightXAxis
                                    },
                                    y: {
                                        label: {
                                            text: yLabel,
                                            position: yAxisLabelPosition
                                        },
                                        type: yType,
                                        max: yMax,
                                        min: yMin,
                                        tick: {
                                            culling: {
                                                max: yCulling
                                            },
                                            format: function ( d ) {
                                                return d + yUnit;
                                            }
                                        }
                                    },
                                    y2: {
                                        show: y2Show,
                                        label: {
                                            text: y2Label,
                                            position: yAxisLabelPosition
                                        },
                                        type: y2Type,
                                        max: y2Max,
                                        min: y2Min,
                                        tick: {
                                            culling: {
                                                max: y2Culling
                                            },
                                            format: function ( d ) {
                                                return d + y2Unit;
                                            }
                                        }
                                    }
                                },
                                padding: chartPadding
                            };

                            apex.debug.info( {
                                "fct": `${util.featureDetails.name} - drawChart`,
                                "finalChartData": bbData,
                                "featureDetails": util.featureDetails
                            } );

                            // eslint-disable-next-line no-undef
                            const chart = bb.generate( bbData );

                            /* reset zoom on right click */
                            if ( zoomEnabled ) {
                                $( chartContIDSel ).contextmenu( function ( evt ) {
                                    evt.preventDefault();
                                    chart.unzoom();
                                } );
                            }

                            /* execute resize */
                            container.on( "resize", function() {
                                chart.resize( {
                                    height: pItemHeight
                                } );
                            } );

                        } catch ( e ) {
                            $( pItemSel ).empty();
                            util.errorMessage.show( pItemSel, pDefaultConfig.errorMessage );
                            apex.debug.error( {
                                "fct": `${util.featureDetails.name} - drawChart`,
                                "msg": "Error while try to render chart",
                                "err": e,
                                "featureDetails": util.featureDetails
                            } );
                        }
                    } else {
                        util.noDataMessage.show( pItemSel, pDefaultConfig.noDataMessage );
                    }
                } catch ( e ) {
                    $( pItemSel ).empty();
                    util.errorMessage.show( pItemSel, pDefaultConfig.errorMessage );
                    apex.debug.error( {
                        "fct": `${util.featureDetails.name} - drawChart`,
                        "msg": "Error while prepare data for chart",
                        "err": e,
                        "featureDetails": util.featureDetails
                    } );
                }
            }

            /***********************************************************************
             **
             ** function to render d3JS analog clock
             **
             ***********************************************************************/
            function drawClock( pItemSel, pItemHeight, pItemData, pItemConfig, pDefaultConfig ) {

                apex.debug.info( {
                    "fct": `${util.featureDetails.name} - drawClock`,
                    "pItemSel": pItemSel,
                    "pItemHeight": pItemHeight,
                    "pItemData": pItemData,
                    "pItemConfig": pItemConfig,
                    "pDefaultConfig": pDefaultConfig,
                    "featureDetails": util.featureDetails
                } );

                try {
                    // eslint-disable-next-line no-undef
                    const d3JS = d3;

                    const pCon = $( pItemSel ),
                          clockID = $( pItemSel ).attr( "id" ) + "-clock",
                          shadowID = $( pItemSel ).attr( "id" ) + "-shadow",
                          clockIDSel = "#" + clockID,
                          clockHandsID = $( pItemSel ).attr( "id" ) + "-clockhands",
                          radians = 0.0174532925,
                          secondHandBalance = 30,
                          secondTickLength = -10,
                          secondLabel = setObjectParameter( pItemConfig.secondLabel, pDefaultConfig.clockOptions.second.label, true ),
                          circleWidth = setObjectParameter( pItemConfig.circleWidth, pDefaultConfig.clockOptions.circle.width );

                    let time = new Date(),
                        filterUrl,
                        diff = 0,
                        shadows = setObjectParameter( pItemConfig.shadows, pDefaultConfig.clockOptions.shadows, true ),
                        hourHandLength,
                        minuteHandLength,
                        secondHandLength,
                        secondTickStart,
                        hourTickStart,
                        hourTickLength,
                        hourLabelRadius,
                        hourLabelYOffset,
                        hourLabelSize,
                        secondLabelSize,
                        clockLabelYOffset,
                        clockLabel2YOffset,
                        clockLabelFontSize,
                        clockHandCoverSize,
                        secondLabelRadius,
                        secondLabelYOffset,
                        svg,
                        clockElements,
                        hands,
                        hourScale,
                        minuteScale,
                        secondScale,
                        factor,
                        handData,
                        clockCircleRadius;

                    /* disable shadows if no circle */
                    if ( circleWidth <= 0 ) {
                        shadows = false;
                    }

                    /* function to get width and height of svg */
                    const getSVGWidth = function() {
                        return pCon.width();
                    };

                    const getSVGHeight = function() {
                        return Math.floor( pItemHeight / 2 ) - 2;
                    };

                    /* get diff of local time and set time so set time of clock */
                    if ( util.isDefinedAndNotNull( pItemData ) && util.isDefinedAndNotNull( pItemData.startDate ) ) {
                        try {
                            const givenTime = Date.parse( pItemData.startDate );
                            diff = givenTime - time;
                        } catch ( e ) {
                            apex.debug.error( {
                                "fct": `${util.featureDetails.name} - drawClock`,
                                "msg": "Error while try to parse clock date: itemData has to be an iso date. The local time will be used.",
                                "err": e,
                                "featureDetails": util.featureDetails
                            } );
                        }
                    }

                    const formatLabelStr = function( pLabel ) {
                        let str = "";
                        if ( util.isDefinedAndNotNull( pLabel ) ) {
                            const lang = ( apex.locale && apex.locale.getLanguage ) ? apex.locale.getLanguage() : undefined;
                            str = pLabel.replace( '#date#', formatDate( time ) );
                            str = str.replace( '#time#', time.toLocaleTimeString( lang ) );
                            str = util.cutString( str, 15 );
                        }
                        return str;
                    };

                    /* render d3JS clock svg */
                    const renderClock = function() {
                        const factorChange = secondLabel ? 1.05 : 1.2;
                        factor = Math.min( getSVGWidth() / 2, getSVGHeight() * factorChange - ( circleWidth / 3 ) );
                        hourScale = d3JS.scaleLinear()
                            .range( [0, 330] )
                            .domain( [0, 11] );
                        minuteScale = d3JS.scaleLinear()
                            .range( [0, 354] )
                            .domain( [0, 59] );
                        secondScale = d3JS.scaleLinear()
                            .range( [0, 354] )
                            .domain( [0, 59] );

                        hourHandLength = factor * 0.35;
                        minuteHandLength = factor * 0.55;
                        secondHandLength = factor * 0.7;
                        secondTickStart = factor * 0.7;
                        hourTickStart = factor * 0.6;
                        hourTickLength = factor * 0.1;
                        hourLabelRadius = factor * 0.51;
                        clockCircleRadius = factor * 0.75;
                        secondLabelRadius = factor * 0.835 + ( circleWidth / 3 );
                        hourLabelSize = Math.max( Math.floor( factor * 0.12 ), 12 );
                        secondLabelSize = Math.max( Math.floor( factor * 0.1 ), 9 );
                        hourLabelYOffset = hourLabelSize / 2.15;
                        secondLabelYOffset = secondLabelSize / 2.15;
                        clockLabelFontSize = Math.floor( factor * 0.13 );
                        clockLabel2YOffset = factor * 0.3;
                        clockLabelYOffset = -( factor * 0.3 ) + clockLabelFontSize;
                        clockHandCoverSize = factor * 0.03 * ( setObjectParameter( pItemConfig.handsCoverSize, pDefaultConfig.clockOptions.hands.coverSize ) );

                        handData = [{
                            type: "hour",
                            value: 0,
                            length: -hourHandLength,
                            scale: hourScale
                        }, {
                            type: "minute",
                            value: 0,
                            length: -minuteHandLength,
                            scale: minuteScale
                        }, {
                            type: "second",
                            value: 0,
                            length: -secondHandLength,
                            scale: secondScale,
                            balance: secondHandBalance
                        }];

                        /* update the time */
                        const updateTime = function() {
                            time = new Date();
                            time.setMilliseconds( time.getMilliseconds() + diff );

                            handData[0].value = ( time.getHours() % 12 ) + time.getMinutes() / 60;
                            handData[1].value = time.getMinutes();
                            handData[2].value = time.getSeconds();
                        };

                        updateTime();

                        if ( !svg ) {
                            svg = d3JS.select( pItemSel ).append( "svg" )
                                .attr( "id", clockID )
                                .attr( "class", "bida-clock-svg" );
                        }

                        svg.attr( "width", getSVGWidth() ).attr( "height", ( getSVGHeight() * 2 ) );

                        if ( !clockElements ) {
                            clockElements = svg.append( "g" ).attr( "transform", "translate(" + ( getSVGWidth() / 2 ) + "," + ( getSVGHeight() ) + ")" );

                            /* define shadows */
                            if ( shadows ) {
                                defineSVGShadows( svg, shadowID, 2, 2, 1 );
                                filterUrl = "url(#" + shadowID + ")";
                            }

                            clockElements
                                .append( "g" )
                                .append( "circle" )
                                .attr( "class", "bida-clock-circle" )
                                .style( "filter", filterUrl )
                                .style( "stroke", setObjectParameter( pItemConfig.circleColor, pDefaultConfig.clockOptions.circle.color ) )
                                .style( "stroke-width", circleWidth + "px" )
                                .style( "fill", setObjectParameter( pItemConfig.circleFillColor, pDefaultConfig.clockOptions.circle.fillColor ) );

                            clockElements.selectAll( ".bida-clock-second-tick" )
                                .data( d3JS.range( 0, 60 ) )
                                .enter()
                                .append( "line" )
                                .attr( "class", "bida-clock-second-tick" )
                                .attr( "x1", 0 )
                                .attr( "x2", 0 );

                            clockElements.selectAll( ".bida-clock-hour-tick" )
                                .data( d3JS.range( 0, 12 ) )
                                .enter()
                                .append( "line" )
                                .attr( "class", "bida-clock-hour-tick" )
                                .attr( "x1", 0 )
                                .attr( "x2", 0 );

                            clockElements.selectAll( ".bida-clock-hour-label" )
                                .data( d3JS.range( 3, 13, 3 ) )
                                .enter()
                                .append( "text" )
                                .attr( "class", "bida-clock-hour-label" )
                                .attr( "text-anchor", "middle" );

                            clockElements.append( "text" )
                                .attr( "x", 0 )
                                .attr( "class", "bida-clock-label" )
                                .attr( "text-anchor", "middle" );

                            clockElements.append( "text" )
                                .attr( "x", 0 )
                                .attr( "class", "bida-clock-label2" )
                                .attr( "text-anchor", "middle" );

                            if ( secondLabel ) {
                                clockElements.selectAll( ".bida-clock-second-label" )
                                    .data( d3JS.range( 5, 61, 5 ) )
                                    .enter()
                                    .append( "text" )
                                    .attr( "class", "bida-clock-second-label" )
                                    .attr( "text-anchor", "middle" );
                            }
                        }

                        clockElements.attr( "transform", "translate(" + ( getSVGWidth() / 2 ) + "," + ( getSVGHeight() ) + ")" );

                        clockElements.selectAll( ".bida-clock-circle" )
                            .attr( "x", 0 )
                            .attr( "y", 0 )
                            .attr( "r", clockCircleRadius );

                        clockElements.selectAll( ".bida-clock-second-tick" )
                            .attr( "y1", secondTickStart )
                            .attr( "y2", secondTickStart + secondTickLength )
                            .attr( "transform", function ( d ) {
                                return "rotate(" + secondScale( d ) + ")";
                            } )
                            .style( "stroke", setObjectParameter( pItemConfig.secondTickColor, pDefaultConfig.clockOptions.second.tickColor ) );

                        clockElements.selectAll( ".bida-clock-hour-tick" )
                            .attr( "y1", hourTickStart )
                            .attr( "y2", hourTickStart + hourTickLength )
                            .attr( "transform", function ( d ) {
                                return "rotate(" + hourScale( d ) + ")";
                            } )
                            .style( "stroke", setObjectParameter( pItemConfig.hourTickColor, pDefaultConfig.clockOptions.hour.tickColor ) );

                        clockElements.selectAll( ".bida-clock-hour-label" )
                            .attr( "x", function ( d ) {
                                return hourLabelRadius * Math.sin( hourScale( d ) * radians );
                            } )
                            .attr( "y", function ( d ) {
                                return -hourLabelRadius * Math.cos( hourScale( d ) * radians ) + hourLabelYOffset;
                            } )
                            .text( function ( d ) {
                                return d;
                            } )
                            .style( "font-size", hourLabelSize + "px" )
                            .style( "fill", setObjectParameter( pItemConfig.hourLabelColor, pDefaultConfig.clockOptions.hour.labelColor ) );

                        if ( util.isDefinedAndNotNull( secondLabel ) ) {
                            clockElements.selectAll( ".bida-clock-second-label" )
                                .attr( "x", function ( d ) {
                                    return secondLabelRadius * Math.sin( secondScale( d ) * radians );
                                } )
                                .attr( "y", function ( d ) {
                                    return -secondLabelRadius * Math.cos( secondScale( d ) * radians ) + secondLabelYOffset;
                                } )
                                .text( function ( d ) {
                                    return d;
                                } )
                                .style( "font-size", secondLabelSize + "px" )
                                .style( "fill", setObjectParameter( pItemConfig.secondLabelColor, pDefaultConfig.clockOptions.second.labelColor ) );
                        }

                        if ( util.isDefinedAndNotNull( pItemData ) && util.isDefinedAndNotNull( pItemData.label ) ) {
                            const label = formatLabelStr( pItemData.label );
                            clockElements.selectAll( ".bida-clock-label" )
                                .text( label )
                                .attr( "y", clockLabelYOffset )
                                .style( "font-size", clockLabelFontSize + "px" )
                                .style( "fill", setObjectParameter( pItemConfig.labelColor, pDefaultConfig.clockOptions.label.labelColor ) );
                        }

                        if ( util.isDefinedAndNotNull( pItemData ) && util.isDefinedAndNotNull( pItemData.label2 ) ) {
                            const label2 = formatLabelStr( pItemData.label2 );
                            clockElements.selectAll( ".bida-clock-label2" )
                                .text( label2 )
                                .attr( "y", clockLabel2YOffset )
                                .style( "font-size", clockLabelFontSize + "px" )
                                .style( "fill", setObjectParameter( pItemConfig.labelColor2, pDefaultConfig.clockOptions.label.labelColor2 ) );
                        }

                        if ( !hands ) {
                            hands = clockElements
                                .append( "g" )
                                .attr( "id", clockHandsID );

                            clockElements
                                .append( "g" )
                                .append( "circle" )
                                .attr( "class", "bida-clock-hands-cover" );

                            hands.selectAll( "line" )
                                .data( handData )
                                .enter()
                                .append( "line" );
                        }

                        clockElements.selectAll( ".bida-clock-hands-cover" )
                            .attr( "x", 0 )
                            .attr( "y", 0 )
                            .attr( "r", clockHandCoverSize )
                            .style( "fill", setObjectParameter( pItemConfig.handCoverFillColor, pDefaultConfig.clockOptions.hands.coverFillColor ) )
                            .style( "stroke", setObjectParameter( pItemConfig.handCoverStrokeColor, pDefaultConfig.clockOptions.hands.coverStrokeColor ) );

                        hands.selectAll( "line" )
                            .data( handData )
                            .attr( "class", function ( d ) {
                                return "bida-clock-" + d.type + "-hand";
                            } )
                            .attr( "x1", 0 )
                            .attr( "y1", function ( d ) {
                                return d.balance ? d.balance : 0;
                            } )
                            .attr( "x2", 0 )
                            .attr( "y2", function ( d ) {
                                return d.length;
                            } )
                            .attr( "transform", function ( d ) {
                                return "rotate(" + d.scale( d.value ) + ")";
                            } )
                            .style( "stroke", setObjectParameter( pItemConfig.handColor, pDefaultConfig.clockOptions.hands.color ) );

                        const moveHands = function() {
                            if ( hands ) {
                                hands
                                    .selectAll( "line" )
                                    .data( handData )
                                //.transition()
                                //.duration(250)
                                    .attr( "transform", function ( d ) {
                                        return "rotate(" + d.scale( d.value ) + ")";
                                    } );
                            }
        
                            if ( clockElements ) {
                                if ( util.isDefinedAndNotNull( pItemData ) && util.isDefinedAndNotNull( pItemData.label ) ) {
                                    const label = formatLabelStr( pItemData.label );
                                    clockElements.selectAll( ".bida-clock-label" ).text( label );
                                }
        
                                if ( util.isDefinedAndNotNull( pItemData ) && util.isDefinedAndNotNull( pItemData.label2 ) ) {
                                    const label2 = formatLabelStr( pItemData.label2 );
                                    clockElements.selectAll( ".bida-clock-label2" ).text( label2 );
                                }
                            }
                        };

                        const stopTicking = function() {
                            if ( timers.innerItemsIntervals && timers.innerItemsIntervals[clockIDSel] ) {
                                clearInterval( timers.innerItemsIntervals[clockIDSel] );
                            }
                        };
        
                        const startTicking = function() {
                            timers.innerItemsIntervals[clockIDSel] = setInterval( function () {
                                if ( $( clockIDSel ).length === 0 ) {
                                    clearInterval( timers.innerItemsIntervals[clockIDSel] );
                                } else {
                                    updateTime();
                                    moveHands();
                                }
                            }, 1000 );
                        };
        
                        stopTicking();
                        startTicking();
        
                        /* stop when tab is not active */
                        document.addEventListener( "visibilitychange", function () {
                            if ( document.hidden ) {
                                stopTicking();
                            } else {
                                startTicking();
                            }
                        } );
                    };

                    renderClock();

                    container.on( "resize", function() {
                        renderClock();
                    } );

                } catch ( e ) {
                    $( pItemSel ).empty();
                    util.errorMessage.show( pItemSel, pDefaultConfig.errorMessage );
                    apex.debug.error( {
                        "fct": `${util.featureDetails.name} - drawClock`,
                        "msg": "Error while try to render clock",
                        "err": e,
                        "featureDetails": util.featureDetails
                    } );
                }
            }

            /***********************************************************************
             **
             ** function to draw a calendar 
             **
             ***********************************************************************/
            function drawCalendar( pItemSel, pItemHeight, pItemData, pItemConfig, pDefaultConfig, pOversize, pIsSafeItem ) {

                apex.debug.info( {
                    "fct": `${util.featureDetails.name} - drawCalendar`,
                    "pItemSel": pItemSel,
                    "pItemHeight": pItemHeight,
                    "pItemData": pItemData,
                    "pItemConfig": pItemConfig,
                    "pDefaultConfig": pDefaultConfig,
                    "pOversize": pOversize,
                    "pIsSafeItem": pIsSafeItem,
                    "featureDetails": util.featureDetails
                } );

                const pCon = $( pItemSel ),
                      calendarID = pCon.attr( "id" ) + "-calendar";

                const calendarCon = $( "<div></div>" );
                calendarCon.addClass( "bida-calendar" );
                calendarCon.attr( "id", calendarID );

                pCon.append( calendarCon );

                const eventLimit = setObjectParameter( pItemConfig.eventLimitPerDay, pDefaultConfig.calendarOptions.eventLimitPerDay ),
                      displayTime = setObjectParameter( pItemConfig.displayTime, pDefaultConfig.calendarOptions.displayTime, true ),
                      hours12 = setObjectParameter( pItemConfig.hours12, pDefaultConfig.calendarOptions.hours12, true ),
                      timeGridStartTime = setObjectParameter( pItemConfig.timeGridStartTime, pDefaultConfig.calendarOptions.timeGridStartTime );

                let viewType = setObjectParameter( pItemConfig.viewType, pDefaultConfig.calendarOptions.viewType ),
                    locale = ( apex.locale && apex.locale.getLanguage ) ? apex.locale.getLanguage() : undefined,
                    stickyHeaderDates = setObjectParameter( pItemConfig.stickyHeaderDates, pDefaultConfig.calendarOptions.stickyHeaderDates );

                if ( stickyHeaderDates === "true" ) {
                    stickyHeaderDates = true;
                }

                if ( stickyHeaderDates === "false" ) {
                    stickyHeaderDates = false;
                }

                /* workaround for 24:00 instead of 00:00*/
                if ( !hours12 && locale === 'en' ) {
                    locale = 'en-bz';
                }

                const defaultDateFormat = {
                    month: '2-digit',
                    year: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: hours12,
                    locale: locale
                };

                const possbileTypes = [
                    "dayGridMonth",
                    "dayGridWeek",
                    "timeGridWeek",
                    "listWeek",
                    "listMonth",
                    "listDay"
                ];

                if ( possbileTypes.indexOf( viewType ) < 0 ) {
                    viewType = "dayGridMonth";
                }

                // eslint-disable-next-line no-undef
                const fullCalendar = FullCalendar;

                const calendarEl = document.getElementById( calendarID );
                const calendar = new fullCalendar.Calendar( calendarEl, {
                    height: pItemHeight,
                    events: pItemData,
                    displayEventTime: displayTime,
                    initialView: viewType,
                    eventDisplay: 'block',
                    stickyHeaderDates: stickyHeaderDates,
                    eventMouseEnter: function ( info ) {
                        if ( info.event && info.event._def ) {
                            const def = info.event._def;
                            if ( def.extendedProps && def.extendedProps.link ) {
                                $( info.el ).css( "cursor", "pointer" );
                            }
                        }

                        const html = $( "<div></div>" );
                        html.addClass( "bida-calendar-event-tt" );

                        const title = $( "<b></b>" );
                        title.addClass( "bida-calendar-event-tt-title" );
                        const htmlStr = escapeOrSanitizeHTML( info.event.title, pDefaultConfig, pIsSafeItem, pRequireHTMLEscape );
                        if ( util.isDefinedAndNotNull( htmlStr ) ) {
                            title.append( htmlStr );
                            html.append( title );
                            html.append( "<br>" );
                        }

                        const subTitle = $( "<div></div>" );
                        subTitle.addClass( "bida-calendar-event-tt-subtitle" );

                        const subTitleIcon = $( "<span></span>" );
                        subTitleIcon.addClass( "fa fa-clock-o" );
                        subTitleIcon.addClass( "bida-calendar-event-tt-icon" );
                        subTitle.append( subTitleIcon );

                        const subTitleDateText = $( "<span></span>" );
                        subTitleDateText.addClass( "bida-calendar-event-tt-date" );
                        subTitleDateText.append( " " );
                        subTitleDateText.append( fullCalendar.formatDate( info.event.start, defaultDateFormat ) );
                        if ( util.isDefinedAndNotNull( info.event.end ) ) {
                            subTitleDateText.append( " - " );
                            subTitleDateText.append( fullCalendar.formatDate( info.event.end, defaultDateFormat ) );
                        }
                        subTitle.append( subTitleDateText );

                        html.append( subTitle );

                        if ( util.isDefinedAndNotNull( info.event.extendedProps.details ) ) {
                            const str = escapeOrSanitizeHTML( info.event.extendedProps.details, pDefaultConfig, pIsSafeItem, pRequireHTMLEscape );
                            if ( util.isDefinedAndNotNull( str ) ) {
                                const span = $( "<div></div>" );
                                span.addClass( "bida-calendar-event-tt-content" );
                                span.append( str );
                                html.append( span );
                            }
                        }

                        util.tooltip.show( html );
                        util.tooltip.setPosition( info.jsEvent );
                    },
                    eventMouseLeave: function () {
                        util.tooltip.hide();
                    },
                    eventClick: function ( ev ) {
                        ev.jsEvent.preventDefault();
                        if ( ev.event && ev.event._def ) {
                            const def = ev.event._def;
                            if ( def.extendedProps && def.extendedProps.link ) {
                                util.link( def.extendedProps.link, def.extendedProps.linkTarget );
                            } else {
                                if ( def.extendedProps ) {
                                    util.link( def.url, def.extendedProps.linkTarget );
                                } else {
                                    util.link( def.url );
                                }
                            }
                        }
                        util.tooltip.hide();
                    },
                    dayMaxEventRows: eventLimit,
                    eventContent: function ( ev ) {
                        const str = escapeOrSanitizeHTML( ev.event.title, pDefaultConfig, pIsSafeItem, pRequireHTMLEscape );
                        return { html: str };
                    },
                    allDaySlot: false,
                    nowIndicator: true,
                    views: {
                        dayGrid: {}
                    },
                    eventTimeFormat: {
                        hour: defaultDateFormat.hour,
                        minute: defaultDateFormat.minute,
                        hour12: defaultDateFormat.hour12
                    },
                    scrollTime: timeGridStartTime,
                    slotLabelFormat: {
                        hour: defaultDateFormat.hour,
                        minute: defaultDateFormat.minute,
                        hour12: defaultDateFormat.hour12
                    }
                } );

                calendar.setOption( 'locale', locale );
                calendar.changeView( viewType );

                calendar.render();

                if ( pOversize !== true ) {
                    calendarCon.css( "height", pItemHeight );
                    calendarCon.addClass( "bida-item-div-overflow" );
                    overFlowStyling( calendarCon );
                }

                container.on( "resize", function() {
                    calendar.render();
                } );
            }

            /***********************************************************************
             **
             ** function to draw a note editor
             **
             ***********************************************************************/
            function drawNoteEditor( pItemID, pItemSel, pItemHeight, pItemData, pItemConfig, pDefaultConfig, pOversize, pIsSafeItem ) {

                apex.debug.info( {
                    "fct": `${util.featureDetails.name} - drawNoteEditor`,
                    "pItemID": pItemID,
                    "pItemSel": pItemSel,
                    "pItemHeight": pItemHeight,
                    "pItemData": pItemData,
                    "pItemConfig": pItemConfig,
                    "pDefaultConfig": pDefaultConfig,
                    "pOversize": pOversize,
                    "pIsSafeItem": pIsSafeItem,
                    "featureDetails": util.featureDetails
                } );

                const item$ = $( pItemSel ),
                      noteID = item$.attr( "id" ) + "-note";

                const noteCon = $( "<div></div>" );
                noteCon.addClass( "bida-note" );
                noteCon.attr( "id", noteID );
                noteCon.css( "height", pItemHeight );

                item$.append( noteCon );

                const savebtnID = noteID + "-save",
                      selectClass= "pell-button-c-select";

                function disableSaveButton() {
                    $( "#" + savebtnID ).parent().addClass( "pell-button-disabled" );
                }

                const highlightArr = [],
                      colors = ["#000", "#f77272", "#f7f772", "#8af772", "#72aef7", "#c672f7" ];

                highlightArr.push( `<select class="${selectClass}" onchange="$('#${noteID}').trigger('colorchange', this.value );">` );
                colors.forEach( function( element ) {
                    highlightArr.push( `<option value="${element}" style="color:${element};">&#9632;</option>` );
                } );
                highlightArr.push( '</select>' );

                pell.init( {
                    element: document.getElementById( noteID ),
                    onChange: function () {
                        $( "#" + savebtnID ).parent().removeClass( "pell-button-disabled" );
                    },
                    defaultParagraphSeparator: "p",
                    styleWithCSS: false,
                    classes: {
                        actionbar: 'pell-actionbar',
                        button: 'pell-button',
                        content: 'pell-content',
                        selected: 'pell-button-selected'
                    },
                    actions: [
                        {
                            name: "Save",
                            icon: '<i id="' + savebtnID + '" class="fa fa-save-as pell-button-c"></i>',
                            title: "Save",
                            result: function () {
                                const content = noteCon.find( ".pell-content" );
                                util.loader.start( pItemSel );
                                disableSaveButton();

                                const clob = content.html();
                                const chunkArr = util.splitString2Array( clob );
                                const submitItems = pDefaultConfig.items2Submit;
                                apex.server.plugin(
                                    pAjaxID, {
                                        pageItems: submitItems,
                                        x01: 'noteUpload',
                                        x02: pItemID,
                                        f01: chunkArr

                                    }, {
                                        dataType: "text",
                                        success: function () {
                                            util.loader.stop( pItemSel );
                                            container.trigger( "shortnotesaved", {
                                                "itemID": pItemID,
                                                "itemSel": pItemSel,
                                                "clob": clob
                                            } );
                                            apex.debug.info( {
                                                "fct": `${util.featureDetails.name} - drawNoteEditor`,
                                                "msg": "Upload successful.",
                                                "featureDetails": util.featureDetails
                                            } );
                                        },
                                        error: function ( jqXHR, textStatus, errorThrown ) {
                                            util.loader.stop( pItemSel );
                                            apex.message.clearErrors();
                                            apex.message.showErrors( [{
                                                type: "error",
                                                location: ["page"],
                                                message: pDefaultConfig.errorMessage,
                                                unsafe: false
                                            }] );
                                            apex.debug.info( {
                                                "fct": `${util.featureDetails.name} - drawNoteEditor`,
                                                "msg": "Error while try to upload NoteEditor Content",
                                                "jqXHR": jqXHR,
                                                "textStatus": textStatus,
                                                "errorThrown": errorThrown,
                                                "featureDetails": util.featureDetails
                                            } );
                                        }
                                    } );
                            }
                        }, {
                            name: "Undo",
                            icon: '<i class="fa fa-undo pell-button-c"></i>',
                            title: "Undo",
                            result: function () {
                                pell.exec( "undo", true );
                            }
                        }, {
                            name: "Redo",
                            icon: '<i class="fa fa-repeat pell-button-c"></i>',
                            title: "Redo",
                            result: function () {
                                pell.exec( "redo", true );
                            }
                        }, {
                            name: "bold",
                            icon: '<i class="fa fa-bold pell-button-c"></i>',
                            title: "Bold"
                        }, {
                            name: "italic",
                            icon: '<i class="fa fa-italic pell-button-c"></i>',
                            title: "Italic"
                        }, {
                            name: "underline",
                            icon: '<i class="fa fa-underline pell-button-c"></i>',
                            title: "Underline"
                        }, {
                            name: "strikethrough",
                            icon: '<i class="fa fa-strikethrough pell-button-c"></i>',
                            title: "Strikethrough"
                        }, {
                            name: "heading1",
                            icon: '<i class="fa fa-header pell-button-c"><sub>1</sub></i>',
                            title: "Heading 1"
                        }, {
                            name: "heading2",
                            icon: '<i class="fa fa-header pell-button-c"><sub>2</sub></i>',
                            title: "Heading 2"
                        }, {
                            name: "paragraph",
                            icon: '<i class="fa fa-paragraph pell-button-c"></i>',
                        }, {
                            name: "olist",
                            icon: '<i class="fa fa-list-ol pell-button-c"></i>',
                            title: "Ordered List"
                        }, {
                            name: "ulist",
                            icon: '<i class="fa fa-list-ul pell-button-c"></i>',
                            title: "Unordered List"
                        }, {
                            name: "checkbox",
                            icon: '<i class="fa fa-check-square-o pell-button-c"></i>',
                            title: "checkbox",
                            result: function () {
                                pell.exec( "insertHTML", `<div><i class="fa fa-square-o" onmousedown="$(this).toggleClass(['fa-check-square-o', 'fa-square-o']);"> </i></div>` );
                            }
                        }, {
                            name: "resetformat",
                            icon: '<i class="fa fa-eraser pell-button-c"></i>',
                            title: "Remove Format",
                            result: function () {
                                pell.exec( "removeFormat", true );
                            }
                        }, {
                            name: "highlight",
                            icon: highlightArr.join( "" ),
                            title: "Highlight",
                            result: function () {
                                return;
                            }
                        }
                    ]
                } );

                noteCon.on( "colorchange", function( event, data ){
                    // remove hilite when black is selected
                    if ( data === "#000" ) {
                        pell.exec( "hiliteColor", "#fff" );
                    } else {
                        pell.exec( "hiliteColor", data );
                    }
                } );

                let str;
                if ( pItemData && typeof pItemData === "object" ) {
                    str = pItemData.text;
                } else {
                    str = pItemData;
                }

                str = escapeOrSanitizeHTML( str, pDefaultConfig, pIsSafeItem, pRequireHTMLEscape );

                const content = noteCon.find( ".pell-content" );
                const setHeight = function() {
                    const actionBarHeight = noteCon.find( ".pell-actionbar" ).height();
                    content.css( "height", noteCon.height() - actionBarHeight );
                };  

                content.html( str );
                setHeight();
                disableSaveButton();
                noteCon.find( ".pell-button" ).removeAttr( "title" );

                container.on( "resize", function() {
                    setHeight();
                } );
            }

            /***********************************************************************
             **
             ** function to render d3JS calendar heatmap
             **
             ***********************************************************************/
            function drawCalendarHeatmap( pItemSel, pItemHeight, pConfigData, pValuesData, pDefaultConfig, pIsSafeItem  ) {

                apex.debug.info( {
                    "fct": `${util.featureDetails.name} - drawCalendarHeatmap`,
                    "pItemSel": pItemSel,
                    "pItemHeight": pItemHeight,
                    "pConfigData": pConfigData,
                    "pValuesData": pValuesData,
                    "featureDetails": util.featureDetails
                } );

                // apex.locale is only available on 21.2 so this is the en fallback
                let startOfWeek = "sunday",
                    localeDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                    localeMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                // check if the all needed apex.locale api's are available
                if ( typeof apex.locale.getSettings === "function" && apex.locale.getSettings().calendar && apex.locale.getSettings().calendar.startOfWeek ) {
                    localeMonths = apex.locale.getAbbrevMonthNames();
                    localeDays = apex.locale.getAbbrevDayNames();
                    startOfWeek = apex.locale.getSettings().calendar.startOfWeek;
                }

                // eslint-disable-next-line no-undef
                const d3JS = d3;

                const dataMap = new Map(),
                      item$ = $( pItemSel ),
                      calendarContainerID = item$.attr( "id" ) + "-cheatmap",
                      calendarContainerSel = "#" + calendarContainerID,
                      date = new Date(),
                      defaultCellColor = "#efefef",
                      curMonth = date.getMonth(),
                      startDate = new Date( date.getFullYear() - 1, curMonth + 1, 1 ),
                      endDate = new Date( date.getFullYear(), curMonth + 1, 1 ),
                      monthst1 = localeMonths.slice( curMonth + 1 ),
                      monthst2 =  localeMonths.slice( 0, curMonth + 1 ),
                      months = monthst1.concat( monthst2 );

                let startMonday = false,
                    week = d3JS.timeSunday;

                if ( startOfWeek === "monday" ) {
                    startMonday = true;
                    week = d3JS.timeMonday;
                }

                pValuesData.forEach( element => {
                    if ( element.date ) {
                        dataMap.set( element.date.substr( 0, 10 ), element );
                    }
                } );

                const calendarContainer = $( "<div>" );
                calendarContainer.attr( "id", calendarContainerID );
                calendarContainer.css( "height", pItemHeight );
                item$.append( calendarContainer );

                const renderHeatMap = function() {
                    calendarContainer.empty();

                    const width = item$.width(),
                          cellSize = width/53 -40/53,
                          cellHeight = pItemHeight/7 - 20/7,
                          axisCorrect = 40;

                    let marginCorrent = 4;
                    
                    if ( width <= 640 ) {
                        marginCorrent = 2;
                    } else if ( width <= 450 ) {
                        marginCorrent = 1;
                    }

                    const svg = d3JS
                        .select( calendarContainerSel )
                        .selectAll( "svg" )
                        .data( d3JS.range( date.getFullYear() , date.getFullYear() + 1 ) )
                        .enter()
                        .append( "svg" )
                        .attr( "viewBox", `0 0 ${width} ${pItemHeight}` )
                        .attr( "width", "100%" )
                        .attr( "height", "100%" )
                        .attr( "class", "bida-calendar-heatmap-calendar" )
                        .append( "g" )
                        .attr( "transform", `translate(${( width - cellSize * 53 ) / 2 + 10 }, 15)` );

                    svg
                        .append( "g" )
                        .attr( "fill", defaultCellColor )
                        .attr( "stroke", "transparent" )
                        .attr( "stroke-width", "0.1px" )
                        .selectAll( "rect" )
                        .data( d3JS.timeDays( startDate, endDate ) )
                        .enter()
                        .append( "rect" )
                        .attr( "rx", 3 )
                        .attr( "ry", 3 )
                        .attr( "class", "bida-calendar-heatmap-day" )
                        .attr( "width", cellSize - marginCorrent )
                        .attr( "height", cellHeight - marginCorrent )
                        .attr( "transform", `translate(${marginCorrent/3}, ${marginCorrent/3})` )
                        .attr( "x", function( d ) {
                            return week.count( startDate, d ) * cellSize + marginCorrent/4;
                        } )
                        .attr( "y", function( d ) { 
                            if ( startMonday ) {
                                return ( ( d.getDay() + 6 ) % 7 ) * cellHeight + marginCorrent/4;
                            }
                            return d.getDay() * cellHeight; 
                        } )
                        .datum( d3JS.timeFormat( "%Y-%m-%d" ) )
                        .attr( "fill", function( d ) {
                            const entry = dataMap.get( d );
                            if ( entry ) {
                                return entry.color || defaultCellColor; 
                            }
                        } );

                    const allDays = calendarContainer.find( ".bida-calendar-heatmap-day" );
                    $.each( allDays, function() {
                        const day = $( this )[0];
                        if ( day.hasAttribute( "fill" ) ) {
                            d3JS.select( day )
                                .on( "mouseover", function ( event, d ) {
                                    const entry = dataMap.get( d );
                                    if ( entry ) {
                                        const div = $( "<div>" ),
                                              title = $( "<div>" ),
                                              tooltip = $( "<div>" );

                                        div.addClass( "bida-calendar-heatmap-tt" );

                                        const b = $( "<b>" );
                                        b.text( `${formatDate( entry.date )}: ` );

                                        const span = $( "<span>" );
                                        span.text( entry.value );

                                        title.append( b );
                                        title.append( span );
                                        div.append( title );

                                        if ( util.isDefinedAndNotNull( entry.tooltip ) ) {
                                            const ttStr = escapeOrSanitizeHTML( entry.tooltip, pDefaultConfig, pIsSafeItem, pRequireHTMLEscape );
                                            tooltip.html( ttStr );
                                            div.append( tooltip );
                                        }                                    

                                        util.tooltip.show( div[0].outerHTML );
                                    }
                                } )
                                .on( "mouseout", function () {
                                    util.tooltip.hide();
                                } )
                                .on( "mousemove", function ( event ) {
                                    util.tooltip.setPosition( event );
                                } )
                                .on( "click", function ( event, d ) {
                                    const entry = dataMap.get( d );
                                    if ( entry && util.isDefinedAndNotNull( entry.link ) ) {
                                        util.link( entry.link, entry.linkTarget );
                                    }
                                } );
                        }
                    } );

                    svg
                        .append( "g" )
                        .attr( "fill", "none" )
                        .attr( "stroke", "#aaa" )
                        .attr( "stroke-width", "1px" )
                        .selectAll( "path" )
                        .data( d3JS.timeMonths( startDate, endDate ) )
                        .enter()
                        .append( "path" )
                        .attr( "class", "bida-calendar-heatmap-month" )
                        .attr( "d", function ( d ) {
                            const t1 = new Date( d.getFullYear(), d.getMonth() + 1, 0 ),
                                  d0 = startMonday ? ( d.getDay() + 6 ) % 7 : d.getDay(),
                                  w0 = week.count( startDate, d ),
                                  d1 = startMonday ? ( t1.getDay() + 6 ) % 7 : t1.getDay(),
                                  w1 = week.count( startDate, t1 );
                            return `M${( w0 + 1 ) * cellSize}, ${d0 * cellHeight}H${w0 * cellSize}V${7 * cellHeight}H${w1 * cellSize}V${( d1 + 1 ) * cellHeight}H${( w1 + 1 ) * cellSize}V0H${( w0 + 1 ) * cellSize}Z`;
                        } );

                    const xAxisScale = d3JS
                        .scaleBand()
                        .domain( months )
                        .range( [0, width - axisCorrect ] );

                    const xAxis = d3JS
                        .axisTop( xAxisScale )
                        .tickSize( 0 );
                    svg
                        .append( "g" )
                        .call( xAxis )
                        .selectAll( "path" )
                        .attr( "stroke", "transparent" );

                    const yAxisScale = d3JS
                        .scaleBand()
                        .domain( localeDays )
                        .range( [0, pItemHeight - 20 ] );

                    const yAxis = d3JS
                        .axisLeft( yAxisScale )
                        .tickSize( 0 );
                    svg
                        .append( "g" )
                        .call( yAxis )
                        .selectAll( "path" )
                        .attr( "stroke", "transparent" );
                };

                renderHeatMap();

                container.on( "resize", function() {
                    renderHeatMap();
                } );
            }

            /***********************************************************************
             **
             ** function to render d3JS geoMap
             **
             ***********************************************************************/
            function drawD3Map( pItemSel, pItemHeight, pItemData, pItemConfig, pDefaultConfig, pIsSafeItem ) {

                apex.debug.info( {
                    "fct": `${util.featureDetails.name} - drawD3Map`,
                    "pItemSel": pItemSel,
                    "pItemHeight": pItemHeight,
                    "pItemData": pItemData,
                    "pItemConfig": pItemConfig,
                    "pDefaultConfig": pDefaultConfig,
                    "pIsSafeItem": pIsSafeItem,
                    "featureDetails": util.featureDetails
                } );

                try {
                    // eslint-disable-next-line no-undef
                    const d3JS = d3;

                    const item$ = $( pItemSel ),
                          isTour = setObjectParameter( pItemConfig.tourEnabled, pDefaultConfig.mapOptions.tour.enabled, true ),
                          tourSpeed = setObjectParameter( pItemConfig.tourSpeed, pDefaultConfig.mapOptions.tour.speed ) / 2000,
                          tourStart = setObjectParameter( pItemConfig.tourStart, pDefaultConfig.mapOptions.tour.start ),
                          circleShadows = setObjectParameter( pItemConfig.circlesShadows, pDefaultConfig.mapOptions.circles.shadows, true ),
                          circlesRadius = setObjectParameter( pItemConfig.circlesRadius, pDefaultConfig.mapOptions.circles.radius ),
                          circlesColor = setObjectParameter( pItemConfig.circlesColor, pDefaultConfig.mapOptions.circles.color ),
                          circlesOpacity = setObjectParameter( pItemConfig.circlesOpacity, pDefaultConfig.mapOptions.circles.opacity ),
                          circlesOpacityHover = setObjectParameter( pItemConfig.circlesOpacityHover, pDefaultConfig.mapOptions.circles.opacityHover ),
                          centerLongi = setObjectParameter( pItemConfig.mapCenterLongitude, pDefaultConfig.mapOptions.map.centerLongitude ),
                          centerLati = setObjectParameter( pItemConfig.mapCenterLatitude, pDefaultConfig.mapOptions.map.centerLatitude ),
                          initialZoom = setObjectParameter( pItemConfig.mapInitialZoom, pDefaultConfig.mapOptions.map.initialZoom ),
                          zoomEnabled = setObjectParameter( pItemConfig.mapZoomEnabled, pDefaultConfig.mapOptions.map.zoomEnabled, true ),
                          mapColor = setObjectParameter( pItemConfig.mapColor, pDefaultConfig.mapOptions.map.color ),
                          mapStroke = setObjectParameter( pItemConfig.mapStroke, pDefaultConfig.mapOptions.map.stroke ),
                          mapStrokeWidth = setObjectParameter( pItemConfig.mapStrokeWidth, pDefaultConfig.mapOptions.map.strokeWidth ),
                          mapShadows = setObjectParameter( pItemConfig.mapShadows, pDefaultConfig.mapOptions.map.shadows, true ),
                          shadowID = $( pItemSel ).attr( "id" ) + "-shadow",
                          oceanID = $( pItemSel ).attr( "id" ) + "-ocean",
                          highlightID = $( pItemSel ).attr( "id" ) + "-highlight",
                          shadingID = $( pItemSel ).attr( "id" ) + "-shading",
                          oceanURL = "url(#" + oceanID + ")",
                          highlightURL = "url(#" + highlightID + ")",
                          shadingURL = "url(#" + shadingID + ")";

                    let ocean,
                        highlight,
                        shading,
                        shadowURL,
                        mapShadowURL,
                        circlehadowURL,
                        paths,
                        circles,
                        projection,
                        tourShadowEffect = setObjectParameter( pItemConfig.tourShadowEffect, pDefaultConfig.mapOptions.tour.shadowEffect, true );

                    if ( !isTour ) {
                        tourShadowEffect = false;
                    }

                    /* function to get width and height of svg */
                    const getSVGWidth = function() {
                        return item$.width();
                    };

                    const getSVGHeight = function() {
                        return pItemHeight;
                    };

                    /* function to get center of map */
                    const getCenter = function() {
                        return [getSVGWidth() / 2, getSVGHeight() / 2];
                    };

                    /* define svg and set size of svg */
                    const svg = d3JS
                        .select( pItemSel )
                        .append( "svg" ).attr( "class", "bida-map-svg" )
                        .attr( "width", getSVGWidth() )
                        .attr( "height", getSVGHeight() );

                    /* define shadows */
                    if ( mapShadows || circleShadows ) {
                        defineSVGShadows( svg, shadowID, 2, 2, 1 );
                        shadowURL = "url(#" + shadowID + ")";
                    }

                    let tour,
                        startTime = d3JS.now(),
                        totalElapsedTime = 0;

                    /* set projection e.g. map type  */
                    if ( isTour ) {
                        projection = d3JS
                            .geoOrthographic()
                            .scale( getSVGHeight() / 2.5 + 20 )
                            .translate( getCenter() );
                    } else {
                        projection = d3JS
                            .geoNaturalEarth1()
                            .center( [centerLongi, centerLati] )
                            .scale( ( getSVGHeight() / 2.5 ) * initialZoom )
                            .translate( getCenter() );
                    }

                    /* define path with current projection */
                    const path = d3JS.geoPath().projection( projection );

                    /* function to render d3JS map when map json is loaded */
                    const render = function( data ) {
                        apex.debug.info( {
                            "fct": `${util.featureDetails.name} - drawD3Map`,
                            "geoJSONData": data,
                            "featureDetails": util.featureDetails
                        } );

                        const g = svg.append( "g" );

                        if ( tourShadowEffect ) {
                            const oceanEff = svg.append( "defs" ).append( "radialGradient" )
                                .attr( "id", oceanID )
                                .attr( "cx", "75%" )
                                .attr( "cy", "25%" );
                            oceanEff.append( "stop" ).attr( "offset", "5%" ).attr( "stop-color", "#fff" );
                            oceanEff.append( "stop" ).attr( "offset", "100%" ).attr( "stop-color", "rgb(240,240,240)" );

                            const highlightEff = svg.append( "defs" ).append( "radialGradient" )
                                .attr( "id", highlightID )
                                .attr( "cx", "75%" )
                                .attr( "cy", "25%" );
                            highlightEff.append( "stop" )
                                .attr( "offset", "5%" ).attr( "stop-color", "rgb(250,250,250)" )
                                .attr( "stop-opacity", "0.3" );
                            highlightEff.append( "stop" )
                                .attr( "offset", "100%" ).attr( "stop-color", "rgb(230,230,230)" )
                                .attr( "stop-opacity", "0.15" );

                            const shadingEff = svg.append( "defs" ).append( "radialGradient" )
                                .attr( "id", shadingID )
                                .attr( "cx", "55%" )
                                .attr( "cy", "45%" );
                            shadingEff.append( "stop" )
                                .attr( "offset", "30%" ).attr( "stop-color", "#fff" )
                                .attr( "stop-opacity", "0" );
                            shadingEff.append( "stop" )
                                .attr( "offset", "100%" ).attr( "stop-color", "rgb(220,220,220)" )
                                .attr( "stop-opacity", "0.3" );

                            ocean = g.append( "circle" )
                                .attr( "cx", getSVGWidth() / 2 ).attr( "cy", getSVGHeight() / 2 )
                                .attr( "r", projection.scale() )
                                .style( "fill", oceanURL );
                        }

                        /* add map paths */
                        if ( mapShadows ) {
                            mapShadowURL = shadowURL;
                        }

                        paths = g.append( "path" )
                            .attr( "d", path( data ) )
                            .attr( "class", "bida-map-path" )
                            .style( "filter", mapShadowURL )
                            .style( "stroke", mapStroke )
                            .style( "stroke-width", mapStrokeWidth )
                            .style( "fill", mapColor );

                        if ( tourShadowEffect ) {
                            highlight = g.append( "circle" )
                                .attr( "cx", getSVGWidth() / 2 ).attr( "cy", getSVGHeight() / 2 )
                                .attr( "r", projection.scale() )
                                .style( "fill", highlightURL );

                            shading = g.append( "circle" )
                                .attr( "cx", getSVGWidth() / 2 ).attr( "cy", getSVGHeight() / 2 )
                                .attr( "r", projection.scale() )
                                .style( "fill", shadingURL );
                        }

                        /* add circles */
                        if ( circleShadows ) {
                            circlehadowURL = shadowURL;
                        }

                        circles = g.selectAll( ".bida-map-circle" )
                            .data( pItemData )
                            .enter()
                            .append( "circle" )
                            .filter( function ( d ) {
                                if ( util.isDefinedAndNotNull( d.radius ) ) {
                                    return d.radius > 0;
                                } else {
                                    return circlesRadius > 0;
                                }
                            } )
                            .attr( "class", "bida-map-circle" )
                            .style( "filter", circlehadowURL )
                            .attr( "fill", function ( d ) {
                                return d.color || circlesColor;
                            } )
                            .style( "opacity", circlesOpacity )
                            .on( "mouseover", function ( event, d ) {
                                if ( util.isDefinedAndNotNull( d.link ) ) {
                                    $( this ).css( "cursor", "pointer" );
                                }
                                if ( util.isDefinedAndNotNull( d.tooltip ) ) {
                                    const ttStr = escapeOrSanitizeHTML( d.tooltip, pDefaultConfig, pIsSafeItem, pRequireHTMLEscape );
                                    util.tooltip.show( ttStr );
                                }
                                $( this ).css( "opacity", circlesOpacityHover );
                            } )
                            .on( "mousemove", function ( event, d ) {
                                if ( util.isDefinedAndNotNull( d.tooltip ) ) {
                                    util.tooltip.setPosition( event );
                                }
                            } )
                            .on( "mouseout", function () {
                                util.tooltip.hide();
                            } )
                            .on( "click", function ( event, d ) {
                                if ( util.isDefinedAndNotNull( d.link ) ) {
                                    util.link( d.link, d.linkTarget );
                                }
                            } )
                            .attr( "transform", function ( d ) {
                                return "translate(" + projection( [d.longitude, d.latitude] ) + ")";
                            } )
                            .attr( "r", function ( d ) {
                                return setObjectParameter( d.radius, circlesRadius );
                            } );

                        /* update elements when projection changed */
                        function projectionChanged() {
                            paths.attr( 'd', path( data ) );

                            if ( tourShadowEffect ) {
                                ocean.attr( "cx", getSVGWidth() / 2 ).attr( "cy", getSVGHeight() / 2 )
                                    .attr( "r", projection.scale() );
                                highlight.attr( "cx", getSVGWidth() / 2 ).attr( "cy", getSVGHeight() / 2 )
                                    .attr( "r", projection.scale() );
                                shading.attr( "cx", getSVGWidth() / 2 ).attr( "cy", getSVGHeight() / 2 )
                                    .attr( "r", projection.scale() );
                            }

                            circles
                                .attr( "transform", function ( d ) {
                                    return "translate(" + projection( [d.longitude, d.latitude] ) + ")";
                                } )
                                .attr( "r", function ( d ) {
                                    if ( isTour ) {
                                        const gdistance = d3JS.geoDistance( [d.longitude, d.latitude], projection.invert( getCenter() ) );
                                        if ( gdistance > 1.57 ) {
                                            return 0;
                                        }
                                    }
                                    return setObjectParameter( d.radius, circlesRadius );
                                } );
                        }

                        /* add animated tour when options is set but then disable zoom and pan */
                        if ( isTour ) {
                            let i = 0;
                            /* set direction of tour */
                            let direction = -1;
                            let elapsedTime;

                            if ( ( pItemConfig.tourDirection || pDefaultConfig.mapOptions.tour.direction ) === "left" ) {
                                direction = 1;
                            }

                            /* create tour animation */
                            const timerCallback =function() {
                                i += 1;
                                /* throttle fps of d3JS animation */
                                if ( ( i % 60 ) === 0 ) {
                                    if ( $( pItemSel ).length === 0 ) {
                                        tour.stop();
                                    }
                                    /* reset i */
                                    i = 0;
                                }
                                if ( ( i % 3 ) === 0 ) {
                                    elapsedTime = d3JS.now() - startTime;

                                    projection.rotate( [( tourSpeed * elapsedTime + tourStart ) * direction, -10, 0] );
                                    projectionChanged();
                                }
                            };

                            tour = d3JS.timer( timerCallback );
                            timers.d3Timer.push( tour );

                            svg.on( "mouseover", function () {
                                totalElapsedTime = d3JS.now() - startTime;
                                tour.stop();
                            } );

                            svg.on( "mouseout", function () {
                                startTime = d3JS.now() - totalElapsedTime;
                                tour.restart( timerCallback );
                            } );

                            /* stop when tab is not active */
                            document.addEventListener( "visibilitychange", function () {
                                if ( document.hidden ) {
                                    tour.stop();
                                } else {
                                    tour.restart( timerCallback );
                                }
                            } );

                        } else {
                            if ( zoomEnabled ) {
                                /* enable pan and zoom */
                                const zoom = d3JS.zoom()
                                    .scaleExtent( [1, 8] )
                                    .on( "zoom", function ( event ) {
                                        g.attr( "transform", event.transform );
                                    } );

                                svg.call( zoom );

                                /* init zoom on mouse rightclick */
                                svg.on( "contextmenu", function ( event ) {
                                    event.preventDefault();
                                    svg.call( zoom.transform, d3JS.zoomIdentity.scale( 1 ) );
                                } );
                            }
                        }

                        container.on( "resize", function() {
                            svg.attr( "width", getSVGWidth() );
                            svg.attr( "height", getSVGHeight() );
                            projection.translate( getCenter() );
                            projectionChanged();
                        } );
                    };

                    /* load map json and draw map */
                    if ( isTour ) {
                        if ( !mapJSON.tour ) {
                            const url = pMapURL + "world-tour.json";
                            $.getJSON( url, function ( data ) {
                                mapJSON.tour = data;
                                render( mapJSON.tour );
                            } );
                        } else {
                            render( mapJSON.tour );
                        }
                    } else {
                        if ( !mapJSON.zoom ) {
                            const url = pMapURL + "world-zoom.json";
                            $.getJSON( url, function ( data ) {
                                mapJSON.zoom = data;
                                render( mapJSON.zoom );
                            } );
                        } else {
                            render( mapJSON.zoom );
                        }
                    }

                } catch ( e ) {
                    $( pItemSel ).empty();
                    util.errorMessage.show( pItemSel, pDefaultConfig.errorMessage );
                    apex.debug.error( {
                        "fct": `${util.featureDetails.name} - drawD3Map`,
                        "msg": "Error while try to render clock",
                        "err": e,
                        "featureDetails": util.featureDetails
                    } );
                }
            }
        }
    };
};
