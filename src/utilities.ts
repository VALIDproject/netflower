/**
 * Created by Florian on 02.05.2017.
 */
;
import * as d3 from 'd3';
import * as events from 'phovea_core/src/event';
import * as $ from 'jquery';
import {AppConstants} from './app_constants';

/**
Function allowing to 'wrap' the text from an SVG <text> element with <tspan>.
 * Based on https://github.com/mbostock/d3/issues/1642
 * @exemple svg.append("g")
 *      .attr("class", "x axis")
 *      .attr("transform", "translate(0," + height + ")")
 *      .call(xAxis)
 *      .selectAll(".tick text")
 *          .call(d3TextWrap, x.rangeBand());
 *
 * @param text d3 selection for one or more <text> object
 * @param width number - global width in which the text will be word-wrapped.
 * @param paddingRightLeft integer - Padding right and left between the wrapped text and the 'invisible bax' of 'width' width
 * @param paddingTopBottom integer - Padding top and bottom between the wrapped text and the 'invisible bax' of 'width' width
 * @returns Array[number] - Number of lines created by the function, stored in a Array in case multiple <text> element are passed to the function
 *
 * @see: from https://github.com/d3/d3/issues/1642 AlexandreBonneau
 */
export function d3TextWrap(text, width, paddingLeft?, paddingRight?, paddingTopBottom?) {
  paddingLeft = paddingLeft || 5; //Default padding (5px)
  paddingRight = paddingRight || 5; //Default padding (5px)
  paddingTopBottom = (paddingTopBottom || 5) - 2; //Default padding (5px), remove 2 pixels because of the borders
  let maxWidth = width; //I store the tooltip max width
  width = width - ((paddingLeft + paddingRight) * 2); //Take the padding into account

  let arrLineCreatedCount = [];
  text.each(function() {
    let text = d3.select(this),
      words = text.text().split(/[ \f\n\r\t\v]+/).reverse(), //Don't cut non-breaking space (\xA0), as well as the Unicode characters \u00A0 \u2028 \u2029)
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, //Ems
      x,
      y = text.attr("y"),
      dy = parseFloat(text.attr("dy")),
      createdLineCount = 1, //Total line created count
      textAlign = text.style('text-anchor') || 'start'; //'start' by default (start, middle, end, inherit)

    //Clean the data in case <text> does not define those values
    if (isNaN(dy)) dy = 0; //Default padding (0em) : the 'dy' attribute on the first <tspan> _must_ be identical to the 'dy' specified on the <text> element, or start at '0em' if undefined

    //Offset the text position based on the text-anchor
    let wrapTickLabels = d3.select(text.node().parentNode).classed('tick'); //Don't wrap the 'normal untranslated' <text> element and the translated <g class='tick'><text></text></g> elements the same way..
    if (wrapTickLabels) {
      switch (textAlign) {
        case 'start':
          x = -width / 2;
          break;
        case 'middle':
          x = 0;
          break;
        case 'end':
          x = width / 2;
          break;
        default :
      }
    }
    else { //untranslated <text> elements
      switch (textAlign) {
        case 'start':
          x = paddingLeft;
          break;
        case 'middle':
          x = maxWidth / 2;
          break;
        case 'end':
          x = maxWidth - paddingRight;
          break;
        default :
      }
    }
    y = (+((null === y)?paddingTopBottom:y) as any);

    let tspan = (text as any).text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
    //noinspection JSHint
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width && line.length > 1) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        ++createdLineCount;
      }
    }

    arrLineCreatedCount.push(createdLineCount); //Store the line count in the array
  });
  return arrLineCreatedCount;
}



/**
 * This function exports a html table with letious options and creates a JSON.
 * The function had to be adapted and implemented here due to loading issues.
 * (C) Daniel White: http://www.developerdan.com/table-to-json/
 *
 * @param table The html Table to convert
 * @param opts Optional options for converting the table
 *  -) ignoreColumns --> Array of column indexes to ignore. EXPECTS: Array
 *  -) onlyColumns --> Array of column indexes to include, all other are ignored. EXPECTS: Array
 *  -) ignoredHiddenRows --> If hidden rows should be ignored. EXPECTS: Boolean
 *  -) headings --> Array of column headings to use. When given all table rows are treated as values.
 *  -) allowHTML --> If HTML Tags in table cells should be perserved. EXPECTS: Boolean
 *  -) includeRowId --> Determines if the id attribute of each <tr> element is included in the JSON
 *     EXPECTS: Boolean or String. If true then ids are included under rowIds. If String its used as
 *     the header instead of the default rowId
 * @returns {Array} Generated JSON
 */
