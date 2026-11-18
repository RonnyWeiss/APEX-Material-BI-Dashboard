// Spread demo events across the current month so the calendar never looks empty
function generateCurrentMonthEvents(count) {
   const now = new Date(),
      year = now.getFullYear(),
      month = now.getMonth(),
      daysInMonth = new Date(year, month + 1, 0).getDate(); // total number of days in the current month
   let take = count || 10; // clamp to at most one event per day

   if (take > daysInMonth) { take = daysInMonth; }

   const gap = Math.floor(daysInMonth / (take + 1)); // spacing between event days

   if (gap < 1) { gap = 1; }

   const events = []; // collect generated event objects

   for (let i = 1; i <= take; i++) {
      const day = i * gap; // compute the calendar day for this event
      if (day > daysInMonth) { day = daysInMonth; } // snap to last day of month

      const hue = Math.round(360 / take * i), // cycle through rainbow colors
         startH = 9 + Math.floor(i / 2), // stagger start times from 09:00 onward
         endH = startH + 2; // 2-hour event duration

      events.push({
         title: 'Event ' + i,
         start: [year, String(month + 1).padStart(2, '0'), String(day).padStart(2, '0')].join('-') + 'T' + String(startH).padStart(2, '0') + ':00:00',
         end: [year, String(month + 1).padStart(2, '0'), String(day).padStart(2, '0')].join('-') + 'T' + String(endH).padStart(2, '0') + ':00:00',
         color: 'hsl(' + hue + ', 79%, 45%)',
         textColor: 'white',
         details: 'Demo event on ' + [year, String(month + 1).padStart(2, '0'), String(day).padStart(2, '0')].join('-')
      });
   }
   return events;
}
const data = {
   "items": [
      {
         "itemID": "calendar",
         "itemType": "calendar",
         "title": "Event Calendar",
         "itemClasses": "my-super-nice-looking-css-styles",
         "titleIcon": "fa-calendar-o",
         "colSpan": 4,
         "height": 400,
         "optionsLink": "javascript:apex.navigation.dialog('f?p=103428:1010:714022729425309::YES::P1010_TYPE:edit\\u0026p_dialog_cs=TOWQjXavXUJV7JIC18iZ9xi4pVc_1YVhpucGLJ0F-w5Y2Ld5WaVGFETfg1_sQUKwnusjodf1MqhAPDxe52tWlA',{title:'Form - Material BI Dashboard',height:'auto',width:'720',maxWidth:'960',modal:true,dialog:null},'t-Dialog-page--standard '+'',apex.jQuery('#R21618600896115079733'));",
         "optionsLinkIcon": "fa-gear",
         "itemData": generateCurrentMonthEvents(10),
      },
      {
         "itemID": "cards",
         "itemType": "card",
         "title": "KPI Cards",
         "titleIcon": "fa-cube",
         "colSpan": 2,
         "height": 165,
         "oversize": 1,
         "optionsLink": "javascript:apex.navigation.dialog('f?p=103428:1010:714022729425309::YES::P1010_TYPE:edit\\u0026p_dialog_cs=TOWQjXavXUJV7JIC18iZ9xi4pVc_1YVhpucGLJ0F-w5Y2Ld5WaVGFETfg1_sQUKwnusjodf1MqhAPDxe52tWlA',{title:'Form - Material BI Dashboard',height:'auto',width:'720',maxWidth:'960',modal:true,dialog:null},'t-Dialog-page--standard '+'',apex.jQuery('#R21618600896115079733'));",
         "optionsLinkIcon": "fa-gear",
         "itemData": {
            "title": "Target",
            "icon": "fa-gear",
            "value": "87%",
            "footer": "This is a Dashboard KPI Card",
            "link": "https://linktr.ee/ronny.weiss",
            "linkTarget": "_blank"
         }
      },
      {
         "itemID": "cards",
         "itemType": "card",
         "title": "KPI Cards",
         "titleIcon": "fa-cube",
         "colSpan": 2,
         "height": 165,
         "oversize": 1,
         "optionsLink": "javascript:apex.navigation.dialog('f?p=103428:1010:714022729425309::YES::P1010_TYPE:edit\\u0026p_dialog_cs=TOWQjXavXUJV7JIC18iZ9xi4pVc_1YVhpucGLJ0F-w5Y2Ld5WaVGFETfg1_sQUKwnusjodf1MqhAPDxe52tWlA',{title:'Form - Material BI Dashboard',height:'auto',width:'720',maxWidth:'960',modal:true,dialog:null},'t-Dialog-page--standard '+'',apex.jQuery('#R21618600896115079733'));",
         "optionsLinkIcon": "fa-gear",
         "itemData": {
            "icon": "https://raw.githubusercontent.com/RonnyWeiss/APEX-Advent-Calendar/master/img/thumb/02.jpg",
            "iconColor": "white",
            "iconBackColor": null,
            "value": "82%",
            "footer": "This is a Dashboard KPI Card",
            "link": "https://linktr.ee/ronny.weiss"
         }
      },
      {
         "itemID": "map",
         "itemType": "map",
         "title": "D3 Map Region",
         "titleIcon": "fa-globe",
         "colSpan": 4,
         "height": 400,
         "optionsLink": "javascript:apex.navigation.dialog('f?p=103428:1010:714022729425309::YES::P1010_TYPE:edit\\u0026p_dialog_cs=TOWQjXavXUJV7JIC18iZ9xi4pVc_1YVhpucGLJ0F-w5Y2Ld5WaVGFETfg1_sQUKwnusjodf1MqhAPDxe52tWlA',{title:'Form - Material BI Dashboard',height:'auto',width:'720',maxWidth:'960',modal:true,dialog:null},'t-Dialog-page--standard '+'',apex.jQuery('#R21618600896115079733'));",
         "optionsLinkIcon": "fa-gear",
         "itemConfig": {

         },
         "itemData": [
            {
               "radius": 12,
               "latitude": -47,
               "longitude": -24,
               "color": "hsl(23,55%,60%)",
               "tooltip": "This is tooltip 1",
               "link": "https://linktr.ee/ronny.weiss",
               "linkTarget": "_blank"
            },
            {
               "radius": 14,
               "latitude": -21,
               "longitude": 158,
               "color": "hsl(46,55%,60%)",
               "tooltip": "This is tooltip 2",
               "link": "https://linktr.ee/ronny.weiss",
               "linkTarget": "_blank"
            },
            {
               "radius": 14,
               "latitude": -18,
               "longitude": -118,
               "color": "hsl(69,55%,60%)",
               "tooltip": "This is tooltip 3",
               "link": "https://linktr.ee/ronny.weiss",
               "linkTarget": "_blank"
            },
            {
               "radius": 12,
               "latitude": -8,
               "longitude": 149,
               "color": "hsl(92,55%,60%)",
               "tooltip": "This is tooltip 4",
               "link": "https://linktr.ee/ronny.weiss",
               "linkTarget": "_blank"
            },
            {
               "radius": 9,
               "latitude": -43,
               "longitude": 25,
               "color": "hsl(115,55%,60%)",
               "tooltip": "This is tooltip 5",
               "link": "https://linktr.ee/ronny.weiss",
               "linkTarget": "_blank"
            },
            {
               "radius": 14,
               "latitude": -9,
               "longitude": -106,
               "color": "hsl(138,55%,60%)",
               "tooltip": "This is tooltip 6",
               "link": "https://linktr.ee/ronny.weiss",
               "linkTarget": "_blank"
            },
            {
               "radius": 11,
               "latitude": -2,
               "longitude": 98,
               "color": "hsl(161,55%,60%)",
               "tooltip": "This is tooltip 7",
               "link": "https://linktr.ee/ronny.weiss",
               "linkTarget": "_blank"
            },
            {
               "radius": 8,
               "latitude": 21,
               "longitude": -70,
               "color": "hsl(184,55%,60%)",
               "tooltip": "This is tooltip 8",
               "link": "https://linktr.ee/ronny.weiss",
               "linkTarget": "_blank"
            },
            {
               "radius": 9,
               "latitude": -11,
               "longitude": -166,
               "color": "hsl(7,55%,60%)",
               "tooltip": "This is tooltip 9",
               "link": "https://linktr.ee/ronny.weiss",
               "linkTarget": "_blank"
            },
            {
               "radius": 11,
               "latitude": -28,
               "longitude": -6,
               "color": "hsl(30,55%,60%)",
               "tooltip": "This is tooltip 10",
               "link": "https://linktr.ee/ronny.weiss",
               "linkTarget": "_blank"
            },
            {
               "radius": 11,
               "latitude": 40,
               "longitude": -127,
               "color": "hsl(53,55%,60%)",
               "tooltip": "This is tooltip 11",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 11,
               "latitude": -59,
               "longitude": 45,
               "color": "hsl(76,55%,60%)",
               "tooltip": "This is tooltip 12",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 11,
               "latitude": 9,
               "longitude": -39,
               "color": "hsl(99,55%,60%)",
               "tooltip": "This is tooltip 13",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 9,
               "latitude": 34,
               "longitude": -102,
               "color": "hsl(122,55%,60%)",
               "tooltip": "This is tooltip 14",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 10,
               "latitude": -28,
               "longitude": -33,
               "color": "hsl(145,55%,60%)",
               "tooltip": "This is tooltip 15",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 12,
               "latitude": 16,
               "longitude": 149,
               "color": "hsl(168,55%,60%)",
               "tooltip": "This is tooltip 16",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 11,
               "latitude": 51,
               "longitude": 177,
               "color": "hsl(191,55%,60%)",
               "tooltip": "This is tooltip 17",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 8,
               "latitude": 35,
               "longitude": -156,
               "color": "hsl(14,55%,60%)",
               "tooltip": "This is tooltip 18",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 11,
               "latitude": 29,
               "longitude": 7,
               "color": "hsl(37,55%,60%)",
               "tooltip": "This is tooltip 19",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 11,
               "latitude": -29,
               "longitude": 31,
               "color": "hsl(60,55%,60%)",
               "tooltip": "This is tooltip 20",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 11,
               "latitude": -15,
               "longitude": -115,
               "color": "hsl(83,55%,60%)",
               "tooltip": "This is tooltip 21",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 10,
               "latitude": 45,
               "longitude": -19,
               "color": "hsl(106,55%,60%)",
               "tooltip": "This is tooltip 22",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 12,
               "latitude": 6,
               "longitude": 78,
               "color": "hsl(129,55%,60%)",
               "tooltip": "This is tooltip 23",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 15,
               "latitude": 57,
               "longitude": -104,
               "color": "hsl(152,55%,60%)",
               "tooltip": "This is tooltip 24",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 11,
               "latitude": 19,
               "longitude": 91,
               "color": "hsl(175,55%,60%)",
               "tooltip": "This is tooltip 25",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 9,
               "latitude": 19,
               "longitude": -70,
               "color": "hsl(198,55%,60%)",
               "tooltip": "This is tooltip 26",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 10,
               "latitude": 1,
               "longitude": -60,
               "color": "hsl(21,55%,60%)",
               "tooltip": "This is tooltip 27",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 8,
               "latitude": -1,
               "longitude": -159,
               "color": "hsl(44,55%,60%)",
               "tooltip": "This is tooltip 28",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 12,
               "latitude": 55,
               "longitude": 26,
               "color": "hsl(67,55%,60%)",
               "tooltip": "This is tooltip 29",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 13,
               "latitude": 41,
               "longitude": -84,
               "color": "hsl(90,55%,60%)",
               "tooltip": "This is tooltip 30",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 9,
               "latitude": 35,
               "longitude": 162,
               "color": "hsl(113,55%,60%)",
               "tooltip": "This is tooltip 31",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 12,
               "latitude": -6,
               "longitude": 59,
               "color": "hsl(136,55%,60%)",
               "tooltip": "This is tooltip 32",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 13,
               "latitude": 39,
               "longitude": 113,
               "color": "hsl(159,55%,60%)",
               "tooltip": "This is tooltip 33",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 9,
               "latitude": 7,
               "longitude": 38,
               "color": "hsl(182,55%,60%)",
               "tooltip": "This is tooltip 34",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 9,
               "latitude": 34,
               "longitude": 29,
               "color": "hsl(5,55%,60%)",
               "tooltip": "This is tooltip 35",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 13,
               "latitude": -34,
               "longitude": -16,
               "color": "hsl(28,55%,60%)",
               "tooltip": "This is tooltip 36",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 11,
               "latitude": 25,
               "longitude": -90,
               "color": "hsl(51,55%,60%)",
               "tooltip": "This is tooltip 37",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 14,
               "latitude": 0,
               "longitude": 89,
               "color": "hsl(74,55%,60%)",
               "tooltip": "This is tooltip 38",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 13,
               "latitude": 56,
               "longitude": -59,
               "color": "hsl(97,55%,60%)",
               "tooltip": "This is tooltip 39",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 13,
               "latitude": 58,
               "longitude": 78,
               "color": "hsl(120,55%,60%)",
               "tooltip": "This is tooltip 40",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 13,
               "latitude": 30,
               "longitude": -59,
               "color": "hsl(143,55%,60%)",
               "tooltip": "This is tooltip 41",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 13,
               "latitude": 4,
               "longitude": -27,
               "color": "hsl(166,55%,60%)",
               "tooltip": "This is tooltip 42",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 14,
               "latitude": -50,
               "longitude": -6,
               "color": "hsl(189,55%,60%)",
               "tooltip": "This is tooltip 43",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 12,
               "latitude": -23,
               "longitude": -102,
               "color": "hsl(12,55%,60%)",
               "tooltip": "This is tooltip 44",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 14,
               "latitude": -19,
               "longitude": -72,
               "color": "hsl(35,55%,60%)",
               "tooltip": "This is tooltip 45",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 14,
               "latitude": 33,
               "longitude": 74,
               "color": "hsl(58,55%,60%)",
               "tooltip": "This is tooltip 46",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 12,
               "latitude": 51,
               "longitude": 61,
               "color": "hsl(81,55%,60%)",
               "tooltip": "This is tooltip 47",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 14,
               "latitude": 2,
               "longitude": -57,
               "color": "hsl(104,55%,60%)",
               "tooltip": "This is tooltip 48",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 8,
               "latitude": 43,
               "longitude": 94,
               "color": "hsl(127,55%,60%)",
               "tooltip": "This is tooltip 49",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 10,
               "latitude": -21,
               "longitude": -24,
               "color": "hsl(150,55%,60%)",
               "tooltip": "This is tooltip 50",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 11,
               "latitude": -15,
               "longitude": 27,
               "color": "hsl(173,55%,60%)",
               "tooltip": "This is tooltip 51",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 9,
               "latitude": 35,
               "longitude": -147,
               "color": "hsl(196,55%,60%)",
               "tooltip": "This is tooltip 52",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 8,
               "latitude": 60,
               "longitude": 135,
               "color": "hsl(19,55%,60%)",
               "tooltip": "This is tooltip 53",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 8,
               "latitude": -23,
               "longitude": 8,
               "color": "hsl(42,55%,60%)",
               "tooltip": "This is tooltip 54",
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "radius": 13,
               "latitude": -26,
               "longitude": -162,
               "color": "hsl(65,55%,60%)",
               "tooltip": "This is tooltip 55",
               "link": "https://linktr.ee/ronny.weiss"
            }
         ]
      },
      {
         "itemID": "area-chart1",
         "title": "Area-spline chart loaded sync, zoom type drag and custome Tooltips",
         "itemType": "chart",
         "colSpan": 4,
         "isAsync": 1,
         "height": 400,
         "itemConfig": {
            "gridX": 1,
            "gridY": 1,
            "legendShow": 1,
            "legendPosition": "bottom",
            "rotateAxis": null,
            "showDataLabels": 0,
            "showDataPoints": 1,
            "tickCutAfter": 30,
            "tickMaxnum": 15,
            "tooltipShow": 1,
            "tooltipGrouped": 1,
            "xLabel": "X Axis",
            "xType": "category",
            "yLabel": "Y Axis",
            "yMax": null,
            "yMin": null,
            "y2Label": "Y2 Axis",
            "y2Max": null,
            "y2Min": null,
            "zoomEnabled": 1,
            "zoomType": "drag"
         }
      },
      {
         "itemID": "html",
         "itemType": "html",
         "title": "HTML Region (Slideshow with Autoplay)",
         "titleIcon": "fa-code",
         "colSpan": 4,
         "height": 400,
         "itemData": [
            {
               "html": "<p>Here you can add escaped text or HTML (Need disable Escaping):</p><iframe style=\"width:100%;border:none;height:290px\" src=\"https://www.youtube.com/embed/vqz8c4ZP3Wg\"></iframe>",
               "duration": 20
            },
            {
               "html": "<p>Here you can add escaped text or HTML (Need disable Escaping):</p><iframe style=\"width:100%;border:none;height:290px\" src=\"https://www.youtube.com/embed/o2hOoQmy1CU\"></iframe>",
               "duration": 20
            }
         ]
      },
      {
         "itemID": "list",
         "itemType": "list",
         "title": "Item Lists",
         "titleIcon": "fa-list",
         "colSpan": 4,
         "height": 210,
         "optionsLink": "javascript:apex.navigation.dialog('f?p=103428:1010:714022729425309::YES::P1010_TYPE:edit\\u0026p_dialog_cs=TOWQjXavXUJV7JIC18iZ9xi4pVc_1YVhpucGLJ0F-w5Y2Ld5WaVGFETfg1_sQUKwnusjodf1MqhAPDxe52tWlA',{title:'Form - Material BI Dashboard',height:'auto',width:'720',maxWidth:'960',modal:true,dialog:null},'t-Dialog-page--standard '+'',apex.jQuery('#R21618600896115079733'));",
         "optionsLinkIcon": "fa-gear",
         "itemData": [
            {
               "title": "List item 1",
               "text": "This is a list item. You can set font-apex or images as icons",
               "icon": "fa-apex",
               "iconColor": "white",
               "iconBackColor": null,
               "link": "https://linktr.ee/ronny.weiss",
               "linkTarget": "_blank"
            },
            {
               "title": "List item 2",
               "text": "This is a list item. You can set font-apex or images as icons",
               "icon": "fa-apex",
               "iconColor": "white",
               "iconBackColor": null,
               "link": "https://linktr.ee/ronny.weiss"
            },
            {
               "title": "List item 3",
               "text": "This is a list item. You can set font-apex or images as icons",
               "icon": "fa-apex",
               "iconColor": "white",
               "iconBackColor": null,
               "link": "https://linktr.ee/ronny.weiss"
            }
         ]
      },
      {
         "itemID": "noteitem1",
         "itemType": "note",
         "title": "Here you can add and save short notes",
         "colSpan": 4,
         "height": 235,
         "itemData": {
            "text": "<div><b>Here you can enter notes or tasks that need to be done</b></div><div><b><br></b></div><div><div><ol><li><strike>Cleanup the kitchen</strike></li><li>Weekly shopping</li><li><b>Call grandma</b></li></ol></div></div>"
         }
      },
      {
         "itemID": "piechart",
         "title": "Pie Chart",
         "titleIcon": "fa-pie-chart",
         "itemType": "chart",
         "colSpan": 2,
         "height": 190,
         "optionsLink": "javascript:apex.navigation.dialog('f?p=103428:1010:714022729425309::YES::P1010_TYPE:edit\\u0026p_dialog_cs=TOWQjXavXUJV7JIC18iZ9xi4pVc_1YVhpucGLJ0F-w5Y2Ld5WaVGFETfg1_sQUKwnusjodf1MqhAPDxe52tWlA',{title:'Form - Material BI Dashboard',height:'auto',width:'720',maxWidth:'960',modal:true,dialog:null},'t-Dialog-page--standard '+'',apex.jQuery('#R21618600896115079733'));",
         "optionsLinkIcon": "fa-gear",
         "itemConfig": {
            "legendShow": 1,
            "legendPosition": "right",
            "paddingBottom": 5,
            "paddingTop": 5,
            "xShow": 0
         },
         "itemData": [
            {
               "seriesID": "Series 1",
               "groupID": 2,
               "label": "Series 1",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "linkTarget": "_blank",
               "color": null,
               "x": "Val 1",
               "y": 77
            },
            {
               "seriesID": "Series 2",
               "groupID": 2,
               "label": "Series 2",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 1",
               "y": 154
            },
            {
               "seriesID": "Series 3",
               "groupID": 2,
               "label": "Series 3",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 1",
               "y": 231
            },
            {
               "seriesID": "Series 1",
               "groupID": 2,
               "label": "Series 1",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 2",
               "y": 28
            },
            {
               "seriesID": "Series 2",
               "groupID": 2,
               "label": "Series 2",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 2",
               "y": 56
            },
            {
               "seriesID": "Series 3",
               "groupID": 2,
               "label": "Series 3",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 2",
               "y": 84
            },
            {
               "seriesID": "Series 1",
               "groupID": 2,
               "label": "Series 1",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 3",
               "y": 46
            },
            {
               "seriesID": "Series 2",
               "groupID": 2,
               "label": "Series 2",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 3",
               "y": 92
            },
            {
               "seriesID": "Series 3",
               "groupID": 2,
               "label": "Series 3",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 3",
               "y": 138
            },
            {
               "seriesID": "Series 1",
               "groupID": 2,
               "label": "Series 1",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 4",
               "y": 17
            },
            {
               "seriesID": "Series 2",
               "groupID": 2,
               "label": "Series 2",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 4",
               "y": 34
            },
            {
               "seriesID": "Series 3",
               "groupID": 2,
               "label": "Series 3",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 4",
               "y": 51
            },
            {
               "seriesID": "Series 1",
               "groupID": 2,
               "label": "Series 1",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 5",
               "y": 89
            },
            {
               "seriesID": "Series 2",
               "groupID": 2,
               "label": "Series 2",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 5",
               "y": 178
            },
            {
               "seriesID": "Series 3",
               "groupID": 2,
               "label": "Series 3",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 5",
               "y": 267
            },
            {
               "seriesID": "Series 1",
               "groupID": 2,
               "label": "Series 1",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 6",
               "y": 2
            },
            {
               "seriesID": "Series 2",
               "groupID": 2,
               "label": "Series 2",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 6",
               "y": 4
            },
            {
               "seriesID": "Series 3",
               "groupID": 2,
               "label": "Series 3",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 6",
               "y": 6
            },
            {
               "seriesID": "Series 1",
               "groupID": 2,
               "label": "Series 1",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 7",
               "y": 58
            },
            {
               "seriesID": "Series 2",
               "groupID": 2,
               "label": "Series 2",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 7",
               "y": 116
            },
            {
               "seriesID": "Series 3",
               "groupID": 2,
               "label": "Series 3",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 7",
               "y": 174
            },
            {
               "seriesID": "Series 1",
               "groupID": 2,
               "label": "Series 1",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 8",
               "y": 51
            },
            {
               "seriesID": "Series 2",
               "groupID": 2,
               "label": "Series 2",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 8",
               "y": 102
            },
            {
               "seriesID": "Series 3",
               "groupID": 2,
               "label": "Series 3",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 8",
               "y": 153
            },
            {
               "seriesID": "Series 1",
               "groupID": 2,
               "label": "Series 1",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 9",
               "y": 7
            },
            {
               "seriesID": "Series 2",
               "groupID": 2,
               "label": "Series 2",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 9",
               "y": 14
            },
            {
               "seriesID": "Series 3",
               "groupID": 2,
               "label": "Series 3",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 9",
               "y": 21
            },
            {
               "seriesID": "Series 1",
               "groupID": 2,
               "label": "Series 1",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 10",
               "y": 73
            },
            {
               "seriesID": "Series 2",
               "groupID": 2,
               "label": "Series 2",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 10",
               "y": 146
            },
            {
               "seriesID": "Series 3",
               "groupID": 2,
               "label": "Series 3",
               "yAxis": "y",
               "type": "pie",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 10",
               "y": 219
            }
         ]
      },
      {
         "itemID": "gaugechart",
         "itemType": "chart",
         "title": "Gauge Chart",
         "titleIcon": "fa-dial-gauge-chart",
         "colSpan": 2,
         "height": 190,
         "itemConfig": {
            "legendShow": 0,
            "legendPosition": "bottom",
            "paddingBottom": 5,
            "paddingTop": 5,
            "xShow": 0
         },
         "itemData": [
            {
               "seriesID": "Series 1",
               "groupID": "Series 1",
               "label": "Series 1",
               "yAxis": "y",
               "type": "gauge",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 1",
               "y": 23
            },
            {
               "seriesID": "Series 2",
               "groupID": "Series 2",
               "label": "Series 2",
               "yAxis": "y",
               "type": "gauge",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 1",
               "y": 46
            },
            {
               "seriesID": "Series 3",
               "groupID": "Series 3",
               "label": "Series 3",
               "yAxis": "y",
               "type": "gauge",
               "link": "https://linktr.ee/ronny.weiss",
               "color": null,
               "x": "Val 1",
               "y": 69
            }
         ]
      },
      {
         "itemType": "clock",
         "colSpan": 2,
         "height": 200,
         "title": null,
         "itemConfig": {
            "labelColor": null,
            "labelColor2": "#303030",
            "hourLabelColor": "#303030",
            "hourTickColor": "#303030",
            "secondTickColor": "#303030",
            "handColor": null,
            "secondLabel": 0,
            "circleWidth": -1,
            "circleFillColor": "hsl(32, 90%, 60%)",
            "circleColor": null,
            "handsCoverSize": 2,
            "handCoverFillColor": null,
            "handCoverStrokeColor": null
         },
         "itemData": {
            "startDate": "2021-04-13T17:19:53",
            "label": "#date#",
            "label2": "UTC-02:00"
         }
      }, {
         "itemID": "calendarHeatMap",
         "itemType": "calendarheatmap",
         "title": "Calendar Heatmap",
         "titleIcon": "fa-calendar-o",
         "colSpan": 12,
         "height": 220,
         "itemData": [
            {
               "date": "2021-11-01",
               "value": 10,
               "tooltip": "This is a tooltip",
               "link": "https://ronnyweiss.app",
               "linkTarget": "_blank"
            },
            {
               "date": "2021-12-15",
               "value": 10,
               "tooltip": "This is a tooltip",
               "color": "#ACDF87",
               "link": "https://ronnyweiss.app"
            }, {
               "date": "2022-01-01",
               "value": 10,
               "tooltip": "This is a tooltip",
               "color": "#ACDF87"
            },
            {
               "date": "2022-01-10",
               "value": 50,
               "tooltip": "This is a tooltip",
               "color": "#1E5631"
            },
            {
               "date": "2022-02-01",
               "value": 24,
               "tooltip": "This is a tooltip",
               "color": "#76BA1B"
            },
            {
               "date": "2022-10-31",
               "value": 24,
               "tooltip": "This is a tooltip",
               "color": "#76BA1B"
            }
         ]
      }
   ]
};
