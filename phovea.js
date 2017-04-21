/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */

//register all extensions in the registry following the given pattern
module.exports = function(registry) {
  //registry.push('extension-type', 'extension-id', function() { return System.import('./src/extension_impl'); }, {});
  // generator-phovea:begin
  registry.push('app', 'valid', function() { return System.import('./src/'); }, {
    'name': 'VALID'
  });

   registry.push('validView', 'ValidHeader', function() { return System.import('./src/valid_header'); }, {
    'name': 'ValidHeader'
  });
  
  registry.push('validView', 'Filter', function() { return System.import('./src/filter'); }, {
    'name': 'Filter'
  });
  
  registry.push('validView', 'GlobalSettings', function() { return System.import('./src/global_settings'); }, {
    'name': 'GlobalSettings'
  });
  
  registry.push('validView', 'SankeyFeatures', function() { return System.import('./src/sankey_features'); }, {
    'name': 'SankeyFeatures'
  });

  registry.push('validView', 'SankeyDiagram', function() { return System.import('./src/sankey_diagram'); }, {
    'name': 'SankeyDiagram'
  });
  // generator-phovea:end
};