export function tableToJSON(table, opts?) {
  // Set options
  let defaults = {
    ignoreColumns: [],
    onlyColumns: null,
    ignoreHiddenRows: true,
    ignoreEmptyRows: false,
    headings: null,
    allowHTML: false,
    includeRowId: false,
    textDataOverride: 'data-override',
    textExtractor: null
  };
  opts = $.extend(defaults, opts);

  let notNull = function(value) {
    return value !== undefined && value !== null;
  };

  let ignoredColumn = function(index) {
    if( notNull(opts.onlyColumns) ) {
      return $.inArray(index, opts.onlyColumns) === -1;
    }
    return $.inArray(index, opts.ignoreColumns) !== -1;
  };

  let arraysToHash = function(keys, values) {
    let result = {}, index = 0;
    $.each(values, function(i, value) {
      // when ignoring columns, the header option still starts
      // with the first defined column
      if ( index < keys.length && notNull(value) ) {
        result[ keys[index] ] = value;
        index++;
      }
    });
    return result;
  };

  let cellValues = function(cellIndex, cell, isHeader?) {
    let $cell = $(cell),
      // textExtractor
      extractor = opts.textExtractor,
      override = $cell.attr(opts.textDataOverride);
    // don't use extractor for header cells
    if ( extractor === null || isHeader ) {
      return $.trim( override || ( opts.allowHTML ? $cell.html() : cell.textContent || $cell.text() ) || '' );
    } else {
      // overall extractor function
      if ( $.isFunction(extractor) ) {
        return $.trim( override || extractor(cellIndex, $cell) );
      } else if ( typeof extractor === 'object' && $.isFunction( extractor[cellIndex] ) ) {
        return $.trim( override || extractor[cellIndex](cellIndex, $cell) );
      }
    }
    // fallback
    return $.trim( override || ( opts.allowHTML ? $cell.html() : cell.textContent || $cell.text() ) || '' );
  };

  let rowValues = function(row, isHeader) {
    let result = [];
    let includeRowId = opts.includeRowId;
    let useRowId = (typeof includeRowId === 'boolean') ? includeRowId : (typeof includeRowId === 'string') ? true : false;
    let rowIdName = (typeof includeRowId === 'string') === true ? includeRowId : 'rowId';
    if (useRowId) {
      if (typeof $(row).attr('id') === 'undefined') {
        result.push(rowIdName);
      }
    }
    $(row).children('td,th').each(function(cellIndex, cell) {
      result.push( cellValues(cellIndex, cell, isHeader) );
    });
    return result;
  };

  let getHeadings = function(table) {
    let firstRow = table.find('tr:first').first();
    return notNull(opts.headings) ? opts.headings : rowValues(firstRow, true);
  };

  let construct = function(table, headings) {
    let i, j, len, len2, txt, $row, $cell,
      tmpArray = [], cellIndex = 0, result = [];
    table.children('tbody,*').children('tr').each(function(rowIndex, row) {
      if( rowIndex > 0 || notNull(opts.headings) ) {
        let includeRowId = opts.includeRowId;
        let useRowId = (typeof includeRowId === 'boolean') ? includeRowId : (typeof includeRowId === 'string') ? true : false;

        $row = $(row);

        let isEmpty = ($row.find('td').length === $row.find('td:empty').length) ? true : false;

        if( ( $row.is(':visible') || !opts.ignoreHiddenRows ) && ( !isEmpty || !opts.ignoreEmptyRows ) && ( !$row.data('ignore') || $row.data('ignore') === 'false' ) ) {
          cellIndex = 0;
          if (!tmpArray[rowIndex]) {
            tmpArray[rowIndex] = [];
          }
          if (useRowId) {
            cellIndex = cellIndex + 1;
            if (typeof $row.attr('id') !== 'undefined') {
              tmpArray[rowIndex].push($row.attr('id'));
            } else {
              tmpArray[rowIndex].push('');
            }
          }

          $row.children().each(function(){
            $cell = $(this);
            // skip column if already defined
            while (tmpArray[rowIndex][cellIndex]) { cellIndex++; }

            // process rowspans
            if ($cell.filter('[rowspan]').length) {
              len = parseInt( $cell.attr('rowspan'), 10) - 1;
              txt = cellValues(cellIndex, $cell);
              for (i = 1; i <= len; i++) {
                if (!tmpArray[rowIndex + i]) { tmpArray[rowIndex + i] = []; }
                tmpArray[rowIndex + i][cellIndex] = txt;
              }
            }
            // process colspans
            if ($cell.filter('[colspan]').length) {
              len = parseInt( $cell.attr('colspan'), 10) - 1;
              txt = cellValues(cellIndex, $cell);
              for (i = 1; i <= len; i++) {
                // cell has both col and row spans
                if ($cell.filter('[rowspan]').length) {
                  len2 = parseInt( $cell.attr('rowspan'), 10);
                  for (j = 0; j < len2; j++) {
                    tmpArray[rowIndex + j][cellIndex + i] = txt;
                  }
                } else {
                  tmpArray[rowIndex][cellIndex + i] = txt;
                }
              }
            }

            txt = tmpArray[rowIndex][cellIndex] || cellValues(cellIndex, $cell);
            if (notNull(txt)) {
              tmpArray[rowIndex][cellIndex] = txt;
            }
            cellIndex++;
          });
        }
      }
    });
    $.each(tmpArray, function( i, row ){
      if (notNull(row)) {
        // remove ignoredColumns / add onlyColumns
        let newRow = notNull(opts.onlyColumns) || opts.ignoreColumns.length ?
            $.grep(row, function(v, index){ return !ignoredColumn(index); }) : row,

          // remove ignoredColumns / add onlyColumns if headings is not defined
          newHeadings = notNull(opts.headings) ? headings :
            $.grep(headings, function(v, index){ return !ignoredColumn(index); });

        txt = arraysToHash(newHeadings, newRow);
        result[result.length] = txt;
      }
    });
    return result;
  };

  // Run
  let headings = getHeadings(table);
  return construct(table, headings);
};
