({
	handleSortRequest: function(component, event, helper) {
		var sortParams = event.getParams();
		component.set("v.sortBy", sortParams.SortBy);
		component.set("v.sortAsc", sortParams.SortAsc);
		helper.sort(component, event, helper);
		helper.toggleFilterSpinner(component, component.get("v.spinnerId"), false);
	},

	sort: function(component, event, helper, rows) {
		var sortBy = component.get("v.sortBy");
		if (rows === undefined || rows === null) {
			rows = component.get("v.displayedrows");
		}
		if (null != sortBy) {
			var columns = component.get("v.internalcolumns");
			rows.sort(this.sortComparer(sortBy, 'string', component.get("v.sortAsc")));
			component.set("v.currentpage", 0);
			component.set("v.movetopage", 0);
		}
		component.set("v.displayedrows", rows);
	},

	sortComparer: function(sortBy, dataType, sortAsc) {
		switch(dataType) {
			default: 
				return function (a, b) {
					var x = $A.util.isEmpty(a.datarow[sortBy]) === false ? a.datarow[sortBy] : '';
					var y = $A.util.isEmpty(b.datarow[sortBy]) === false ? b.datarow[sortBy] : '';
					if (x > y)
						return (true === sortAsc) ? 1 : -1;
					if (x < y)
						return (true === sortAsc) ? -1 : 1;
					return 0;
				}
		}
	},

	selectAll: function(component, event, helper) {
		var selected = component.find("selectAll").getElement().checked;
		var rows = component.get("v.displayedrows");
		//console.log(rows);
		rows.forEach(function(dr) {
			if (true === dr.rowstatus.Selectable)
				dr.cmeselected = selected;
		});
		component.set("v.displayedrows", rows);
		this.setSelectedList(component);
		var evt = component.getEvent("rowSelected");
		evt.fire();
	},

	datarowsChanged: function(component, event, helper) {
		//console.log('datarowschanged');
		var datarows = component.get("v.datarows");
		var internaldatarows = [], internalcolumns = [];
		var columns = component.get("v.columns");
		var selectAll = component.get("v.selectAll");
		var selectable = (null == component.get("v.primaryKey") || component.get("v.selectAllDefault") ===  true);
		var q = 0;
		datarows.map(function (dr) {
			var newdr = {datarow: dr, cmeid: q, cmeselected: false, cmeoutputlist: [], rowstatus: {Selectable: selectable, Error: ''}};
			columns.forEach(function (c) {
				var cmeoutput = {config: c, value: dr[c.PropertyName], visible: !(!$A.util.isEmpty(c.Visible) && (c.Visible === false))};
				if (c.Type) {
					switch (c.Type) {
						case 'Datetime' :
							var d = dr[c.PropertyName];
							if ($A.util.isEmpty(d) === false) {
								d = new Date(dr[c.PropertyName]);
								if ('Invalid Date' !== d)
									cmeoutput.value = d;
							}
							break;
						case 'SObjectLink' :
							cmeoutput.value = {RecordId: dr[c.IdField], Text: dr[c.PropertyName]};
							break;
						case 'Currency' :
							cmeoutput.value = {Amount: dr[c.PropertyName] || '', CurrencyCode: (dr[c.CurrencyCodeField] && null != dr[c.CurrencyCodeField]) ? dr[c.CurrencyCodeField] : c.CurrencyCode};
							break;
						case 'ActionGroup' :
						case 'ActionMenu' :
							var cc = JSON.parse(JSON.stringify(c));
							for (let x = 0; x < c.ActionList.length; x++) {
								var validator = c.ActionList[x].DisabledValidator;
								cc.ActionList[x].Validation =  (validator) ? validator(dr) : false;
							}
							cmeoutput.config = cc;
							break;
						default:
							break;
					}
				}
				newdr.cmeoutputlist.push(cmeoutput);
			});
			internaldatarows.push(newdr);
			q++;
		});
			//console.log(internaldatarows);

		var fo = [],  g=0;

		var ff = function(dr) {
					//console.log(dr[q]);
					var v = dr.cmeoutputlist[g].value;
					if (!$A.util.isEmpty(v)) {
						if (!v.map) {
							generateFilterOptions(v);
							//if (dr.cmeoutputlist[g].config.Type === 'Checkbox' && dr.cmeoutputlist[g].config.TrueLabel) {
							//	var label = v === true ? dr.cmeoutputlist[g].config.TrueLabel : dr.cmeoutputlist[g].config.FalseLabel;
							//	var opt = fo.filter(function (o) {
							//		return o.label == label;
							//	});
							//	if (opt.length == 0) {
							//		v = {label: label, value: v};
							//		fo.push(v);
							//	}
							//	return;
							//}
							//if (dr.cmeoutputlist[g].config.Type === 'SObjectLink') {
							//	v = v.Text;
							//}
							//if (dr.cmeoutputlist[g].config.Type === 'Datetime') {
							//	if (v) {
							//		var label = v.toLocaleString(undefined, dateConfig);
							//		if (-1 === rawDates.indexOf(label)) {
							//			v = {label: label, value: v, UTCvalue: v.toUTCString()};
							//			fo.push(v);
							//			rawDates.push(label);
							//		}
							//		return;
							//	}
							//}
							//if (v && -1 === fo.indexOf(v)) {
							//	fo.push(v);
							//}

						} else {
							v.map(function(v) { 
								generateFilterOptions(v);
							});
						}
					}

					function generateFilterOptions(v) {
						if ((dr.cmeoutputlist[g].config.Type === 'Checkbox' || dr.cmeoutputlist[g].config.Type === 'BooleanIcon') && dr.cmeoutputlist[g].config.TrueLabel) {
							var label = v === true ? dr.cmeoutputlist[g].config.TrueLabel : dr.cmeoutputlist[g].config.FalseLabel;
							var opt = fo.filter(function (o) {
								return o.label == label;
							});
							if (opt.length == 0) {
								v = {label: label, value: v};
								fo.push(v);
							}
							return;
						}
						if (dr.cmeoutputlist[g].config.Type === 'Currency') {
							v = (v.Amount) ? v.Amount.toLocaleString(undefined, {style: 'currency', currency: v.CurrencyCode}) : '';
						}
						if (dr.cmeoutputlist[g].config.Type === 'SObjectLink') {
							v = v.Text;
						}
						if (dr.cmeoutputlist[g].config.Type === 'Datetime') {
							if (v) {
								var label = v.toLocaleString(undefined, dateConfig);
								if (-1 === rawDates.indexOf(label)) {
									v = {label: label, value: v.toUTCString(), sortValue: v};
									fo.push(v);
									rawDates.push(label);
								}
								return;
							}
						}
						var opt = fo.filter(function (o) {
							return o.label == v;
						});
						if (opt.length == 0) {
							v = {label: v, value: v};
							fo.push(v);
						}
						return;
					}
				};

		var textFiltering = component.get("v.filterByText");
		var filterColumnsIndexList = component.get("v.filterColumnsIndexList");
		var filterHeaderList = {visible: [], other: [], get length() { return this.visible.length + this.other.length; }};
		const fl = component.get("v.p_filterlist");
		for(g=0; g < columns.length; g++) {
			if (!(!$A.util.isEmpty(columns[g].Visible) && (columns[g].Visible === false))) {
				internalcolumns.push(columns[g]);
			}
			if (columns[g].Filter && true === columns[g].Filter) {
				var config = columns[g];
				var dateConfig = null, rawDates = [];
				var isDate = false;
				if (config.Type && config.Type != null && config.Type === 'Datetime') {
					isDate = true;
					dateConfig = this.getDateConfig(config);
				}
				fo = [];
				internaldatarows.map(ff);
				if (config.Type && config.Type === 'Number') {
					fo.sort(function compareNumbers(a, b) {
						var x = $A.util.isEmpty(a.value) === false ? a.value : Number.NEGATIVE_INFINITY;
						var y = $A.util.isEmpty(b.value) === false ? b.value : Number.NEGATIVE_INFINITY;
						return x - y;
					});
				} else if (isDate === false) {
					fo.sort(function compareNumbers(a, b) {
						var x = a.label;
						var y = b.label;
						return x - y;
					});
				} else {
					fo.sort(function (a, b) {
						var x = $A.util.isEmpty(a.sortValue) === false ? a.sortValue : new Date(0);
						var y = $A.util.isEmpty(b.sortValue) === false ? b.sortValue : new Date(0);
						if (x > y)
							return 1;
						if (x < y)
							return -1;
						return 0;
					});
				}
				if (columns[g].FilterLocation) {
					switch (columns[g].FilterLocation) {
						case 'header' :
							//var dl = (columns[g].DefaultLabel) ? columns[g].DefaultLabel : 'All';
							const type = columns[g].Type || 'Text';
							var sv = [];
							fl.map(function(f) { if (f.field === columns[g].PropertyName) if (!f.value.map) sv.push(f.value); else sv = f.value;})
							const f = {Name: columns[g].PropertyName, Type: type, FilterOptions: fo, DefaultLabel: columns[g].DefaultLabel, Multiple: columns[g].FilterMultiple, SelectedValues: sv};
							const defaultFilters = component.get("v.filterHeadersDefault");
							if ($A.util.isEmpty(defaultFilters) || defaultFilters.indexOf(f.Name) != -1) {
								filterHeaderList.visible.push(f);
							} else {
								filterHeaderList.other.push(f);
							}
							break;
						default: 
							columns[g].FilterLocation = 'column';
							columns[g].FilterOptions = fo;
							break;
					}
				} else {
					columns[g].FilterLocation = 'column';
					columns[g].FilterOptions = fo;
				}
			}
			if (textFiltering === true) {
				if (columns[g].IncludeInTextFilter && columns[g].IncludeInTextFilter === true) {
					filterColumnsIndexList.push(g);
				}
			}
		}
		if (filterColumnsIndexList.length > 0) {
			//console.log('filter columns index list:');
			//console.log(filterColumnsIndexList);
			component.set("v.filterColumnsIndexList", filterColumnsIndexList);
		}
		if (filterHeaderList.length > 0) {
			component.set("v.filterHeaderList", filterHeaderList);
		}

		//console.log(columns);
		//console.log(internaldatarows);
		component.set("v.internalcolumns", internalcolumns);
		component.set("v.internaldatarows", internaldatarows);
	},

	internaldatarowsChanged: function (component, event, helper, idr) {
		if (idr === undefined || idr === null) {
			idr = component.get("v.internaldatarows");
		}
		//component.set("v.displayedrows", idr);
		this.setSelectedList(component, idr);
		this.sort(component, event, helper, idr);
	},

	setSelectedList:function (component, idr) {
		if (idr === undefined || idr === null) {
			idr = component.get("v.displayedrows");
		}
		//var selected = [];
		//idr.map(function(dr) {
		//	if (true === dr.cmeselected)
		//		selected.push(dr.datarow);
		//});
		//var selected = idr.filter(function(dr) {
		//	return true === dr.cmeselected;
		//});
		var selected = [];
		idr.map(function(dr) {
			if (true === dr.cmeselected) {
				selected.push(dr.datarow);
			}
		});
		//console.log(selected);
		component.set("v.selectedrows", selected);
	},

	handleRowSelected: function (component, event, helper) {
		//console.log('root handle row selected');
		//component.set("v.internaldatarows", rows);
		//console.log(rows);
		//console.log(current);
		var singlemode = !component.get("v.multiSelect");
		if (true === singlemode) {
			var selectedRow = event.getParam("SelectedRow");
			//console.log('selected row:')
			//console.log(selectedRow);
			if (null != selectedRow) {
				var rows = component.get("v.displayedrows");
				for (var q = 0; q < rows.length; q++) {
					//console.log(rows[q].cmeid);
					if (selectedRow.cmeid !== rows[q].cmeid) {
						//console.log('reset previous selected row');
						rows[q].cmeselected = false;
					}
				}
				component.set("v.displayedrows", rows);
			}
			event.setParam("SelectedRow", selectedRow.datarow);
		}
		helper.setSelectedList(component);
		if (false === singlemode)
			component.find("selectAll").getElement().checked = component.get("v.selectedrows").length === component.get("v.datarows").length;
	},

	filter: function(component, helper) {
		//console.log('filter');
		//console.log(component.get("v.filterlist"));

		const self = this;

		var fl = component.get("v.p_filterlist");
		var rows = component.get("v.internaldatarows");
		var filterColumnsIndexList = null;

		var config = component.get("v.columns");
		var pills = [];
		//console.log(rows.length);
		if (fl.length > 0) {
			fl.map(function(f) {
				switch (f.type) {
					case "Col" :
						if (component.get("v.displayFilterPills")) {
							const column = config.filter(function(c) { return c.PropertyName === f.field; })[0];
							if (f.isExternal === undefined || f.isExternal === false) {
								if (!f.value.map) {
									getFilterPill(f.field, f.value, f.value, column);
								} else {
									f.value.map(function(fv) {
										getFilterPill(f.field, fv, fv, column);
									});
								}

								function getFilterPill(field, label, value, column) {
									var filterPillData = {field: field, label: label, value: value, icon: column.FilterPillIcon};
									if (column.Type === 'Checkbox' || column.Type === 'BooleanIcon') {
										filterPillData.label = (value == true || value == 'true') ? column.TrueLabel || true : column.FalseLabel || false;
									} else if (column.Type === 'SObjectLink') {
									} else if (column.Type === 'Datetime') {
										filterPillData.label = value.toLocaleString(undefined, self.getDateConfig(column));
									} else if (column.Type === 'Number') {
									} else if (column.Type === 'Currency') {
										//return !($A.util.isEmpty(datavalue) || $A.util.isEmpty(datavalue.Amount)) ?  ((datavalue.Amount.toLocaleString) ? datavalue.Amount.toLocaleString(undefined, {style: 'currency', currency: datavalue.CurrencyCode}) : '') === filtervalue : false;
									}

									pills.push({
										type: ($A.util.isEmpty(filterPillData.icon)) ? null : 'icon',
										label: filterPillData.label,
										iconName: filterPillData.icon,
										alternativeText: filterPillData.label,
										name: filterPillData.field + '|' + filterPillData.value
									});
								}
							}
						}

						rows = rows.filter(function(idr) {
								for(var q=0; q < idr.cmeoutputlist.length; q++) {
									var d = idr.cmeoutputlist[q];
									if (!$A.util.isEmpty(d.value) && f.field === d.config.PropertyName) {
										//TODO: optimize?
										if (!d.value.map) {
											if (!f.value.map) {
												return testValue(d.config, d.value, f.value);
											} else {
												for (var y = 0; y < f.value.length; y++) {
													if (testValue(d.config, d.value, f.value[y])) {
														return true;
													}
												}
											}
										} else {
											for (var x = 0; x < d.value.length; x++) {
												if (!f.value.map) {
													if (testValue(d.config, d.value[x], f.value)) {
														return true;
													}
												} else {
													for (var y = 0; y < f.value.length; y++) {
														if (testValue(d.config, d.value[x], f.value[y])) {
															return true;
														}
													}
												}
											}
										}
									} 
								}
								return false;

								function testValue(config, datavalue, filtervalue) {
									if (config.Type === 'Checkbox' || config.Type === 'BooleanIcon') {	// && d.config.TrueLabel
										//d.value ? d.config.TrueLabel : d.config.FalseLabel;
										//return v === f.value;
										//filterPillData = {icon: config.FilterPillIcon, label: filtervalue == true ? config.TrueLabel || true : config.FalseLabel || false};
										return datavalue.toString() === filtervalue.toString();
									} else if (config.Type === 'SObjectLink') {
										return datavalue.Text === filtervalue;
									} else if (config.Type === 'Datetime') {
										//filterPillData = {icon: config.FilterPillIcon, label: filtervalue.toLocaleString(undefined, self.getDateConfig(config))};
										return (datavalue) ?  datavalue.toUTCString() === ((filtervalue.toUTCString) ? filtervalue.toUTCString() : filtervalue) : false;
									} else if (config.Type === 'Number') {
										return (datavalue) ?  Number(datavalue) === Number(filtervalue) : false;
									} else if (config.Type === 'Currency') {
										return !($A.util.isEmpty(datavalue) || $A.util.isEmpty(datavalue.Amount)) ?  ((datavalue.Amount.toLocaleString) ? datavalue.Amount.toLocaleString(undefined, {style: 'currency', currency: datavalue.CurrencyCode}) : '') === filtervalue : false;
									} else {
										return datavalue === filtervalue;
									}
								}
							});

							component.set("v.filterPills", pills);
						
						break;

					case "Text" :
						rows = rows.filter(function(idr) {
							if (null === filterColumnsIndexList) {
								filterColumnsIndexList = component.get("v.filterColumnsIndexList");
							}
							var match = false;
							for(var q=0; q < filterColumnsIndexList.length; q++) {
								//console.log(idr.cmeoutputlist[q].value);
								if (idr.cmeoutputlist[filterColumnsIndexList[q]].config.IncludeInTextFilter && true === idr.cmeoutputlist[filterColumnsIndexList[q]].config.IncludeInTextFilter) {
									var data = idr.datarow[idr.cmeoutputlist[filterColumnsIndexList[q]].config.PropertyName];
									match = data && -1 !== String(data).toLowerCase().indexOf(f.value.toLowerCase());
								} 
								if (match === true)
									return match;
							}
							return match;
						});
						break;
					default:
						break;
				}
			});
		} else {
			component.set("v.filterPills", []);
		}
		//console.log(rows);
		try { component.set("v.displayedrows", rows); } catch(exc) {/*buttonIcon sometimes throws an exception when being destroyed so just eat it */}

		helper.toggleFilterSpinner(component, component.get("v.spinnerId"), false);
	},
/*
	filterByCol: function (component, event, helper) {
		var filterOptions = event.getParams();
		//console.log(filterOptions);
		var rows = component.get("v.displayedrows");
		var filteredlist;
		if ("All" !== filterOptions.value) {
			filteredlist = rows.filter(function(idr) {
				for(var q=0; q < idr.cmeoutputlist.length; q++) {
					var d = idr.cmeoutputlist[q];
					if (filterOptions.column === d.config.PropertyName) {
						if (d.config.Type === 'Checkbox' && d.config.TrueLabel) {
							var v = d.value ? d.config.TrueLabel : d.config.FalseLabel;
							return v === filterOptions.value;
						} else {
							return d.value === filterOptions.value;
						}
					} 
				}
				return false;
			});
		} else {
			filteredlist = rows;
		}
		//console.log(filteredlist);
		try {
			component.set("v.displayedrows", filteredlist);
		} catch (e) {}
		this.setSelectedList(component);
		helper.toggleFilterSpinner(component, "cme-datagrid-clientworking", false);
	},

	filterByText: function (component, helper, text) {
		var internaldatarows = component.get("v.internaldatarows");
		var filteredlist;
		if ("" !== text) {
			var filterColumnsIndexList = component.get("v.filterColumnsIndexList");
			var match;
			var data;
			filteredlist = internaldatarows.filter(function(idr) {
				match = false;
				for(var q=0; q < filterColumnsIndexList.length; q++) {
					//console.log(idr.cmeoutputlist[q].value);
					if (idr.cmeoutputlist[filterColumnsIndexList[q]].config.IncludeInTextFilter && true === idr.cmeoutputlist[filterColumnsIndexList[q]].config.IncludeInTextFilter) {
						data = idr.datarow[idr.cmeoutputlist[filterColumnsIndexList[q]].config.PropertyName];
						match = data && -1 !== String(data).toLowerCase().indexOf(text.toLowerCase());
					} 
					if (match === true)
						return match;
				}
				return match;
			});
		} else {
			filteredlist = internaldatarows;
		}
		//console.log(filteredlist);
		try {
			component.set("v.displayedrows", filteredlist);
		} catch (e) {}
		this.setSelectedList(component);
		helper.toggleFilterSpinner(component, "cme-datagrid-clientworking", false);
	},
*/
	processExternalFilter: function(component, filterOptions) {
		filterOptions.map(function(f) { f.isExternal = true; });
		this.processFilter(component, filterOptions);
	},

	processFilter: function(component, filterOptions) {
		var fl = component.get("v.p_filterlist");
		if (filterOptions.map === undefined) {
			filterOptions = [filterOptions];
		}

		filterOptions.map(function(fo) {
			for (var x = 0; x < fl.length; x++) {
				if (fl[x].field === fo.column) {
					fl.splice(x, 1);
					break;
				}
			}
			//if ("All" !== filterOptions.value || !(filterOptions.value.length && filterOptions.value.length !== 0)) {
			if ((fo.value.map !== undefined) ? fo.value.length !== 0 : "All" !== fo.value) {
				fl.push({type: 'Col', field: fo.column, value: fo.value, isExternal: fo.isExternal});
			}
		});
		//console.log(fl);
		component.set("v.p_filterlist", fl);
	},

	updateSelectable: function(component, event, handler) {
		var pk = component.get("v.primaryKey");

		if (null != pk) {
			//console.log(event.getParams());
			var rsl = event.getParam("arguments").RowStatusList;
			//console.log(rsl);
			var datarows = component.get("v.displayedrows");
			//console.log(datarows);
			for(var a = 0; a < rsl.length; a++) {
				for(var b = 0; b < datarows.length; b++) {
					if (datarows[b].datarow[pk] === rsl[a].PrimaryKey) {
						//console.log('got it!');
						if (false === rsl[a].Selectable)
							datarows[b].cmeselected = false;
						datarows[b].rowstatus.Selectable = rsl[a].Selectable;
						datarows[b].rowstatus.Error = rsl[a].Error;
						break;
					}
				}
			}
			component.set("v.displayedrows", datarows);
			//this.setSelectedList(component);
		}
	},

	initPaging: function(component) {
		//console.log('initPaging');
		var pageSize = parseInt(component.get("v.pageSize"));
		var displayedrows = component.get("v.displayedrows");
		if (displayedrows.length > pageSize) {
			var pages = [];
			var x = 0;
			while(x < displayedrows.length) {
				var page = displayedrows.slice(x, x + pageSize);
				pages.push(page);
				x += pageSize
			}
			component.set("v.pagedrows", pages[0]);
			component.set("v.pages", pages);
		} else {
			component.set("v.pagedrows", displayedrows);
			component.set("v.pages", [displayedrows]);
		}
		component.set("v.currentpage", 0);
		component.set("v.movetopage", 0);
	},

	setPaging: function(component, helper) {
		var movetopage = component.get("v.movetopage");
		component.set("v.currentpage", movetopage);
		component.set("v.pagedrows", component.get("v.pages")[movetopage]);

//		console.log('setPaging');
//		var pageSize = component.get("v.pageSize");
//		var displayedrows = component.get("v.displayedrows");
//		if (displayedrows.length > pageSize) {
//			var currentPage = component.get("v.currentpage");
//			var currentIndex = currentPage*pageSize
//			var page = displayedrows.slice(currentIndex, currentIndex+pageSize);
//			component.set("v.pagedrows", page);
//		} else {
//			component.set("v.pagedrows", displayedrows);
//		}
		helper.toggleFilterSpinner(component, component.get("v.spinnerId"), false);
	},

	toggleFilterSpinner: function(component, id, show) {
		//using native DOM seems to be a bit faster than using lightning methods
		var w = document.getElementById(id);
		if (w)
			w.className= (show === true) ? "" : "cme-datagrid-hidden";
	},

	detectContainer: function(component) {
		const isSFOne = !$A.util.isEmpty($A.get("e.force:navigateToSObject"));
		console.log('isSFOne: ' + isSFOne);
		component.set("v.isSFOne", isSFOne);
	},

	getDateConfig: function(config) {
		return { 
					year: config.Format.Year, month: config.Format.Month, day: config.Format.Day
					, hour: config.Format.Hour, hour12: config.Format.Hour12, minute: config.Format.Minute, second: config.Format.Second
					, weekday: config.Format.Weekday
					, timeZone: config.Format.TimeZone, timeZoneName: config.Format.TimeZoneName
				};
	}
})